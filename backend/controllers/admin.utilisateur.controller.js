const User = require("../models/utilisateur.model");
const Achat = require("../models/achat.model");
const AchatInfo = require("../models/achatInfo.model");
const { paginate } = require("../utils/pagination");

// Voir tous les acheteurs (non supprimés) avec pagination et filtre
exports.getAllAcheteurs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const filter = { role: "acheteur", isDeleted: false };

        if (search) {
            filter.$or = [
                { nom: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const result = await paginate(
            User,
            filter,
            Number(page),
            Number(limit),
            "",
            { nom: 1 }
        );
        // Remove passwords from results
        result.data = result.data.map(u => {
            const user = u.toObject();
            delete user.motDePasse;
            return user;
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Activier / Désactiver un compte
exports.toggleUserActive = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
        user.isActive = !user.isActive;
        await user.save();
        res.json({ message: `Compte ${user.isActive ? "activé" : "désactivé"}`, isActive: user.isActive });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Supprimer (soft delete)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true, isActive: false },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
        res.json({ message: "Utilisateur supprimé (soft delete)" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Voir historique achat d'un acheteur
exports.getUserOrderHistory = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-motDePasse");
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        const achats = await Achat.find({ client: req.params.id }).sort({ createdAt: -1 });

        const achatsWithDetails = await Promise.all(
            achats.map(async (achat) => {
                const lignes = await AchatInfo.find({ achat: achat._id }).populate({
                    path: 'panier',
                    populate: { path: 'produit', select: 'nom' }
                });
                return { ...achat.toObject(), lignes };
            })
        );

        res.json({ user, achats: achatsWithDetails });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
