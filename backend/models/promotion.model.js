const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    dateDebut: { type: Date, required: true } ,
    dateFin: { type: Date, required: true } ,
    pourcentage : { type: Number, required: true } 
 },
  { timestamps: true }
);

module.exports = mongoose.model("promotion", PromotionSchema);