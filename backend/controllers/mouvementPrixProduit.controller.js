const MouvementPrix = require("../models/mouvementPrixProduit.model");
const Produit = require("../models/produit.model");
const mongoose = require("mongoose");
const { paginate } = require("../utils/pagination");

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
    const { produit, boutique, startDate, endDate, page = 1, limit = 10, search = '' } = req.query;

    const filter = {};

    // 1. Filter by boutique/produit/search (via Produit model)
    const productCriteria = {};
    if (boutique) productCriteria.boutique = new mongoose.Types.ObjectId(boutique);
    if (produit) productCriteria._id = new mongoose.Types.ObjectId(produit);
    if (search) productCriteria.nom = { $regex: search, $options: 'i' };

    if (Object.keys(productCriteria).length > 0) {
      const matchingProducts = await Produit.find(productCriteria).select('_id');
      const productIds = matchingProducts.map(p => p._id);
      filter.produit = { $in: productIds };
    }

    // 2. Filter by date
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const result = await paginate(
      MouvementPrix,
      filter,
      page,
      limit,
      {
        path: "produit",
        select: "nom",
        populate: {
          path: "sousTypeProduit",
          select: "nom"
        }
      },
      { createdAt: -1 }
    );

    res.json(result);
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

    const mouvementPrix = await MouvementPrix.findOne({ produit: produitId }, "prix")
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
          date: {
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