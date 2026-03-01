const Boutique = require("../models/boutique.model");
const Produit = require("../models/produit.model");
const CommissionConfig = require("../models/commissionConfig.model");
const etatService = require("./etat.service");
const ETATS = require("../utils/etat.constants");

exports.extractAchatInfo = async (paniers) => {
    try {
        const etatId = await etatService.getEtatIdByNom(ETATS.EN_ATTENTE);
        const achatInfos = paniers.map(panier => ({
            panier: panier._id,
            prix: panier.prix,
            quantite: panier.quantite,
            etat: etatId
        }));
        console.log("AchatInfos extraites:", achatInfos);
        return achatInfos;
    } catch (err) {
        throw new Error(`Erreur lors de l'extraction des informations d'achat: ${err.message}`);
    }
};

exports.extractAchat = async (paniers) => {
    try {
        const firstPanier = paniers[0];
        const total = paniers.reduce((acc, p) => acc + (p.prix * p.quantite), 0);
        const nombreItems = paniers.reduce((acc, p) => acc + p.quantite, 0);

        let boutiqueId = null;
        let commission = 0;

        if (firstPanier && firstPanier.produit) {
            const product = await Produit.findById(firstPanier.produit);
            if (product) {
                boutiqueId = product.boutique;
                const boutique = await Boutique.findById(boutiqueId);
                const globalConfig = await CommissionConfig.findOne();

                const rate = (boutique && boutique.tauxCommission !== null)
                    ? boutique.tauxCommission
                    : (globalConfig ? globalConfig.tauxGlobal : 5);

                commission = (total * rate) / 100;
            }
        }

        return {
            client: firstPanier.utilisateur,
            boutique: boutiqueId,
            total,
            commission,
            nombreItems
        };
    } catch (err) {
        throw new Error(`Erreur lors de l'extraction des données d'achat: ${err.message}`);
    }
};