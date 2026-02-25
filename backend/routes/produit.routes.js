const express = require("express");
const router = express.Router();
const productController = require("../controllers/produit.controller");
const upload = require("../middlewares/upload.middleware");

// CRUD produits
router.post("/", upload.single("photo"), productController.createProduit);
router.get("/", productController.getAllProduits);
router.get("/:id", productController.getProduitById);
router.put("/:id", upload.single("photo"), productController.updateProduit);
router.delete("/:id", productController.deleteProduit);

module.exports = router;
