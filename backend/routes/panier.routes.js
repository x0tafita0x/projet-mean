const express = require("express");
const router = express.Router();
const panierController = require("../controllers/panier.controller");
const panierValiderController = require("../controllers/panier.valider.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// CRUD paniers
router.post("/", panierController.createPanier);
router.get("/", panierController.getAllPanier);
router.get("/:id", panierController.getPanierById);
router.put("/:id", panierController.updatePanier);
router.delete("/:id", panierController.deletePanier);

// Validation → crée un Achat avec commission automatique
router.post("/valider", authMiddleware, panierValiderController.validerPanier);

module.exports = router;
