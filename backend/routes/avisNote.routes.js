const express = require("express");
const router = express.Router();
const avisNoteController = require("../controllers/avisNote.controller");

// CRUD avis notes
router.post("/", avisNoteController.createAvisNote);
router.get("/", avisNoteController.getAllAvisNotes);
router.get("/individu", avisNoteController.getAvisNoteByUtilisateurAndBoutique);
router.get("/:id", avisNoteController.getAvisNoteById);
router.put("/:id", avisNoteController.updateAvisNote);
router.delete("/:id", avisNoteController.deleteAvisNote);

exports = module.exports = router;