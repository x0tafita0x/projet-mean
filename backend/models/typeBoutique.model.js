const mongoose = require("mongoose");

const typeBoutiqueSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true } },
  { timestamps: true }
);

module.exports = mongoose.model("typeBoutique", typeBoutiqueSchema);