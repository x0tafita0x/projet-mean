const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock.controller");
const upload = require("../middlewares/upload.middleware");

// CRUD stocks
router.post("/", upload.single("photo"), stockController.createMouvementProduit);
router.get("/", stockController.getAllMouvementsProduits);
router.get("/toSell", stockController.getProduitToSellByBoutiqueId);
router.delete("/:id", stockController.deleteMouvementProduit);

module.exports = router;