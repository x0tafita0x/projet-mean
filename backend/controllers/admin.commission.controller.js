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

// Commission totale par boutique
exports.getCommissionsByBoutique = async (req, res) => {
    try {
        const result = await Achat.aggregate([
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
            { $unwind: { path: "$boutique", preserveNullAndEmpty: true } },
            { $sort: { totalCommissions: -1 } },
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Commission globale mensuelle
exports.getMonthlyCommissions = async (req, res) => {
    try {
        const result = await Achat.aggregate([
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
            { $sort: { "_id.year": -1, "_id.month": -1 } },
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
