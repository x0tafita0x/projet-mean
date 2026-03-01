const Etat = require("../models/etat.model");

let cachedEtats = null;

const getEtats = async () => {
    if (!cachedEtats) {
        cachedEtats = await Etat.find();
    }
    return cachedEtats;
};

const getEtatIdByNom = async (nom) => {
    const etats = await getEtats();
    const etat = etats.find(e => e.nom === nom);
    if (!etat) {
        const freshEtat = await Etat.findOne({ nom });
        if (freshEtat) {
            cachedEtats.push(freshEtat);
            return freshEtat._id;
        }
        throw new Error(`Etat "${nom}" non trouvé dans la base de données.`);
    }
    return etat._id;
};

const clearCache = () => {
    cachedEtats = null;
};

module.exports = {
    getEtats,
    getEtatIdByNom,
    clearCache
};
