const Produit = require("../models/produit.model");

// créer un produit
exports.createProduit = async (req, res) => {
  try {
    const produit = await Produit.create(req.body);
    res.status(201).json(produit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister tous les produits avec catégorie
exports.getAllProduits = async (req, res) => {
  try {
    const produits = await Produit.find().populate({
                      path : "sousTypeProduit" ,
                      select : "nom",
                      populate : {
                        path : "typeProduit",
                        select : "nom"
                      }
                    });
    res.json(produits);
  } catch (err) { 
    res.status(500).json({ error: err.message });
  }
};

// trouver un produit par ID
exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id).populate("sousTypeProduit");
    if (!produit) return res.status(404).json({ error: "Produit non trouvé" });
    res.json(produit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mettre à jour un produit
exports.updateProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("sousTypeProduit");
    if (!produit) return res.status(404).json({ error: "Produit non trouvé" });
    res.json(produit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un produit
exports.deleteProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (!produit) return res.status(404).json({ error: "Produit non trouvé" });
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
