const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produit.controller");
const upload = require("../middlewares/upload.middleware");

// CRUD produits
router.post("/", upload.single("photo"), produitController.createProduit);
router.get("/", produitController.getAllProduits);
router.get("/:id", produitController.getProduitById);
router.put("/:id", upload.single("photo"), produitController.updateProduit);
router.delete("/:id", produitController.deleteProduit);

module.exports = router;
