const express = require("express");
const router = express.Router();
const typeSousTypeController = require("../controllers/typeSousType.controller");

// CRUD typeProduits
router.post("/type-produit", typeSousTypeController.createTypeProduit);
router.get("/type-produit", typeSousTypeController.getAllTypeProduits);
router.get("/type-produit/:id", typeSousTypeController.getTypeProduitById);
router.put("/type-produit/:id", typeSousTypeController.updateTypeProduit);
router.delete("/type-produit/:id", typeSousTypeController.deleteTypeProduit);

// CRUD sousTypeProduits
router.post("/sous-type-produit", typeSousTypeController.createSousTypeProduit);
router.get("/sous-type-produit", typeSousTypeController.getAllSousTypeProduits);
router.get("/sous-type-produit/:id", typeSousTypeController.getSousTypeProduitById);
router.put("/sous-type-produit/:id", typeSousTypeController.updateSousTypeProduit);
router.delete("/sous-type-produit/:id", typeSousTypeController.deleteSousTypeProduit);

// CRUD typeBoutiques
router.post("/type-boutique", typeSousTypeController.createTypeBoutique);
router.get("/type-boutique", typeSousTypeController.getAllTypeBoutiques);
router.get("/type-boutique/:id", typeSousTypeController.getTypeBoutiqueById);
router.put("/type-boutique/:id", typeSousTypeController.updateTypeBoutique);
router.delete("/type-boutique/:id", typeSousTypeController.deleteTypeBoutique);

module.exports = router;