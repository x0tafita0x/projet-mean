const Panier = require("../models/panier.model");
const mongoose = require("mongoose");
const etatService = require("../services/etat.service");
const ETATS = require("../utils/etat.constants");


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
    const etatId = await etatService.getEtatIdByNom(ETATS.EN_ATTENTE);

    const result = await Panier.updateMany(
      { _id: { $in: ids } },
      { $set: { etat: etatId } }
    );

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// lister tous les paniers
exports.getAllPanier = async (req, res) => {
  try {
    const { etat, utilisateur } = req.query;
    const filter = {};
    if (etat) filter.etat = new mongoose.Types.ObjectId(etat);
    else filter.etat = await etatService.getEtatIdByNom(ETATS.EN_BROUILLON);

    if (utilisateur) filter.utilisateur = new mongoose.Types.ObjectId(utilisateur);

    const paniers = await Panier.aggregate([
      // 1️⃣ Filtrage des paniers
      { $match: filter },

      // 2️⃣ Lookup produit
      {
        $lookup: {
          from: "produits",
          localField: "produit",
          foreignField: "_id",
          as: "produit"
        }
      },
      { $unwind: "$produit" },

      // 3️⃣ Lookup boutique
      {
        $lookup: {
          from: "boutiques",
          localField: "produit.boutique",
          foreignField: "_id",
          as: "boutique"
        }
      },
      { $unwind: "$boutique" },

      // 4️⃣ Lookup dernier prix du produit
      {
        $lookup: {
          from: "mouvement_prix_produits",
          let: { produitId: "$produit._id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$produit", "$$produitId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: "dernierPrix"
        }
      },

      // 5️⃣ Extraire prix + date
      {
        $addFields: {
          prixActuel: {
            $cond: [
              { $gt: [{ $size: "$dernierPrix" }, 0] },
              { $arrayElemAt: ["$dernierPrix.prix", 0] },
              0
            ]
          }
        }
      },

      // 6️⃣ Nettoyage final
      {
        $project: {
          dernierPrix: 0,
          "produit.__v": 0,
          "boutique.__v": 0
        }
      }
    ]);

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

exports.isPanierVide = async (req, res) => {
  try {
    const etatBrouillonId = await etatService.getEtatIdByNom(ETATS.EN_BROUILLON);
    const paniers = await Panier.find({ utilisateur: req.params.utilisateur, etat: etatBrouillonId });
    res.json({ isEmpty: paniers.length === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};