const MouvementPrix = require("../models/mouvementPrixProduit.model");
const mongoose = require("mongoose");
const upload = require("../middlewares/upload.middleware");

exports.createMouvementPrixProduit = async (req, res) => {
  try {
    console.log("Received MouvementPrixProduit data:", req.body);
    const mouvementPrix = await MouvementPrix.create(req.body);
    res.status(201).json(mouvementPrix);
    } catch (err) {
    res.status(400).json({ error: err.message });
    }
};

exports.getAllMouvementsPrixByProduit = async (req, res) => {
  try {
    const { produitId } = req.params;
    const filter = {};
    if (produitId) {
      filter.produit = produitId;
    }
    
    const mouvementsPrix = await MouvementPrix
      .find(filter)
      .populate({
        path: "produit",
        select: "nom",
        populate: {
          path:"sousTypeProduit",
          select: "nom"
        }
      })
      .sort({ createdAt: -1 }); 

    res.json(mouvementsPrix);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
