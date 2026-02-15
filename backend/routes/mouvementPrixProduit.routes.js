const express = require("express");
const router = express.Router();
const MouvementPrixProduitController = require("../controllers/mouvementPrixProduit.controller");

// CRUD mouvements de prix de produits
router.post("/", MouvementPrixProduitController.createMouvementPrixProduit);
router.get("/", MouvementPrixProduitController.getAllMouvementsPrixByProduit);

module.exports = router;
