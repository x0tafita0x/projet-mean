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
    const { utilisateur, produit, page, limit } = req.query;
    const filter = {};
    if (utilisateur) filter.utilisateur = utilisateur;
    if (produit) filter.produit = produit;

    const result = await paginate(Favori, filter, page, limit, {
      path: "produit",
      populate: [
        { path: "sousTypeProduit", select: "nom" },
        { path: "boutique", select: "nom" }
      ]
    });
    res.json(result);
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