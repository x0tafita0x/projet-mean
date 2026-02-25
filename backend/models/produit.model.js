const mongoose = require("mongoose");

const produitSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    info: String,
    photo: String,
    sousTypeProduit: { type: mongoose.Schema.Types.ObjectId, ref: "sous_type_produit", required: true },
    boutique: { type: mongoose.Schema.Types.ObjectId, ref: "boutique", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("produit", produitSchema);
