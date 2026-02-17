const mongoose = require("mongoose");

const PanierSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur", required: true },
    etat: { type: String, required: true ,default:"en_cours"},
    typeCommande: { type: String, default: "a emporter" },
    dateHeureRecuperation: Date,
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "produit", required: true },
    prix: { type: Number, required: true },
    quantite: { type: Number, required: true },
    promotion:  { type: mongoose.Schema.Types.ObjectId, ref: "promotion" } 
 },
  { timestamps: true }
);

module.exports = mongoose.model("panier", PanierSchema);
