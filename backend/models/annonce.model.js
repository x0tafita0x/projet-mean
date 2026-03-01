const mongoose = require("mongoose");

const AnnonceSchema = new mongoose.Schema(
    {
        boutique: { type: mongoose.Schema.Types.ObjectId, ref: "boutique", required: true },
        contenu: { type: String, required: true },
        photos: [{ type: String }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("annonce", AnnonceSchema);
