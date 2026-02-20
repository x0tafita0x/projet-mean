const Panier = require("../models/panier.model");


// créer un panier
exports.createPanier = async (req, res) => {
  try {
    const panier = await Panier.create(req.body);
    res.status(201).json(panier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mettre à jour l'état de plusieurs paniers à "VALIDE"
exports.validerPaniers = async (req, res) => {
  try {
    const paniers = req.body; // tableau

    const ids = paniers.map(p => p._id);

    const result = await Panier.updateMany(
      { _id: { $in: ids } },
      { $set: { etat: '6997d956319cef48fa23a812' } }
    );

    res.json({result});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// lister tous les paniers
exports.getAllPanier = async (req, res) => {
    const { etat , utilisateur } = req.query;
    const filter = {};
  try {
    if (etat) filter.etat = etat;
    if (utilisateur) filter.utilisateur = utilisateur;
    filter.etat = '6997d94d319cef48fa23a80f';
    const paniers = await Panier.find(filter).populate({
      path: "produit",
      select: "nom photo",
      populate: {
        path: "boutique",
        select: "nom"
      } 
    }).populate('etat');
    res.json(paniers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// trouver un panier par ID
exports.getPanierById = async (req, res) => {
  try {
    const panier = await Panier.findById(req.params.id).populate({
      path: "produit",
      select: "nom photo prix",
      populate: {
        path: "boutique",
        select: "nom"
      }
    });
    if (!panier) return res.status(404).json({ error: "Panier non trouvé" });
    res.json(panier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mettre à jour un panier
exports.updatePanier = async (req, res) => {
  try {
    const panier = await Panier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!panier) return res.status(404).json({ error: "Panier non trouvé" });
    res.json(panier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un panier
exports.deletePanier = async (req, res) => {
  try {
    const panier = await Panier.findByIdAndDelete(req.params.id);
    if (!panier) return res.status(404).json({ error: "Panier non trouvé" });
    res.json({ message: "Panier supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};