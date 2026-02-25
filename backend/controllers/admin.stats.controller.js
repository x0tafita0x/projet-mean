const Achat = require("../models/achat.model");
const AchatInfo = require("../models/achatInfo.model");
const Boutique = require("../models/boutique.model");
const Produit = require("../models/produit.model");
const mongoose = require("mongoose");

exports.getStats = async (req, res) => {
    try {
        const { startDate, endDate, boutiqueId } = req.query;

        // 1. Build Match Filter
        let matchStage = {};
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(startDate);
            if (endDate) matchStage.createdAt.$lte = new Date(endDate);
        }
        if (boutiqueId) {
            matchStage.boutique = new mongoose.Types.ObjectId(boutiqueId);
        }

        // 2. Global Totals
        // Total Boutiques (not affected by date filter if we want total existing, but maybe filtered if we want active ones)
        const totalBoutiques = await Boutique.countDocuments({ isDeleted: false });
        const totalProduits = await Produit.countDocuments();

        // Stats from Achat
        const globalAchatStats = await Achat.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$total" },
                    totalCommissions: { $sum: "$commission" }
                }
            }
        ]);

        const totals = globalAchatStats[0] || { totalOrders: 0, totalRevenue: 0, totalCommissions: 0 };

        // 3. Graph: Daily Orders (Last 7 Days or filtered range)
        let dailyMatch = { ...matchStage };

        // If startDate is missing, we default to showing the 7 days ending at endDate (or now)
        if (!startDate) {
            const referenceDate = endDate ? new Date(endDate) : new Date();
            const sevenDaysAgo = new Date(referenceDate);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            if (!dailyMatch.createdAt) dailyMatch.createdAt = {};
            dailyMatch.createdAt.$gte = sevenDaysAgo;

            // If no endDate was provided, we cap at the current referenceDate (now)
            // If it was provided, it's already capped by matchStage
            if (!endDate) {
                dailyMatch.createdAt.$lte = referenceDate;
            }
        }

        const dailyOrders = await Achat.aggregate([
            { $match: dailyMatch },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$total" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 4. Graph: Monthly Sales
        const monthlySales = await Achat.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: { $sum: "$total" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 5. Top 5 Boutiques (by Revenue)
        const topBoutiques = await Achat.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$boutique",
                    revenue: { $sum: "$total" },
                    commissions: { $sum: "$commission" }
                }
            },
            { $lookup: { from: "boutiques", localField: "_id", foreignField: "_id", as: "boutiqueInfo" } },
            { $unwind: "$boutiqueInfo" },
            { $project: { name: "$boutiqueInfo.nom", revenue: 1, commissions: 1 } },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);

        // 6. Top 5 Produits (by Quantity/Revenue)
        // This requires AchatInfo
        const topProducts = await AchatInfo.aggregate([
            // Need to filter AchatInfo by Achat date/boutique
            {
                $lookup: {
                    from: "achats",
                    localField: "achat",
                    foreignField: "_id",
                    as: "achatInfo"
                }
            },
            { $unwind: "$achatInfo" },
            // Apply filters on the parent Achat
            {
                $match: Object.keys(matchStage).reduce((acc, key) => {
                    acc[`achatInfo.${key}`] = matchStage[key];
                    return acc;
                }, {})
            },
            {
                $group: {
                    _id: "$produit",
                    totalQty: { $sum: "$quantite" },
                    revenue: { $sum: { $multiply: ["$prix", "$quantite"] } }
                }
            },
            { $lookup: { from: "produits", localField: "_id", foreignField: "_id", as: "produitInfo" } },
            { $unwind: "$produitInfo" },
            { $project: { name: "$produitInfo.nom", totalQty: 1, revenue: 1 } },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            totals: {
                totalBoutiques,
                totalProduits,
                totalOrders: totals.totalOrders,
                totalRevenue: totals.totalRevenue,
                totalCommissions: totals.totalCommissions
            },
            dailyOrders,
            monthlySales,
            topBoutiques,
            topProducts
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
