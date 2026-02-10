const mongoose = require("mongoose");

const BoutiqueSchema = new mongoose.Schema(
  {
    nom : { type: String, required: true },
    typeBoutique: { type: mongoose.Schema.Types.ObjectId, ref: "type_boutique", required: true } ,
    heureOuverture: { type: String, required: true } ,
    heureFermeture: { type: String, required: true } ,
    nb_jours_ouverture: { type: Number, required: true } 
 },
  { timestamps: true }
);

module.exports = mongoose.model("boutique", BoutiqueSchema);
