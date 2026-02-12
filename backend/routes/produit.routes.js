const express = require("express");
const router = express.Router();
const productController = require("../controllers/produit.controller");

// CRUD produits
router.post("/", productController.createProduit);
router.get("/", productController.getAllProduits);
router.get("/:id", productController.getProduitById);
router.put("/:id", productController.updateProduit);
router.delete("/:id", productController.deleteProduit);

module.exports = router;
