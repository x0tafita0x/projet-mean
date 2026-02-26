const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/auth.middleware");

const boutique = require("../controllers/boutique.controller");
const utilisateur = require("../controllers/utilisateur.controller");
const achat = require("../controllers/achat.controller");
const commissionAdmin = require("../controllers/admin.commission.controller");
const statsAdmin = require("../controllers/admin.stats.controller");

// Toutes les routes admin requièrent un token valide + rôle admin
router.use(authMiddleware, isAdmin);

// ─── Stats & Dashboard ────────────────────────────────
router.get("/stats", statsAdmin.getStats);

// ─── Boutiques ────────────────────────────────────────
router.get("/boutiques", boutique.getAllBoutiquesAdmin);
router.get("/boutiques/:id", boutique.getBoutiqueByIdAdmin);
router.patch("/boutiques/:id/status", boutique.setBoutiqueStatus);
router.patch("/boutiques/:id/commission", boutique.setBoutiqueCommissionRate);
router.delete("/boutiques/:id", boutique.softDeleteBoutique);

// ─── Utilisateurs (acheteurs) ────────────────────────
router.get("/utilisateurs", utilisateur.getAllAcheteurs);
router.patch("/utilisateurs/:id/toggle-active", utilisateur.toggleUserActive);
router.delete("/utilisateurs/:id", utilisateur.deleteUser);
router.get("/utilisateurs/:id/historique", utilisateur.getUserOrderHistory);

// ─── Commandes ────────────────────────────────────────
router.get("/commandes", achat.getAllOrders);
router.get("/commandes/:id", achat.getOrderDetails);

// ─── Commissions ─────────────────────────────────────
router.get("/commissions/config", commissionAdmin.getConfig);
router.put("/commissions/config", commissionAdmin.setGlobalRate);
router.get("/commissions/stats", commissionAdmin.getCommissionStats);
router.get("/commissions/boutiques", commissionAdmin.getCommissionsByBoutique);
router.get("/commissions/mensuel", commissionAdmin.getMonthlyCommissions);

module.exports = router;
