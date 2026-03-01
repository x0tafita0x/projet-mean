const CommissionConfig = require("../models/commissionConfig.model");
const Achat = require("../models/achat.model");
const Boutique = require("../models/boutique.model");

// Lire la config (taux global)
exports.getConfig = async (req, res) => {
    try {
        let config = await CommissionConfig.findOne();
        if (!config) {
            config = await CommissionConfig.create({ tauxGlobal: 5 });
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Définir taux global
exports.setGlobalRate = async (req, res) => {
    try {
        const { tauxGlobal } = req.body;
        let config = await CommissionConfig.findOne();
        if (config) {
            config.tauxGlobal = tauxGlobal;
            await config.save();
        } else {
            config = await CommissionConfig.create({ tauxGlobal });
        }
        res.json({ message: "Taux global mis à jour", config });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Global stats for commissions
exports.getCommissionStats = async (req, res) => {
    try {
        const stats = await Achat.aggregate([
            {
                $group: {
                    _id: null,
                    totalCommissions: { $sum: "$commission" },
                    nbBoutiques: { $addToSet: "$boutique" }
                }
            },
            {
                $project: {
                    totalCommissions: 1,
                    nbBoutiques: { $size: "$nbBoutiques" }
                }
            }
        ]);
        res.json(stats[0] || { totalCommissions: 0, nbBoutiques: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Commission totale par boutique with pagination
exports.getCommissionsByBoutique = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const pipeline = [
            { $match: { boutique: { $ne: null } } },
            {
                $group: {
                    _id: "$boutique",
                    totalCommissions: { $sum: "$commission" },
                    nbCommandes: { $sum: 1 },
                    totalVentes: { $sum: "$total" },
                },
            },
            {
                $lookup: {
                    from: "boutiques",
                    localField: "_id",
                    foreignField: "_id",
                    as: "boutique",
                },
            },
            { $unwind: { path: "$boutique", preserveNullAndEmptyArrays: true } },
            { $sort: { totalCommissions: -1 } }
        ];

        const [results, totalCount] = await Promise.all([
            Achat.aggregate([...pipeline, { $skip: skip }, { $limit: Number(limit) }]),
            Achat.aggregate([...pipeline, { $count: "total" }])
        ]);

        const total = totalCount[0]?.total || 0;

        res.json({
            data: results,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Commission globale mensuelle with pagination
exports.getMonthlyCommissions = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query; // 12 months default
        const skip = (Number(page) - 1) * Number(limit);

        const pipeline = [
            { $match: {} },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalCommissions: { $sum: "$commission" },
                    totalVentes: { $sum: "$total" },
                    nbCommandes: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ];

        const [results, totalCount] = await Promise.all([
            Achat.aggregate([...pipeline, { $skip: skip }, { $limit: Number(limit) }]),
            Achat.aggregate([...pipeline, { $count: "total" }])
        ]);

        const total = totalCount[0]?.total || 0;

        res.json({
            data: results,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
