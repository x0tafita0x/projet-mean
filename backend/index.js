require("dotenv").config();


const express = require("express");
const connectDB = require("./config/db");

const app = express();
const cors = require("cors");


// middleware pour le CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// middleware pour lire le JSON
app.use(express.json());

// Servir le dossier uploads en statique
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

// routes
app.use("/api/auth", require("./routes/utilisateur.routes"));
app.use("/api/produits", require("./routes/produit.routes"));
app.use("/api/type-sous-type", require("./routes/typeSousType.routes"));
app.use("/api/boutique", require("./routes/boutique.routes"));
app.use("/api/stock", require("./routes/stock.routes"));
app.use("/api/mouvements-prix-produit", require("./routes/mouvementPrixProduit.routes"));
app.use("/api/panier", require("./routes/panier.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/achat", require("./routes/achat.routes"));
app.use("/api/etat", require("./routes/etat.routes"));
app.use("/api/favori", require("./routes/favori.routes"));


// route test
app.get("/", (req, res) => {
  res.json({ message: "API Express fonctionne 🚀" });
});

// serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
