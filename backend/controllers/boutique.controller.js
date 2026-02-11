const Boutique = require("../models/boutique.model");

// créer un produit
exports.createBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.create(req.body);
    res.status(201).json(boutique);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister tous les produits avec catégorie
exports.getAllBoutiques = async (req, res) => {
  try {
    const boutiques = await Boutique.find();
    res.json(boutiques);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// trouver un produit par ID
exports.getBoutiqueById = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id).populate("produit_type");
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json(boutique);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mettre à jour un produit
exports.updateBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json(boutique);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un produit
exports.deleteBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndDelete(req.params.id);
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json({ message: "Boutique supprimée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};