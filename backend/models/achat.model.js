const mongoose = require("mongoose");

// Un achat est créé lors de la validation du panier.
// Il est considéré comme payé immédiatement (pas de statut intermédiaire).
// La commission est calculée automatiquement à la création.
const AchatSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur", required: true },
    boutique: { type: mongoose.Schema.Types.ObjectId, ref: "boutique", default: null },
    total: { type: Number, required: true },
<<<<<<< admin
    commission: { type: Number, default: 0 },
  },
=======
    nombreItems: { type: Number, required: true }
 },
>>>>>>> develop
  { timestamps: true }
);

module.exports = mongoose.model("achat", AchatSchema);
