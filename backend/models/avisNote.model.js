const mongoose = require("mongoose");

const avisNoteSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur", required: true },
    boutique: { type: mongoose.Schema.Types.ObjectId, ref: "boutique", required: true },
    note: { type: Number, required: true },
    avis: { type: String, required: true }
    },
  { timestamps: true }
);

module.exports = mongoose.model("avis_note", avisNoteSchema);