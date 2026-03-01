const express = require("express");
const router = express.Router();
const annonceController = require("../controllers/annonce.controller");
const upload = require("../middlewares/upload.middleware");

// Routes pour les annonces
router.post("/", upload.array("photos", 5), annonceController.createAnnonce);
router.get("/", annonceController.getAnnonces);
router.delete("/:id", annonceController.deleteAnnonce);

module.exports = router;
