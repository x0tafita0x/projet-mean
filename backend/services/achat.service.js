const achat = require("../models/achat.model");
const achatInfo = require("../models/achatInfo.model");
const panier = require("../models/panier.model");

exports.extractAchatInfo = (paniers) => {
    try {
        const achatInfos = paniers.map(panier => ({
            panier: panier._id,
            prix: panier.prix,
            quantite: panier.quantite
        }));
        console.log("AchatInfos extraites:", achatInfos);
        return achatInfos;
    } catch (err) {
        throw new Error(`Erreur lors de l'extraction des informations d'achat: ${err.message}`);
    }
};

exports.extractAchat = (paniers) => {
    try {
        const achatData = { 
            client: paniers[0].utilisateur,
            total : paniers.reduce((total, panier) => total + (panier.prix * panier.quantite), 0),
            nombreItems: paniers.reduce((total, panier) => total + panier.quantite, 0)
        };
        return achatData;
    } catch (err) {
        throw new Error(`Erreur lors de l'extraction des données d'achat: ${err.message}`);
    }
};