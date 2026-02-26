require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Models
const Boutique = require("./models/boutique.model");
const Produit = require("./models/produit.model");
const Utilisateur = require("./models/utilisateur.model");
const Achat = require("./models/achat.model");
const AchatInfo = require("./models/achatInfo.model");
const CommissionConfig = require("./models/commissionConfig.model");
const TypeBoutique = require("./models/typeBoutique.model");
const TypeProduit = require("./models/typeProduit.model");
const SousTypeProduit = require("./models/sousTypeProduit.model");
const Etat = require("./models/etat.model");
const MouvementProduit = require("./models/mouvementProduit.model");
const Panier = require("./models/panier.model");

const seed = async () => {
    try {
        await connectDB();

        console.log("Cleaning database...");
        await Achat.deleteMany({});
        await AchatInfo.deleteMany({});
        await Panier.deleteMany({});
        await MouvementProduit.deleteMany({});
        await Etat.deleteMany({});
        await Boutique.deleteMany({});
        await Produit.deleteMany({});
        await Utilisateur.deleteMany({});
        await CommissionConfig.deleteMany({});
        await TypeBoutique.deleteMany({});
        await TypeProduit.deleteMany({});
        await SousTypeProduit.deleteMany({});

        console.log("Creating Etats...");
        const etatsData = [
            { nom: "EN ATTENTE" },
            { nom: "VALIDÉE" },
            { nom: "PAYÉE" },
            { nom: "À RÉCUPÉRER" },
            { nom: "ANNULÉE" },
            { nom: "RÉCUPÉRÉE" }
        ];
        const etats = await Etat.insertMany(etatsData);
        // Helper to get an etat
        const getEtat = (nom) => etats.find(e => e.nom === nom);

        console.log("Creating Types...");
        const typeBoutique = await TypeBoutique.create({ nom: "Électronique" });
        const typeProduit = await TypeProduit.create({ nom: "Smartphones" });
        const sousType = await SousTypeProduit.create({ nom: "Android", typeProduit: typeProduit._id });

        console.log("Creating Commission Config...");
        await CommissionConfig.create({ tauxGlobal: 5 });

        console.log("Creating Admin User...");
        await Utilisateur.create({
            nom: "Admin",
            email: "admin@mean.com",
            motDePasse: "admin123",
            role: "admin"
        });

        console.log("Creating Boutiques...");
        const boutiques = await Boutique.create([
            {
                nom: "Tech Store",
                typeBoutique: typeBoutique._id,
                heureOuverture: "08:00",
                heureFermeture: "18:00",
                nbJoursOuverture: 6,
                status: "active",
                tauxCommission: 10
            },
            {
                nom: "Electro Dream",
                typeBoutique: typeBoutique._id,
                heureOuverture: "09:00",
                heureFermeture: "19:00",
                nbJoursOuverture: 5,
                status: "active",
                tauxCommission: null
            }
        ]);

        console.log("Creating Boutique User...");
        await Utilisateur.create({
            nom: "Boutique Owner 1",
            email: "boutique1@mean.com",
            motDePasse: "b123",
            role: "boutique",
            boutique: boutiques[0]._id,
            isActive: true
        });

        console.log("Creating Products...");
        const p1 = await Produit.create({ nom: "Samsung S23", sousTypeProduit: sousType._id, boutique: boutiques[0]._id });
        const p2 = await Produit.create({ nom: "iPhone 15", sousTypeProduit: sousType._id, boutique: boutiques[0]._id });
        const p3 = await Produit.create({ nom: "Xiaomi 13", sousTypeProduit: sousType._id, boutique: boutiques[1]._id });
        // un produit en rupture
        const p4 = await Produit.create({ nom: "Test Rupture", sousTypeProduit: sousType._id, boutique: boutiques[0]._id });

        console.log("Creating stock movements...");
        await MouvementProduit.insertMany([
            { produit: p1._id, in: 50, out: 10, boutique: boutiques[0]._id }, // actif, stock 40
            { produit: p2._id, in: 20, out: 5, boutique: boutiques[0]._id }, // actif, stock 15
            { produit: p3._id, in: 30, out: 20, boutique: boutiques[1]._id }, // actif, stock 10
            { produit: p4._id, in: 10, out: 10, boutique: boutiques[0]._id }  // rupture, stock 0
        ]);

        console.log("Creating Buyer...");
        const buyer = await Utilisateur.create({
            nom: "Jean Dupont",
            email: "jean@example.com",
            motDePasse: "password123",
            role: "acheteur",
            isActive: true
        });

        console.log("Generating Orders history...");
        const now = new Date();

        // Simulate orders for today, yesterday, etc.
        const ordersParams = [
            // today: one payée/à récupérer, one en attente, one annulée
            { daysAgo: 0, etat: "À RÉCUPÉRER", qte: 1, p: p1, b: boutiques[0] },
            { daysAgo: 0, etat: "EN ATTENTE", qte: 2, p: p2, b: boutiques[0] },
            { daysAgo: 0, etat: "ANNULÉE", qte: 1, p: p1, b: boutiques[0] },
            // yesterday
            { daysAgo: 1, etat: "VALIDÉE", qte: 1, p: p2, b: boutiques[0] },
            { daysAgo: 1, etat: "RÉCUPÉRÉE", qte: 1, p: p3, b: boutiques[1] },
        ];

        // 14 days history to feed the 7 last days charts + monthly logic
        for (let i = 2; i <= 14; i++) {
            ordersParams.push({
                daysAgo: i,
                etat: "RÉCUPÉRÉE",
                qte: (Math.floor(Math.random() * 3) + 1), // 1 to 3
                p: i % 2 === 0 ? p1 : p3,
                b: boutiques[i % 2]
            });
        }

        // Monthly data history (past 6 months)
        for (let i = 1; i <= 6; i++) {
            ordersParams.push({
                daysAgo: i * 30,
                etat: "RÉCUPÉRÉE",
                qte: 5,
                p: p2,
                b: boutiques[0]
            });
            ordersParams.push({
                daysAgo: i * 30 + 15,
                etat: "RÉCUPÉRÉE",
                qte: 10,
                p: p1,
                b: boutiques[0]
            });
        }

        for (const op of ordersParams) {
            const date = new Date(now);
            date.setDate(date.getDate() - op.daysAgo);

            // create panier
            const etatPanier = getEtat(op.etat);
            const prixUnitaire = op.p._id === p1._id ? 4500000 : (op.p._id === p2._id ? 6000000 : 2500000);

            const panier = await Panier.create({
                utilisateur: buyer._id,
                etat: etatPanier._id,
                produit: op.p._id,
                prix: prixUnitaire,
                quantite: op.qte,
                createdAt: date,
                updatedAt: date,
                dateHeureRecuperation: date // simplify today logic
            });

            // create achat if it's considered valid/payée/récupérée
            if (["VALIDÉE", "PAYÉE", "À RÉCUPÉRER", "RÉCUPÉRÉE"].includes(op.etat)) {
                const total = prixUnitaire * op.qte;
                const taux = op.b.tauxCommission || 5;
                const commission = (total * taux) / 100;

                const achat = await Achat.create({
                    client: buyer._id,
                    boutique: op.b._id,
                    total: total,
                    commission: commission,
                    nombreItems: op.qte,
                    createdAt: date,
                    updatedAt: date
                });

                await AchatInfo.create({
                    achat: achat._id,
                    panier: panier._id,
                    prix: total,
                    quantite: op.qte,
                    etat: etatPanier._id,
                    createdAt: date
                });
            }
        }

        console.log("Seeding completed! ✅");
    } catch (error) {
        console.error("Seeding failed! ❌");
        if (error.name === 'ValidationError') {
            for (let field in error.errors) {
                console.error(`- Field '${field}': ${error.errors[field].message}`);
            }
        } else {
            console.error(error);
        }
    } finally {
        mongoose.connection.close();
    }
};

seed();
