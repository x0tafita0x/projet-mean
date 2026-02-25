const express = require("express");
const router = express.Router();
const etatController = require("../controllers/etat.controller");

// CRUD etats
router.post("/", etatController.createEtat);
router.get("/", etatController.getAllEtats);
router.get("/:id", etatController.getEtatById);
router.put("/:id", etatController.updateEtat);
router.delete("/:id", etatController.deleteEtat);

exports = module.exports = router;