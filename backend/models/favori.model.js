const mongoose = require("mongoose");

const FavoriSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur", required: true },
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "produit", required: true }
 },
  { timestamps: true }
);

module.exports = mongoose.model("favori", FavoriSchema);
