const Achat = require("../models/achat.model");
const AchatInfo = require("../models/achatInfo.model");
const { paginate } = require("../utils/pagination");

// Lire toutes les commandes (achats validés) avec pagination et filtre
exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', clientId = '', boutiqueId = '', startDate, endDate } = req.query;
        const filter = {};

        if (clientId) {
            filter.client = clientId;
        }

        if (boutiqueId) {
            filter.boutique = boutiqueId;
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

        // Note: For search in populated fields like client name, 
        // it might be better to do a separate lookup or use aggregation if needed.
        // For now, simplicity is preferred unless asked otherwise.

        const result = await paginate(
            Achat,
            filter,
            Number(page),
            Number(limit),
            [
                { path: "client", select: "nom email" },
                { path: "boutique", select: "nom" }
            ],
            { createdAt: -1 }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Voir détail complet (avec lignes AchatInfo)
exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Achat.findById(req.params.id)
            .populate("client", "nom email")
            .populate("boutique", "nom");
        if (!order) return res.status(404).json({ error: "Commande non trouvée" });
        const lignes = await AchatInfo.find({ achat: req.params.id }).populate("produit", "nom");
        res.json({ order, lignes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
