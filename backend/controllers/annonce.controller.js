const Annonce = require("../models/annonce.model");
const Boutique = require("../models/boutique.model");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { paginate } = require("../utils/pagination");

// Créer une annonce
exports.createAnnonce = async (req, res) => {
    try {
        const { boutique, contenu } = req.body;
        let photos = [];

        if (req.files && req.files.length > 0) {
            photos = req.files.map(file => `uploads/${file.filename}`);
        }

        const nouvelleAnnonce = await Annonce.create({
            boutique,
            contenu,
            photos
        });

        res.status(201).json(nouvelleAnnonce);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Récupérer les annonces (avec pagination et optionnel par boutique)
exports.getAnnonces = async (req, res) => {
    try {
        const { boutiqueId, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (boutiqueId && boutiqueId !== 'undefined' && boutiqueId !== '') {
            try {
                filter.boutique = new mongoose.Types.ObjectId(boutiqueId);
            } catch (e) {
                console.error("Invalid boutiqueId:", boutiqueId);
            }
        }

        const result = await paginate(
            Annonce,
            filter,
            Number(page),
            Number(limit),
            "boutique",
            { createdAt: -1 }
        );

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Supprimer une annonce
exports.deleteAnnonce = async (req, res) => {
    try {
        const annonce = await Annonce.findById(req.params.id);
        if (!annonce) return res.status(404).json({ error: "Annonce non trouvée" });

        // Supprimer les photos du serveur
        annonce.photos.forEach(photoPath => {
            const fullPath = path.join(__dirname, "..", photoPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });

        await Annonce.findByIdAndDelete(req.params.id);
        res.json({ message: "Annonce supprimée avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
