const express = require("express");
const router = express.Router();
const favoriController = require("../controllers/favori.controller");

// CRUD favoris
router.post("/", favoriController.createFavori);
router.get("/", favoriController.getAllFavoris);
router.get("/isFavoriExist", favoriController.isFavoriteExist);
router.delete("/:id", favoriController.deleteFavori);

module.exports = router;
