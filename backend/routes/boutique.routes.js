const express = require("express");
const router = express.Router();
const boutiqueController = require("../controllers/boutique.controller");
const upload = require("../middlewares/upload.middleware");

// CRUD boutiques
router.post("/",  upload.single("photo"), boutiqueController.createBoutique);
router.get("/", boutiqueController.getAllBoutiques);
router.get("/:id", boutiqueController.getBoutiqueById);
router.put("/:id",  upload.single("photo"), boutiqueController.updateBoutique);
router.delete("/:id", boutiqueController.deleteBoutique);

module.exports = router;
