const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock.controller");
const upload = require("../middlewares/upload.middleware");

// CRUD stocks
router.post("/", upload.single("photo"), stockController.createMouvementProduit);
router.post("/multiple", upload.none(), stockController.createMouvementsProduits);
router.get("/", stockController.getAllMouvementsProduits);
router.get("/produits-avec-stock", stockController.getProduitsAvecStock);
router.get("/toSell", stockController.getProduitToSellByBoutiqueId);
router.delete("/:id", stockController.deleteMouvementProduit);

module.exports = router;