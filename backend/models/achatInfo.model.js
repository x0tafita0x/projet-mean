const mongoose = require("mongoose");

const AchatInfoSchema = new mongoose.Schema(
  {
    achat : { type: mongoose.Schema.Types.ObjectId, ref: "achat", required: true },
    panier: { type: mongoose.Schema.Types.ObjectId, ref: "panier", required: true },
    prix: { type: Number, required: true },
    quantite: { type: Number, required: true },
    etat: { type: mongoose.Schema.Types.ObjectId, ref: "etat", required: true }
  },
  { timestamps: true
 }
);

module.exports = mongoose.model("achat_info", AchatInfoSchema);
