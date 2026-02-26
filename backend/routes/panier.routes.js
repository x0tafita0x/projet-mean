const express = require("express");
const router = express.Router();
const panierController = require("../controllers/panier.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// CRUD paniers
router.post("/", panierController.createPanier);
router.get("/", panierController.getAllPanier);
router.get("/:id", panierController.getPanierById);
router.put("/:id", panierController.updatePanier);
router.delete("/:id", panierController.deletePanier);

module.exports = router;
