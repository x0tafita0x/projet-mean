const mongoose = require("mongoose");

const SousTypeProduitSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true } ,
    typeProduit: { type: mongoose.Schema.Types.ObjectId, ref: "type_produit", required: true } },
  { timestamps: true }
);

module.exports = mongoose.model("sous_type_produit", SousTypeProduitSchema);