const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Accès refusé, token manquant" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

        // Vérifier si l'utilisateur existe toujours et est actif
        const User = require("../models/utilisateur.model");
        const user = await User.findById(verified.id);

        if (!user || user.isDeleted || !user.isActive) {
            return res.status(401).json({ error: "Compte inexistant ou désactivé" });
        }

        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: "Token invalide" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ error: "Accès interdit : Administrateur uniquement" });
    }
};

module.exports = { authMiddleware, isAdmin };
