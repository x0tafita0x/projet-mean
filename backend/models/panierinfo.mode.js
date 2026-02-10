const mongoose = require("mongoose");

const PanierSchema = new mongoose.Schema(
  {
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "produit", required: true },
    panier: { type: mongoose.Schema.Types.ObjectId, ref: "panier", required: true },
    prix: { type: Number, required: true },
    quantite: { type: Number, required: true },
    promotion:  { type: mongoose.Schema.Types.ObjectId, ref: "promotion" } 
 },
  { timestamps: true }
);

module.exports = mongoose.model("panier", PanierSchema);
