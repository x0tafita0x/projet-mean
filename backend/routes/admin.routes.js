const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/auth.middleware");

const boutiqueAdmin = require("../controllers/admin.boutique.controller");
const utilisateurAdmin = require("../controllers/admin.utilisateur.controller");
const achatAdmin = require("../controllers/admin.achat.controller");
const commissionAdmin = require("../controllers/admin.commission.controller");
const statsAdmin = require("../controllers/admin.stats.controller");

// Toutes les routes admin requièrent un token valide + rôle admin
router.use(authMiddleware, isAdmin);

// ─── Stats & Dashboard ────────────────────────────────
router.get("/stats", statsAdmin.getStats);

// ─── Boutiques ────────────────────────────────────────
router.get("/boutiques", boutiqueAdmin.getAllBoutiquesAdmin);
router.get("/boutiques/:id", boutiqueAdmin.getBoutiqueByIdAdmin);
router.patch("/boutiques/:id/status", boutiqueAdmin.setBoutiqueStatus);
router.patch("/boutiques/:id/commission", boutiqueAdmin.setBoutiqueCommissionRate);
router.delete("/boutiques/:id", boutiqueAdmin.softDeleteBoutique);

// ─── Utilisateurs (acheteurs) ────────────────────────
router.get("/utilisateurs", utilisateurAdmin.getAllAcheteurs);
router.patch("/utilisateurs/:id/toggle-active", utilisateurAdmin.toggleUserActive);
router.delete("/utilisateurs/:id", utilisateurAdmin.deleteUser);
router.get("/utilisateurs/:id/historique", utilisateurAdmin.getUserOrderHistory);

// ─── Commandes ────────────────────────────────────────
router.get("/commandes", achatAdmin.getAllOrders);
router.get("/commandes/:id", achatAdmin.getOrderDetails);

// ─── Commissions ─────────────────────────────────────
router.get("/commissions/config", commissionAdmin.getConfig);
router.put("/commissions/config", commissionAdmin.setGlobalRate);
router.get("/commissions/boutiques", commissionAdmin.getCommissionsByBoutique);
router.get("/commissions/mensuel", commissionAdmin.getMonthlyCommissions);

module.exports = router;
