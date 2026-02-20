const mongoose = require("mongoose");

const etatSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true } },
  { timestamps: true }
);

module.exports = mongoose.model("etat", etatSchema);