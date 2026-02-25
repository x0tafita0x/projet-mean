const Panier = require("../models/panier.model");
const Achat = require("../models/achat.model");
const AchatInfo = require("../models/achatInfo.model");
const Boutique = require("../models/boutique.model");
const CommissionConfig = require("../models/commissionConfig.model");

/**
 * POST /api/panier/valider
 * Corps attendu : { panierIds: [id, ...] }
 *
 * Logique :
 *  1. Récupérer les lignes panier (populate produit → boutique)
 *  2. Calculer le total
 *  3. Déterminer la boutique (via le produit de la première ligne)
 *  4. Calculer la commission (taux boutique prioritaire, sinon taux global)
 *  5. Créer l'Achat
 *  6. Créer les AchatInfo (lignes de détail)
 *  7. Marquer les paniers comme "validé"
 */
exports.validerPanier = async (req, res) => {
    try {
        const { panierIds } = req.body;
        const clientId = req.user?.id || req.body.clientId;

        if (!panierIds || !Array.isArray(panierIds) || panierIds.length === 0) {
            return res.status(400).json({ error: "Aucun élément de panier fourni." });
        }

        // 1. Récupérer les lignes avec leur produit et boutique
        const lignes = await Panier.find({ _id: { $in: panierIds } }).populate({
            path: "produit",
            populate: { path: "boutique" },
        });

        if (lignes.length === 0) {
            return res.status(404).json({ error: "Lignes de panier introuvables." });
        }

        // 2. Total
        const total = lignes.reduce((sum, l) => sum + l.prix * l.quantite, 0);

        // 3. Boutique (première ligne)
        const boutiqueId = lignes[0]?.produit?.boutique?._id || null;

        // 4. Commission
        let taux = 0;
        if (boutiqueId) {
            const boutique = await Boutique.findById(boutiqueId);
            if (boutique && boutique.tauxCommission !== null && boutique.tauxCommission !== undefined) {
                taux = boutique.tauxCommission;
            } else {
                const config = await CommissionConfig.findOne();
                taux = config ? config.tauxGlobal : 0;
            }
        } else {
            const config = await CommissionConfig.findOne();
            taux = config ? config.tauxGlobal : 0;
        }

        const commission = (total * taux) / 100;

        // 5. Créer l'Achat
        const achat = await Achat.create({
            client: clientId,
            boutique: boutiqueId,
            total,
            commission,
        });

        // 6. Créer les lignes de détail (AchatInfo)
        const achatInfos = await AchatInfo.insertMany(
            lignes.map(l => ({
                achat: achat._id,
                produit: l.produit._id,
                prix: l.prix,
                quantite: l.quantite,
            }))
        );

        // 7. Marquer les paniers comme validés
        await Panier.updateMany({ _id: { $in: panierIds } }, { etat: "validé" });

        res.status(201).json({ achat, lignes: achatInfos });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
