const MouvementProduit = require("../models/mouvementProduit.model");

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
    const mouvementsProduits = await MouvementProduit.find();
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
    const produitsStock = await MouvementProduit.aggregate([
      // 1️⃣ Grouper pour calculer le stock restant
      {
        $group: {
          _id: "$produit",
          totalIn: { $sum: "$in" },
          totalOut: { $sum: "$out" }
        }
      },
      // 2️⃣ Calculer stock restant
      {
        $addFields: {
          stockRestant: { $subtract: ["$totalIn", "$totalOut"] }
        }
      },
      // 3️⃣ Filtrer produits avec stock > 0
      {
        $match: { stockRestant: { $gt: 0 } }
      },
      // 4️⃣ Lookup pour récupérer le dernier prix
      {
        $lookup: {
          from: "MouvementPrixProduit",
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
      // 5️⃣ Lookup pour récupérer le produit avec boutique et sousTypeProduit
      {
        $lookup: {
          from: "Produit",
          localField: "_id",
          foreignField: "_id",
          as: "produitDetails"
        }
      },
      { $unwind: "$produitDetails" },
      // 6️⃣ Lookup pour peupler sousTypeProduit
      {
        $lookup: {
          from: "sousTypeProduit",
          localField: "produitDetails.sousTypeProduit",
          foreignField: "_id",
          as: "sousTypeProduitDetails"
        }
      },
      { $unwind: "$sousTypeProduitDetails" },
      // 7️⃣ Lookup pour peupler boutique
      {
        $lookup: {
          from: "Boutique",
          localField: "produitDetails.boutique",
          foreignField: "_id",
          as: "boutiqueDetails"
        }
      },
      { $unwind: "$boutiqueDetails" },
      // 8️⃣ Projetter les champs finaux
      {
        $project: {
          _id: 1,
          produit: "$produitDetails.nom",
          prixUnitaire: "$dernierPrix.prix",
          stockRestant: 1,
          info: "$produitDetails.info",
          photo: "$produitDetails.photo",
          sousTypeProduit: "$sousTypeProduitDetails.nom",
          boutique: "$boutiqueDetails.nom"
        }
      }
    ]);

    console.log(produitsStock);



    res.json(produitsStock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};