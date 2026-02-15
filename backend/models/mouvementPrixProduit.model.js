const mongoose = require("mongoose");

const MouvementPrixProduitSchema = new mongoose.Schema(
  {
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "produit", required: true },
    prix: { type: Number, required: true }
 },
  { timestamps: true }
);

module.exports = mongoose.model("mouvement_prix_produit", MouvementPrixProduitSchema);
