const mongoose = require("mongoose");

const FavoriSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur", required: true },
    boutique: { type: mongoose.Schema.Types.ObjectId, ref: "boutique", required: true }
 },
  { timestamps: true }
);

module.exports = mongoose.model("favori", FavoriSchema);
