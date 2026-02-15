const MouvementProduit = require("../models/mouvementProduit.model");
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

// lister tous les mouvements de produits
exports.getAllMouvementsProduits = async (req, res) => {
  try {
    const mouvementsProduits = await MouvementProduit.find().populate({
      path: "produit",
      select: "nom",
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


// mettre à jour un mouvement de produit
exports.updateMouvementProduit = async (req, res) => {
  try {
    const mouvementProduit = await MouvementProduit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mouvementProduit) return res.status(404).json({ error: "Mouvement de produit non trouvé" });
    res.json(mouvementProduit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un mouvement de produit
exports.deleteMouvementProduit = async (req, res) => {
  try {
    const mouvementProduit = await MouvementProduit.findByIdAndDelete(req.params.id);
    if (!mouvementProduit) return res.status(404).json({ error: "Mouvement de produit non trouvé" });
    res.json({ message: "Mouvement de produit supprimé" });
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
      // {
      //   $lookup: {
      //     from: "MouvementPrixProduit",
      //     let: { produitId: "$_id" },
      //     pipeline: [
      //       { $match: { $expr: { $eq: ["$produit", "$$produitId"] } } },
      //       { $sort: { createdAt: -1 } },
      //       { $limit: 1 }
      //     ],
      //     as: "dernierPrix"
      //   }
      // },
      // { $unwind: "$dernierPrix" },
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
        //   prixUnitaire: "$dernierPrix.prix",
          stockRestant: 1,
          info: "$produitDetails.info",
          photo: "$produitDetails.photo",
          sousTypeProduit: "$sousTypeProduitDetails.nom",
          boutique: "$boutiqueDetails.nom",
          typeProduit: "$typeProduitDetails.nom"
        }
      }
    ]);

    console.log(produitsStock);



    res.json(produitsStock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};