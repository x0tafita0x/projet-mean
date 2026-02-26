const User = require("../models/utilisateur.model");
const jwt = require("jsonwebtoken");
const Achat = require("../models/achat.model");
const AchatInfo = require("../models/achatInfo.model");

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
    try {
        const { nom, email, motDePasse, role } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        const user = new User({ nom, email, motDePasse, role });
        await user.save();

        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Helper function pour la connexion par rôle
const loginWithRole = async (req, res, requiredRole) => {
    try {
        const { email, motDePasse } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        // Vérifier le rôle
        if (user.role !== requiredRole) {
            return res.status(403).json({ error: `Accès refusé. Un compte ${requiredRole} est requis.` });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(motDePasse);
        if (!isMatch) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );
        if (user.role === "boutique") {
            res.json({
                token,
                user: {
                    id: user._id,
                    nom: user.nom,
                    email: user.email,
                    role: user.role,
                    boutique: user.boutique,
                },
            });
        } else {
            res.json({
                token,
                user: {
                    id: user._id,
                    nom: user.nom,
                    email: user.email,
                    role: user.role,
                },
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Connexions par rôle
exports.loginAdmin = (req, res) => loginWithRole(req, res, "admin");
exports.loginBoutique = (req, res) => loginWithRole(req, res, "boutique");
exports.loginAcheteur = (req, res) => loginWithRole(req, res, "acheteur");

// Récupérer l'utilisateur actuel à partir du token
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-motDePasse");
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Admin Methods ---

exports.getAllAcheteurs = async (req, res) => {
    try {
        const users = await User.find({ role: "acheteur", isDeleted: false }).select("-motDePasse");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

exports.getUserOrderHistory = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-motDePasse");
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        const achats = await Achat.find({ client: req.params.id }).sort({ createdAt: -1 });

        const achatsWithDetails = await Promise.all(
            achats.map(async (achat) => {
                const lignes = await AchatInfo.find({ achat: achat._id }).populate("produit");
                return { ...achat.toObject(), lignes };
            })
        );

        res.json({ user, achats: achatsWithDetails });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
