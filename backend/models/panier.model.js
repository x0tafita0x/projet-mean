const mongoose = require("mongoose");

const PanierSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur", required: true },
    etat: { type: mongoose.Schema.Types.ObjectId, ref: "etat", required: true },
    dateHeureRecuperation: Date,
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "produit", required: true },
    prix: { type: Number, required: true },
    quantite: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("panier", PanierSchema);
