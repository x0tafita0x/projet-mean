const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Accès refusé, token manquant" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
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
