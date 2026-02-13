const TypeBoutique = require("../models/typeBoutique.model");
const TypeProduit = require("../models/typeProduit.model");
const SousTypeProduit = require("../models/sousTypeProduit.model");

// créer un type de produit
exports.createTypeProduit = async (req, res) => {
  try {
    const typeProduit = await TypeProduit.create(req.body);
    res.status(201).json(typeProduit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister tous les types de produits
exports.getAllTypeProduits = async (req, res) => {
  try {
    const typeProduits = await TypeProduit.find();
    res.json(typeProduits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// trouver un type de produit par ID
exports.getTypeProduitById = async (req, res) => {
  try {
    const typeProduit = await TypeProduit.findById(req.params.id);
    if (!typeProduit) return res.status(404).json({ error: "Type de Produit non trouvé" });
    res.json(typeProduit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mettre à jour un type de produit
exports.updateTypeProduit = async (req, res) => {
  try {
    const typeProduit = await TypeProduit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!typeProduit) return res.status(404).json({ error: "Type deProduit non trouvé" });
    res.json(typeProduit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un type de produit
exports.deleteTypeProduit = async (req, res) => {
  try {
    const typeProduit = await TypeProduit.findByIdAndDelete(req.params.id);
    if (!typeProduit) return res.status(404).json({ error: "Type deProduit non trouvé" });
    res.json({ message: "Type de Produit supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// créer un sous-type de produit
exports.createSousTypeProduit = async (req, res) => {
  try {
    const sousTypeProduit = await SousTypeProduit.create(req.body);
    res.status(201).json(sousTypeProduit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister tous les sous-types de produits
exports.getAllSousTypeProduits = async (req, res) => {
  try {
    const sousTypeProduits = await SousTypeProduit.find().populate("typeProduit");
    res.json(sousTypeProduits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// trouver un sous-type de produit par ID
exports.getSousTypeProduitById = async (req, res) => {
  try {
    const sousTypeProduit = await SousTypeProduit.findById(req.params.id);
    if (!sousTypeProduit) return res.status(404).json({ error: "Sous-type de Produit non trouvé" });
    res.json(sousTypeProduit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mettre à jour un sous-type de produit
exports.updateSousTypeProduit = async (req, res) => {
  try {
    const sousTypeProduit = await SousTypeProduit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sousTypeProduit) return res.status(404).json({ error: "Sous-type de Produit non trouvé" });
    res.json(sousTypeProduit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un sous-type de produit
exports.deleteSousTypeProduit = async (req, res) => {
  try {
    const sousTypeProduit = await SousTypeProduit.findByIdAndDelete(req.params.id);
    if (!sousTypeProduit) return res.status(404).json({ error: "Sous-type de Produit non trouvé" });
    res.json({ message: "Sous-type de Produit supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// créer un type de boutique
exports.createTypeBoutique = async (req, res) => {
  try {
    const typeBoutique = await TypeBoutique.create(req.body);
    res.status(201).json(typeBoutique);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister tous les types de boutiques
exports.getAllTypeBoutiques = async (req, res) => {
  try {
    const typeBoutiques = await TypeBoutique.find();
    res.json(typeBoutiques);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// trouver un type de boutique par ID
exports.getTypeBoutiqueById = async (req, res) => {
  try {
    const typeBoutique = await TypeBoutique.findById(req.params.id);
    if (!typeBoutique) return res.status(404).json({ error: "Type de Boutique non trouvé" });
    res.json(typeBoutique);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mettre à jour un type de boutique
exports.updateTypeBoutique = async (req, res) => {
  try {
    const typeBoutique = await TypeBoutique.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!typeBoutique) return res.status(404).json({ error: "Type de Boutique non trouvé" });
    res.json(typeBoutique);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un type de boutique
exports.deleteTypeBoutique = async (req, res) => {
  try {
    const typeBoutique = await TypeBoutique.findByIdAndDelete(req.params.id);
    if (!typeBoutique) return res.status(404).json({ error: "Type de Boutique non trouvé" });
    res.json({ message: "Type de Boutique supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};