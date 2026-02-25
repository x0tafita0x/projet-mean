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

const seed = async () => {
    try {
        await connectDB();

        console.log("Cleaning database...");
        await Achat.deleteMany({});
        await AchatInfo.deleteMany({});
        await Boutique.deleteMany({});
        await Produit.deleteMany({});
        await Utilisateur.deleteMany({});
        await CommissionConfig.deleteMany({});
        await TypeBoutique.deleteMany({});
        await TypeProduit.deleteMany({});
        await SousTypeProduit.deleteMany({});

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

        console.log("Creating Products...");
        const p1 = await Produit.create({ nom: "Samsung S23", sousTypeProduit: sousType._id, boutique: boutiques[0]._id });
        const p2 = await Produit.create({ nom: "iPhone 15", sousTypeProduit: sousType._id, boutique: boutiques[0]._id });
        const p3 = await Produit.create({ nom: "Xiaomi 13", sousTypeProduit: sousType._id, boutique: boutiques[1]._id });

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

        // Last 14 days
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);

            const b = boutiques[i % 2];
            const total = (Math.floor(Math.random() * 3) + 1) * 2000000;
            const taux = b.tauxCommission || 5;
            const commission = (total * taux) / 100;

            const achat = await Achat.create({
                client: buyer._id,
                boutique: b._id,
                total,
                commission,
                createdAt: date,
                updatedAt: date
            });

            await AchatInfo.create({
                achat: achat._id,
                produit: i % 2 === 0 ? p1._id : p3._id,
                prix: i % 2 === 0 ? 4500000 : 2500000,
                quantite: 1,
                createdAt: date
            });
        }

        // Monthly data (last 12 months)
        for (let i = 1; i <= 12; i++) {
            const date = new Date();
            date.setMonth(now.getMonth() - i);

            for (let j = 0; j < 2; j++) {
                const b = boutiques[j % 2];
                const total = (Math.floor(Math.random() * 5) + 2) * 1000000;
                const taux = b.tauxCommission || 5;
                const commission = (total * taux) / 100;

                const achat = await Achat.create({
                    client: buyer._id,
                    boutique: b._id,
                    total,
                    commission,
                    createdAt: date,
                    updatedAt: date
                });

                await AchatInfo.create({
                    achat: achat._id,
                    produit: j % 2 === 0 ? p2._id : p3._id,
                    prix: j % 2 === 0 ? 6000000 : 2500000,
                    quantite: 1,
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
