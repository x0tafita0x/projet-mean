const mongoose = require("mongoose");

const PromotionInfoSchema = new mongoose.Schema(
  {
    promotion: { type: mongoose.Schema.Types.ObjectId, ref: "promotion", required: true },
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "produit", required: true }
 },
  { timestamps: true }
);

module.exports = mongoose.model("promotionInfo", PromotionInfoSchema);
