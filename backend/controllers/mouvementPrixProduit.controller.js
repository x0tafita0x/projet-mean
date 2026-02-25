const MouvementPrix = require("../models/mouvementPrixProduit.model");
const Produit = require("../models/produit.model");
const mongoose = require("mongoose");
const upload = require("../middlewares/upload.middleware");

exports.createMouvementPrixProduit = async (req, res) => {
  try {
    const mouvementPrix = await MouvementPrix.create(req.body);
    res.status(201).json(mouvementPrix);
    } catch (err) {
    res.status(400).json({ error: err.message });
    }
};

exports.getAllMouvementsPrixByProduit = async (req, res) => {
  try {
    const { produit, boutique } = req.query;
    const produitId = produit ? new mongoose.Types.ObjectId(produit) : null;
    const boutiqueId = boutique ? new mongoose.Types.ObjectId(boutique) : null;
    
    const mouvementsPrix = await MouvementPrix
      .find()
      .populate({
        path: "produit",
        select: "nom",
        $match: { boutique: boutiqueId,
               ...(produitId ? { _id: produitId } : {}) },
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

    exports.getLastMouvementPrixByProduit = async (req, res) => {
    try {
      const { produitId } = req.params;
      if (!produitId) {
        return res.status(400).json({ error: "Produit ID est requis" });
      }

      const mouvementPrix = await MouvementPrix.findOne({ produit: produitId } , "prix")
      .sort({ createdAt: -1 });
      
      if (!mouvementPrix) mouvementPrix = { prix: 0 };
      res.json(mouvementPrix);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  exports.getProduitsAvecDernierPrix = async (req, res) => {
  try {
    const { boutique } = req.query;

    const boutiqueId = boutique ? new mongoose.Types.ObjectId(boutique) : null; 
    const produits = await Produit.aggregate([
      // 1️⃣ Lookup des mouvements de prix
      {
        $lookup: {
          from: "mouvement_prix_produits", 
          let: { produitId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$produit", "$$produitId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: "dernierPrix"
        }
      },

      // 2️⃣ Extraire le prix (ou null)
      {
        $addFields: {
          prix: {
            $cond: [
              { $gt: [{ $size: "$dernierPrix" }, 0] },
              { $arrayElemAt: ["$dernierPrix.prix", 0] },
              0
            ]
          },
          date : {
            $cond: [
              { $gt: [{ $size: "$dernierPrix" }, 0] },
              { $arrayElemAt: ["$dernierPrix.createdAt", 0] },
              'N/A'
            ] 
        }
      }
      },
    {
        $match: {
          ...(boutiqueId ? { "boutique": boutiqueId } : {}),
        }
    },

      // 3️⃣ Nettoyage
      {
        $project: {
          dernierPrix: 0,
          info: 0,
          description: 0,
          photo: 0,
          createdAt: 0,
          updatedAt: 0,
          sousTypeProduit: 0,
          boutique: 0
        }
      }
    ]);

    res.json(produits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};