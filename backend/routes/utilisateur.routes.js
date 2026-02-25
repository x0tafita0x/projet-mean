const express = require("express");
const router = express.Router();
const userController = require("../controllers/utilisateur.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/register", userController.register);
router.post("/login/admin", userController.loginAdmin);
router.post("/login/boutique", userController.loginBoutique);
router.post("/login/acheteur", userController.loginAcheteur);
router.get("/me", authMiddleware, userController.getMe);

module.exports = router;
