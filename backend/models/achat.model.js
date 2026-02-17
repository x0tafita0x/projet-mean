const mongoose = require("mongoose");

const AchatSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur", required: true },
    total: { type: Number, required: true },
 },
  { timestamps: true }
);

module.exports = mongoose.model("achat", AchatSchema);
