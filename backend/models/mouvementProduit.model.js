const mongoose = require("mongoose");

const MouvementProduitSchema = new mongoose.Schema(
  {
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "produit", required: true },
    in: { type: Number, required: true },
    out: { type: Number, required: true },
    boutique: { type: mongoose.Schema.Types.ObjectId, ref: "boutique", required: true },
 },
  { timestamps: true }
);

module.exports = mongoose.model("mouvement_produit", MouvementProduitSchema);
