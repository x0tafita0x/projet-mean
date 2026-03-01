const Boutique = require("../models/boutique.model");
const { paginate } = require("../utils/pagination");

// créer un produit
exports.createBoutique = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.photo = `uploads/${req.file.filename}`;
    }
    const boutique = await Boutique.create(data);
    res.status(201).json(boutique);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// lister toutes les boutiques avec pagination et filtre
exports.getAllBoutiques = async (req, res) => {
  try {
    const { typeBoutique, nbJoursOuverture, nom, order, page = 1, limit = 10, startDate, endDate } = req.query;

    const filter = {};

    if (typeBoutique) {
      filter.typeBoutique = typeBoutique;
    }

    if (nbJoursOuverture) {
      filter.nbJoursOuverture = Number(nbJoursOuverture);
    }

    if (nom) {
      filter.nom = { $regex: nom, $options: "i" };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const sortOrder = order === "desc" ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const result = await Boutique.aggregate([

      { $match: filter },

      {
        $lookup: {
          from: "avis_notes",
          localField: "_id",
          foreignField: "boutique",
          as: "notes"
        }
      },
      {
        $lookup : {
          from: "type_boutiques",
          localField: "typeBoutique",
          foreignField: "_id",
          as: "typeBoutique"
        }
      },
      { $unwind: { path: "$typeBoutique", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          moyenneNote: {
            $cond: [
              { $gt: [{ $size: "$notes" }, 0] },
              { $avg: "$notes.note" },
              0
            ]
          },
          totalAvis: { $size: "$notes" }
        }
      },

      { $project: { notes: 0 } },

      {
        $facet: {
          data: [
            { $sort: { nom: sortOrder } },
            { $skip: skip },
            { $limit: Number(limit) }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }

    ]);

    const data = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    res.status(200).json({
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// trouver un produit par ID
exports.getBoutiqueById = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id).populate("typeBoutique");
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json(boutique);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





// mettre à jour un produit
exports.updateBoutique = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.photo = `uploads/${req.file.filename}`;
    }
    const boutique = await Boutique.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json(boutique);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// supprimer un produit
exports.deleteBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndDelete(req.params.id);
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json({ message: "Boutique supprimée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Admin Methods ---

exports.getAllBoutiquesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const filter = { isDeleted: false };

    if (search) {
      filter.nom = { $regex: search, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    const result = await paginate(
      Boutique,
      filter,
      Number(page),
      Number(limit),
      "typeBoutique",
      { nom: 1 }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBoutiqueByIdAdmin = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id).populate("typeBoutique");
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json(boutique);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setBoutiqueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "inactive"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Statut invalide. Valeurs acceptées : ${allowed.join(", ")}` });
    }
    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json({ message: `Statut mis à jour : ${status}`, boutique });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.softDeleteBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, status: "inactive" },
      { new: true }
    );
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json({ message: "Boutique supprimée (soft delete)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setBoutiqueCommissionRate = async (req, res) => {
  try {
    const { tauxCommission } = req.body;
    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      { tauxCommission },
      { new: true }
    );
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json({ message: "Taux de commission mis à jour", boutique });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};