const express = require("express");
const router = express.Router();
const achatController = require("../controllers/achat.controller");

// CRUD achats
router.post("/", achatController.createAchat);
router.get("/achat/:achatId", achatController.getAchatById);
router.get("/recent/", achatController.achatRecent);
router.get("/:userId", achatController.getAchatsByUser);
router.get("/achat-details/:achatId", achatController.getAchatDetails);
router.get("/commandes/:boutique", achatController.listCommmandes);

module.exports = router;
