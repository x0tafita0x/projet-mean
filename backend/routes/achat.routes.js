const express = require("express");
const router = express.Router();
const achatController = require("../controllers/achat.controller");

// CRUD achats
router.post("/", achatController.createAchat);
router.get("/commandes-details", achatController.commandeDetails);
router.get("/to-paye-recup/:achatId/:boutiqueId", achatController.ChangeToCommandePayeEtRecupere);
router.get("/recent/", achatController.achatRecent);
router.get("/to-recup/:achatId", achatController.ChangeToCommandeARecuperer);
router.get("/cancel/:achatId", achatController.ChangeToCommandeAnnule);
router.get("/to-recup/:achatId/:boutiqueId", achatController.ChangeToCommandeARecuperer);
router.get("/to-annule/:achatInfoId", achatController.ChangeToCommandeAnnule);
router.get("/achat/:achatId", achatController.getAchatById);
router.get("/achat-details/:achatId", achatController.getAchatDetails);
router.get("/commandes/:boutique/:etat", achatController.listCommmandes);
router.get("/:userId", achatController.getAchatsByUser);

module.exports = router;
