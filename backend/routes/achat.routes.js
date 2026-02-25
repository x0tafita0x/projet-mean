const express = require("express");
const router = express.Router();
const achatController = require("../controllers/achat.controller");

// CRUD achats
router.post("/", achatController.createAchat);
router.get("/commandes-details", achatController.commandeDetails);
router.get("/to-recup/:achatId", achatController.ChangeToCommandeARecuperer);
router.get("/to-paye-recup/:achatId", achatController.ChangeToCommandePayeEtRecupere);
router.get("/achat/:achatId", achatController.getAchatById);
router.get("/recent/", achatController.achatRecent);
router.get("/achat-details/:achatId", achatController.getAchatDetails);
router.get("/commandes/:boutique/:etat", achatController.listCommmandes);
router.get("/:userId", achatController.getAchatsByUser);

module.exports = router;
