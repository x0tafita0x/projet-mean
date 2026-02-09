const mongoose = require("mongoose");

const PanierSchema = new mongoose.Schema(
  {
    boutique: { type: mongoose.Schema.Types.ObjectId, ref: "boutique", required: true },
    etat: { type: String, required: true ,default:"en_cours"},
    typeCommande: { type: String, default: "a emporter" },
    dateHeureRecuperation: Date
 },
  { timestamps: true }
);

module.exports = mongoose.model("panier", PanierSchema);
