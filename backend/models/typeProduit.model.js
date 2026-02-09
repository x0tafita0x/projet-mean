const mongoose = require("mongoose");

const typeProduitSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true } },
  { timestamps: true }
);

module.exports = mongoose.model("type_produit", typeProduitSchema);