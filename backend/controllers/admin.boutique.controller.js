const Boutique = require("../models/boutique.model");

// Voir toutes les boutiques (non supprimées)
exports.getAllBoutiquesAdmin = async (req, res) => {
    try {
        const boutiques = await Boutique.find({ isDeleted: false }).populate("typeBoutique");
        res.json(boutiques);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Voir détail boutique
exports.getBoutiqueByIdAdmin = async (req, res) => {
    try {
        const boutique = await Boutique.findById(req.params.id).populate("typeBoutique");
        if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
        res.json(boutique);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Activer / Désactiver
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

// Supprimer (soft delete)
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

// Définir taux de commission spécifique à la boutique
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
