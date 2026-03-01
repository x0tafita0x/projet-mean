const mongoose = require("mongoose");
const Produit = require("../models/produit.model");
const MouvementProduit = require("../models/mouvementProduit.model");
const Achat = require("../models/achat.model");
const AchatInfo = require("../models/achatInfo.model");
const Panier = require("../models/panier.model");
const Etat = require("../models/etat.model");
const etatService = require("../services/etat.service");
const ETATS = require("../utils/etat.constants");

exports.getDashboardStats = async (req, res) => {
    try {
        const boutiqueId = new mongoose.Types.ObjectId(req.params.id);
        const { startDate, endDate } = req.query;

        // Build date filter
        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.createdAt.$lte = end;
            }
        }

        const etatIdPayeRecupere = await etatService.getEtatIdByNom(ETATS.PAYEE_ET_RECUPEREE);

        // 1. KPI: Produits (Total is generally reflecting current state, but we filter if needed)
        const totalProduits = await Produit.countDocuments({ boutique: boutiqueId });

        // Calcul du stock pour chaque produit (Stock is current state, not really date filtered usually)
        const stocks = await MouvementProduit.aggregate([
            { $match: { boutique: boutiqueId } },
            {
                $group: {
                    _id: "$produit",
                    totalIn: { $sum: "$in" },
                    totalOut: { $sum: "$out" }
                }
            },
            {
                $project: {
                    stock: { $subtract: ["$totalIn", "$totalOut"] }
                }
            }
        ]);

        const produitsActifs = stocks.filter(s => s.stock > 0).length;
        const produitsRupture = stocks.filter(s => s.stock <= 0).length;

        // 2. KPI: Commandes
        let panierMatch = { "produitDetails.boutique": boutiqueId };
        if (dateFilter.createdAt) {
            panierMatch.createdAt = dateFilter.createdAt;
        }

        const paniersBoutique = await Panier.aggregate([
            {
                $lookup: {
                    from: "produits",
                    localField: "produit",
                    foreignField: "_id",
                    as: "produitDetails"
                }
            },
            { $unwind: "$produitDetails" },
            { $match: panierMatch },
            {
                $lookup: {
                    from: "etats",
                    localField: "etat",
                    foreignField: "_id",
                    as: "etatDetails"
                }
            },
            { $unwind: { path: "$etatDetails", preserveNullAndEmptyArrays: true } }
        ]);

        const etatIdEnAttente = await etatService.getEtatIdByNom(ETATS.EN_ATTENTE);
        const etatIdValidee = await etatService.getEtatIdByNom(ETATS.VALIDEE);
        const etatIdARecuperer = await etatService.getEtatIdByNom(ETATS.A_RECUPERER);
        const etatIdAnnulee = await etatService.getEtatIdByNom(ETATS.ANNULEE);

        const toStr = (id) => id ? id.toString() : "";

        let cmdAttente = 0;
        let cmdARecuperer = 0;
        let cmdPayeeRecuperee = 0;
        let cmdAnnulees = 0;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        paniersBoutique.forEach(p => {
            const etatId = toStr(p.etat);
            if (etatId === toStr(etatIdEnAttente)) {
                cmdAttente++;
            } else if (etatId === toStr(etatIdValidee) || etatId === toStr(etatIdARecuperer)) {
                cmdARecuperer++;
            } else if (etatId === toStr(etatIdPayeRecupere)) {
                cmdPayeeRecuperee++;
            } else if (etatId === toStr(etatIdAnnulee)) {
                cmdAnnulees++;
            }
        });

        // 3. KPI: Financier
        // Filter ONLY paid and collected orders for revenue
        const validAchatIds = await AchatInfo.distinct("achat", { etat: etatIdPayeRecupere });

        let revenueMatch = {
            boutique: boutiqueId,
            _id: { $in: validAchatIds },
            ...dateFilter
        };

        const achats = await Achat.find(revenueMatch);
        const cA_total = achats.reduce((acc, a) => acc + a.total, 0);
        const commission_total = achats.reduce((acc, a) => acc + (a.commission || 0), 0);
        const revenus_nets = cA_total - commission_total;

        // For CA Mois
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const achatsMois = achats.filter(a => new Date(a.createdAt) >= startOfMonth);
        const cA_mois = achatsMois.reduce((acc, a) => acc + a.total, 0);

        // 4. Graphiques
        // Ventes sur les 7 derniers jours (OR full filtered range)
        let chart7DayMatch = { ...revenueMatch };
        if (!dateFilter.createdAt) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            chart7DayMatch.createdAt = { $gte: sevenDaysAgo };
        }

        const ventes7Jours = await Achat.aggregate([
            { $match: chart7DayMatch },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Ventes par mois
        let chartMonthMatch = { ...revenueMatch };
        if (!dateFilter.createdAt) {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            chartMonthMatch.createdAt = { $gte: startOfYear };
        }

        const ventesParMois = await Achat.aggregate([
            { $match: chartMonthMatch },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top 5 produits
        let topProdMatch = {
            "achatDetails.boutique": boutiqueId,
            "etat": etatIdPayeRecupere
        };
        if (dateFilter.createdAt) {
            topProdMatch["achatDetails.createdAt"] = dateFilter.createdAt;
        }

        const topProduits = await AchatInfo.aggregate([
            { $match: { etat: etatIdPayeRecupere } },
            {
                $lookup: {
                    from: "achats",
                    localField: "achat",
                    foreignField: "_id",
                    as: "achatDetails"
                }
            },
            { $unwind: "$achatDetails" },
            { $match: topProdMatch },
            {
                $lookup: {
                    from: "paniers",
                    localField: "panier",
                    foreignField: "_id",
                    as: "panierDetails"
                }
            },
            { $unwind: "$panierDetails" },
            {
                $group: {
                    _id: "$panierDetails.produit",
                    quantiteVendue: { $sum: "$quantite" },
                    totalGenere: { $sum: "$prix" }
                }
            },
            { $sort: { quantiteVendue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "produits",
                    localField: "_id",
                    foreignField: "_id",
                    as: "produitDetails"
                }
            },
            { $unwind: "$produitDetails" },
            {
                $project: {
                    _id: 0,
                    nom: "$produitDetails.nom",
                    quantiteVendue: 1,
                    totalGenere: 1
                }
            }
        ]);

        res.json({
            kpis: {
                produits: {
                    total: totalProduits,
                    actifs: produitsActifs,
                    rupture: produitsRupture
                },
                commandes: {
                    enAttente: cmdAttente,
                    aRecuperer: cmdARecuperer,
                    payeeEtRecuperee: cmdPayeeRecuperee,
                    annulees: cmdAnnulees
                },
                financier: {
                    caTotal: cA_total,
                    caMois: cA_mois,
                    commission: commission_total,
                    revenusNets: revenus_nets
                }
            },
            graphiques: {
                ventes7Jours: ventes7Jours.map(v => ({ date: v._id, total: v.total })),
                ventesParMois: ventesParMois.map(v => ({ mois: v._id, total: v.total })),
                topProduits
            }
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des statistiques" });
    }
};
