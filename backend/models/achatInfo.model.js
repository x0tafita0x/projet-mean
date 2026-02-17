const mongoose = require("mongoose");

const AchatInfoSchema = new mongoose.Schema(
  {
    achat : { type: mongoose.Schema.Types.ObjectId, ref: "achat", required: true },
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "produit", required: true },
    prix: { type: Number, required: true },
    quantite: { type: Number, required: true },
 },
  { timestamps: true }
);

module.exports = mongoose.model("achat_info", AchatInfoSchema);
