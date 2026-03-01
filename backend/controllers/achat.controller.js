const achat = require("../models/achat.model");
const achatInfo = require("../models/achatInfo.model");
const panier = require("../models/panier.model");
const achatService = require("../services/achat.service");
const panierController = require("./panier.controller");
const mongoose = require("mongoose");
const { paginate } = require("../utils/pagination");
const etatService = require("../services/etat.service");
const ETATS = require("../utils/etat.constants");


exports.createAchat = async (req, res) => {
    try {
        const paniers = req.body.map(data => new panier(data));
        const achatData = await achatService.extractAchat(paniers);
        const achatInfos = await achatService.extractAchatInfo(paniers);
        const newAchat = await achat.create(achatData);
        const newAchatInfos = await achatInfo.insertMany(achatInfos.map(info => ({ ...info, achat: newAchat._id })));
        const panierValidate = await panierController.validerPaniers(req, res);
        res.status(201).json(newAchat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAchatById = async (req, res) => {
    try {
        const achatId = req.params.achatId;
        const achatData = await achat.findById(achatId).populate('client')
        if (!achatData) {
            return res.status(404).json({ error: "Achat non trouvé" });
        }
        res.status(200).json(achatData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAchatsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        const filter = { client: userId };

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const result = await paginate(
            achat,
            filter,
            Number(page),
            Number(limit),
            '',
            { createdAt: -1 }
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAchatDetails = async (req, res) => {
    try {
        const achatId = req.params.achatId;
        const achatDetails = await achatInfo.find({ achat: achatId }).populate([{
            path: 'panier',
            select: 'dateHeureRecuperation',
            populate: {
                path: 'produit',
                select: 'nom',
                populate: {
                    path: 'boutique',
                    select: 'nom numeroTelephone',
                }
            }
        }, { path: 'etat', select: 'nom' }]);

        res.status(200).json(achatDetails);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.achatRecent = async (req, res) => {
    const { client } = req.query;
    const filter = {};
    if (client) filter.client = client;
    try {
        const recentAchats = await achat.find(filter).sort({ createdAt: -1 }).limit(3);
        res.status(200).json(recentAchats);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.listCommmandes = async (req, res) => {
    try {
        const { boutique, etat } = req.params;
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        const boutiqueId = boutique ? new mongoose.Types.ObjectId(boutique) : null;
        const etatId = etat ? new mongoose.Types.ObjectId(etat) : null;

        const skip = (Number(page) - 1) * Number(limit);

        const matchStage = { "produitDetails.boutique": boutiqueId, "etat": etatId };

        if (startDate || endDate) {
            matchStage["panierDetails.dateHeureRecuperation"] = {};
            if (startDate) matchStage["panierDetails.dateHeureRecuperation"].$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchStage["panierDetails.dateHeureRecuperation"].$lte = end;
            }
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'achats',
                    localField: 'achat',
                    foreignField: '_id',
                    as: 'achatDetails'
                }
            },
            {
                $unwind: '$achatDetails'
            },
            {
                $lookup: {
                    from: 'paniers',
                    localField: 'panier',
                    foreignField: '_id',
                    as: 'panierDetails'
                }
            },
            { $unwind: '$panierDetails' },
            {
                $lookup: {
                    from: 'utilisateurs',
                    localField: 'panierDetails.utilisateur',
                    foreignField: '_id',
                    as: 'clientDetails'
                }
            },
            { $unwind: '$clientDetails' },

            {
                $lookup: {
                    from: 'produits',
                    localField: 'panierDetails.produit',
                    foreignField: '_id',
                    as: 'produitDetails'
                }
            },
            { $unwind: '$produitDetails' },

            { $match: matchStage },
            {
                $group: {
                    _id: '$achat',
                    totalPrix: { $sum: { $multiply: ["$quantite", "$prix"] } },
                    totalQuantite: { $sum: "$quantite" },
                    dateRecuperation: { $first: "$panierDetails.dateHeureRecuperation" },
                    createdAt: { $first: "$achatDetails.createdAt" },
                    client: { $first: "$clientDetails.nom" },
                    etat: { $first: "$etat" }
                }
            }
        ];

        const [commandes, totalCount] = await Promise.all([
            achatInfo.aggregate([
                ...pipeline,
                { $sort: { dateRecuperation: -1 } },
                { $skip: skip },
                { $limit: Number(limit) },
                {
                    $project: {
                        _id: 1,
                        totalPrix: 1,
                        totalQuantite: 1,
                        dateRecuperation: 1,
                        createdAt: 1,
                        client: 1,
                        etat: 1
                    }
                }
            ]),
            achatInfo.aggregate([
                ...pipeline,
                { $count: "total" }
            ])
        ]);

        const total = totalCount[0]?.total || 0;

        res.status(200).json({
            data: commandes,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.commandeDetails = async (req, res) => {
    try {
        const { achat, boutique } = req.query;
        const filter = {};
        if (achat) {
            filter.achat = new mongoose.Types.ObjectId(achat);
        }
        const boutiqueId = new mongoose.Types.ObjectId(boutique);

        const achatDetails = await achatInfo.find(filter).populate({
            path: 'panier',
            select: 'utilisateur',
            match: { etat: { $ne: new mongoose.Types.ObjectId("69a16acd5cfdcd12fecbf82f") } },
            populate: {
                path: 'produit',
                select: 'nom photo',
                populate: [
                    {
                        path: 'boutique',
                        select: 'nom numeroTelephone',
                        match: { _id: boutiqueId }
                    },
                    {
                        path: 'sousTypeProduit',
                        select: 'nom'
                    }
                ]
            }
        });
        res.status(200).json(achatDetails);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.ChangeToCommandeARecuperer = async (req, res) => {
    try {
        const { achatId, boutiqueId } = req.params;
        const etatId = await etatService.getEtatIdByNom(ETATS.A_RECUPERER);
        const result = await achatInfo.updateMany(
            { achat: new mongoose.Types.ObjectId(achatId), boutique: new mongoose.Types.ObjectId(boutiqueId), etat: etatId },
            { $set: { etat: etatId } }
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.ChangeToCommandePayeEtRecupere = async (req, res) => {
    try {
        const { achatId } = req.params;
        const etatId = await etatService.getEtatIdByNom(ETATS.PAYEE_ET_RECUPEREE);
        const result = await achatInfo.updateMany(
            { achat: new mongoose.Types.ObjectId(achatId) },
            { $set: { etat: etatId } }
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.ChangeToCommandeAnnule = async (req, res) => {
    try {
        const { achatInfoId } = req.params;
        const etatId = await etatService.getEtatIdByNom(ETATS.ANNULEE);
        const result = await achatInfo.updateMany(
            { _id: new mongoose.Types.ObjectId(achatInfoId) },
            { $set: { etat: etatId } }
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// --- Admin Methods ---

exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', clientId = '', boutiqueId = '', startDate, endDate } = req.query;
        const filter = {};

        if (clientId) {
            filter.client = clientId;
        }

        if (boutiqueId) {
            filter.boutique = boutiqueId;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const result = await paginate(
            achat,
            filter,
            Number(page),
            Number(limit),
            [
                { path: "client", select: "nom email" },
                { path: "boutique", select: "nom" }
            ],
            { createdAt: -1 }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await achat.findById(req.params.id)
            .populate("client", "nom email")
            .populate("boutique", "nom");
        if (!order) return res.status(404).json({ error: "Commande non trouvée" });
        const lignes = await achatInfo.find({ achat: req.params.id }).populate({
            path: 'panier',
            populate: { path: 'produit', select: 'nom' }
        });
        res.json({ order, lignes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};