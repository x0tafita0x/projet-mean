const Favori = require("../models/favori.model");
const { paginate } = require("../utils/pagination");
// créer un favori
exports.createFavori = async (req, res) => {
  try {
    const favori = await Favori.create(req.body);
    res.status(201).json(favori);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister tous les favoris
exports.getAllFavoris = async (req, res) => {
  try {
    const { utilisateur, boutique, page, limit } = req.query;
    const filter = {};
    if (utilisateur) filter.utilisateur = utilisateur;
    if (boutique) filter.boutique = boutique;
    console.log('Filter applied:', filter);

    const result = await paginate(Favori, filter, page, limit, {
      path: "boutique",
      select: "nom photo",
      populate: 
        { path: "typeBoutique", select: "nom" }
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.isFavoriteExist = async (req, res) => {
  try {
    const { utilisateur, boutique } = req.query;
    const filter = {};
    if (utilisateur) filter.utilisateur = utilisateur;
    if (boutique) filter.boutique = boutique;

    const favori = await Favori.findOne(filter);
    res.json(favori ? { exists: true } : { exists: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un favori
exports.deleteFavori = async (req, res) => {
  try {
    const favori = await Favori.findByIdAndDelete(req.params.id);
    if (!favori) return res.status(404).json({ error: "Favori non trouvé" });
    res.json({ message: "Favori supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};