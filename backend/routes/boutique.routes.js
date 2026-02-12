const express = require("express");
const router = express.Router();
const boutiqueController = require("../controllers/boutique.controller");

// CRUD boutiques
router.post("/", boutiqueController.createBoutique);
router.get("/", boutiqueController.getAllBoutiques);
router.get("/:id", boutiqueController.getBoutiqueById);
router.put("/:id", boutiqueController.updateBoutique);
router.delete("/:id", boutiqueController.deleteBoutique);

module.exports = router;
