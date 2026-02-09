const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const utilisateurSchema = new mongoose.Schema(
    {
        nom: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        motDePasse: { type: String, required: true },
        role: { type: String, enum: ["admin", "boutique", "acheteur"], default: "acheteur" },
    },
    { timestamps: true }
);

// Hacher le mot de passe avant de sauvegarder
utilisateurSchema.pre("save", async function () {
    if (!this.isModified("motDePasse")) return;
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
});

// Méthode pour comparer les mots de passe
utilisateurSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.motDePasse);
};

module.exports = mongoose.model("utilisateur", utilisateurSchema);
