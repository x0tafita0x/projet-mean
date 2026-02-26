const MouvementProduit = require("../models/mouvementProduit.model");
const Produit = require("../models/produit.model");
const mongoose = require("mongoose");
const { paginate } = require("../utils/pagination");

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
  const { boutique, page = 1, limit = 10, search, startDate, endDate } = req.query;
  const p = parseInt(page);
  const l = parseInt(limit);
  const skip = (p - 1) * l;

  try {
    const match = {};
    if (boutique) match["produitDetails.boutique"] = new mongoose.Types.ObjectId(boutique);
    if (search) match["produitDetails.nom"] = { $regex: search, $options: "i" };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.createdAt.$lte = end;
      }
    }

    const pipeline = [
      {
        $lookup: {
          from: "produits",
          localField: "produit",
          foreignField: "_id",
          as: "produitDetails"
        }
      },
      { $unwind: "$produitDetails" },
      { $match: match },
      {
        $lookup: {
          from: "sous_type_produits",
          localField: "produitDetails.sousTypeProduit",
          foreignField: "_id",
          as: "sousTypeDetails"
        }
      },
      { $unwind: { path: "$sousTypeDetails", preserveNullAndEmptyArrays: true } }
    ];

    const [data, totalResult] = await Promise.all([
      MouvementProduit.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: l },
        {
          $project: {
            _id: 1,
            in: 1,
            out: 1,
            createdAt: 1,
            produit: {
              _id: "$produitDetails._id",
              nom: "$produitDetails.nom",
              sousTypeProduit: "$sousTypeDetails"
            }
          }
        }
      ]),
      MouvementProduit.aggregate([
        ...pipeline,
        { $count: "total" }
      ])
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    res.json({
      data,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getProduitToSellByBoutiqueId = async (req, res) => {
  try {
    const { nom, sousTypeProduit, boutique, prixMin, prixMax, page = 1, limit = 10 } = req.query;
    const p = parseInt(page);
    const l = parseInt(limit);
    const skip = (p - 1) * l;

    // Convertir les IDs si présents
    const sousTypeProduitId = sousTypeProduit ? new mongoose.Types.ObjectId(sousTypeProduit) : null;
    const boutiqueId = boutique ? new mongoose.Types.ObjectId(boutique) : null;

    const pipeline = [
      // 1 Grouper pour calculer le stock restant
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
          as: "typeProduitDetails"
        }
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
      }
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await MouvementProduit.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Get paginated data
    const dataPipeline = [
      ...pipeline,
      { $sort: { "produitDetails.nom": 1 } },
      { $skip: skip },
      { $limit: l },
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
    ];

    const data = await MouvementProduit.aggregate(dataPipeline);

    res.json({
      data,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProduitsAvecStock = async (req, res) => {
  try {
    const { id, boutique } = req.query;
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