const User = require("../models/utilisateur.model");
const jwt = require("jsonwebtoken");

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

        res.json({
            token,
            user: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                role: user.role,
            },
        });
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
