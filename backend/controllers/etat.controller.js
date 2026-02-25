const Etat = require("../models/etat.model");
// créer un etat
exports.createEtat = async (req, res) => {
  try {
    const etat = await Etat.create(req.body);
    res.status(201).json(etat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister tous les etats
exports.getAllEtats = async (req, res) => {
  try {
    const etats = await Etat.find();
    res.json(etats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// trouver un etat par ID
exports.getEtatById = async (req, res) => {
  try {
    const etat = await Etat.findById(req.params.id);
    if (!etat) return res.status(404).json({ error: "Etat non trouvé" });
    res.json(etat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mettre à jour un etat
exports.updateEtat = async (req, res) => {
  try {
    const etat = await Etat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!etat) return res.status(404).json({ error: "Etat non trouvé" });
    res.json(etat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un etat
exports.deleteEtat = async (req, res) => {
  try {
    const etat = await Etat.findByIdAndDelete(req.params.id);
    if (!etat) return res.status(404).json({ error: "Etat non trouvé" });
    res.json({ message: "Etat supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};