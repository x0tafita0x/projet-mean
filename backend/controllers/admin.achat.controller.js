const Achat = require("../models/achat.model");
const AchatInfo = require("../models/achatInfo.model");

// Lire toutes les commandes (achats validés)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Achat.find()
            .populate("client", "nom email")
            .populate("boutique", "nom")
            .sort({ createdAt: -1 });
        res.json(orders);
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
