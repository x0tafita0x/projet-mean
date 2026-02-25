const MouvementProduit = require("../models/mouvementProduit.model");
const Produit = require("../models/produit.model");
const mongoose = require("mongoose");

// créer un mouvement de produit
exports.createMouvementProduit = async (req, res) => {
  try {
    const mouvementProduit = await MouvementProduit.create(req.body);
    res.status(201).json(mouvementProduit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// créer plusieurs mouvements de produit
exports.createMouvementsProduits = async (req, res) => {
  try {
    const mouvementProduits = await MouvementProduit.insertMany(req.body);
    res.status(201).json(mouvementProduits);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister tous les mouvements de produits
exports.getAllMouvementsProduits = async (req, res) => {
  const { boutique } = req.query;
 const boutiqueId = boutique ? new mongoose.Types.ObjectId(boutique) : null;
  try {
    const mouvementsProduits = await MouvementProduit.find().populate({
      path: "produit",
      select: "nom",
      match : boutiqueId ? { boutique: boutiqueId } : {},
      populate: {
        path: "sousTypeProduit",
        select: "nom"
      }
    });
    res.json(mouvementsProduits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getProduitToSellByBoutiqueId = async (req, res) => {
  try {
    const { nom, sousTypeProduit, boutique, prixMin, prixMax } = req.query;

    // Convertir les IDs si présents
    const sousTypeProduitId = sousTypeProduit ? new mongoose.Types.ObjectId(sousTypeProduit) : null;
    const boutiqueId = boutique ? new mongoose.Types.ObjectId(boutique) : null;

    const produitsStock = await MouvementProduit.aggregate([
      // 1️⃣ Grouper pour calculer le stock restant
      {
        $group: {
          _id: "$produit",
          totalIn: { $sum: "$in" },
          totalOut: { $sum: "$out" }
        }
      },
      {
        $addFields: {
          stockRestant: { $subtract: ["$totalIn", "$totalOut"] }
        }
      },
      {
        $match: { stockRestant: { $gt: 0 } }
      },
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
      { $unwind: "$dernierPrix" },
      {
        $lookup: {
          from: "produits",
          localField: "_id",
          foreignField: "_id",
          as: "produitDetails"
        }
      },
      { $unwind: "$produitDetails" },
      {
        $lookup: {
          from: "sous_type_produits",
          localField: "produitDetails.sousTypeProduit",
          foreignField: "_id",
          as: "sousTypeProduitDetails"
        }
      },
      { $unwind: "$sousTypeProduitDetails" },
      {
        $lookup: {
          from: "type_produits",
          localField: "sousTypeProduitDetails.typeProduit",
          foreignField: "_id",
          as: "typeProduitDetails" }
      },
      { $unwind: "$typeProduitDetails" },
      {
        $lookup: {
          from: "boutiques",
          localField: "produitDetails.boutique",
          foreignField: "_id",
          as: "boutiqueDetails"
        }
      },
      { $unwind: "$boutiqueDetails" },
      {
        $match: {
          stockRestant: { $gt: 0 },
          ...(nom ? { "produitDetails.nom": { $regex: nom, $options: "i" } } : {}),
          ...(sousTypeProduitId ? { "sousTypeProduitDetails._id": sousTypeProduitId } : {}),
          ...(boutiqueId ? { "boutiqueDetails._id": boutiqueId } : {}),
          ...(prixMin || prixMax ? { 
              "dernierPrix.prix": {
                  ...(prixMin ? { $gte: parseFloat(prixMin) } : {}),
                  ...(prixMax ? { $lte: parseFloat(prixMax) } : {})
              } 
          } : {})
        }
      },
      {
        $sort: { "produitDetails.nom": 1 } 
      },
      {
        $project: {
          _id: 1,
          produit: "$produitDetails.nom",
          prixUnitaire: "$dernierPrix.prix",
          stockRestant: 1,
          info: "$produitDetails.info",
          photo: "$produitDetails.photo",
          sousTypeProduit: "$sousTypeProduitDetails.nom",
          boutique: "$boutiqueDetails.nom",
          typeProduit: "$typeProduitDetails.nom"
        }
      }
    ]);




    res.json(produitsStock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

  
};

exports.getProduitsAvecStock = async (req, res) => {
  try {
    const {id , boutique} = req.query;
    const boutiqueId = boutique ? new mongoose.Types.ObjectId(boutique) : null;
    const idProduit = id ? new mongoose.Types.ObjectId(id) : null;
    const produits = await Produit.aggregate([
      {
        $lookup: {
          from: "mouvement_produits",
          localField: "_id",
          foreignField: "produit",
          as: "mouvements"
        }
      },
      {
        $addFields: {
          stockRestant: {
            $subtract: [
              { $sum: "$mouvements.in" },
              { $sum: "$mouvements.out" }
            ]
          }
        }
      },
      {
        $match: {
          ...(idProduit ? { "_id": idProduit } : {}),
          ...(boutiqueId ? { "boutique": boutiqueId } : {})
        }
      },
      {
        $project: {
          nom: 1,
          stockRestant: 1
        }
      }
    ]);

    res.json(produits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};