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
const MouvementPrixProduit = require("./models/mouvementPrixProduit.model");
const Panier = require("./models/panier.model");
const Annonce = require("./models/annonce.model");
const AvisNote = require("./models/avisNote.model");
const Favori = require("./models/favori.model");

const ETATS = require("./utils/etat.constants");

const seed = async () => {
    try {
        await connectDB();

        console.log("Cleaning database completely (Drop Database)...");
        await mongoose.connection.dropDatabase();
        console.log("Database cleared. ✅");

        console.log("Creating Etats...");
        const etatsData = Object.values(ETATS).map(nom => ({ nom }));
        const etats = await Etat.insertMany(etatsData);
        const getEtat = (nom) => etats.find(e => e.nom === nom);

        console.log("Creating Types & Categories...");
        const tBoutiques = await TypeBoutique.insertMany([
            { nom: "High-Tech" },
            { nom: "Mode & Beauté" },
            { nom: "Alimentation" }
        ]);

        const tProduits = await TypeProduit.insertMany([
            { nom: "Informatique" },
            { nom: "Vêtements" },
            { nom: "Épicerie" }
        ]);

        const sTypes = await SousTypeProduit.insertMany([
            { nom: "Laptops", typeProduit: tProduits[0]._id },
            { nom: "Smartphones", typeProduit: tProduits[0]._id },
            { nom: "T-shirts", typeProduit: tProduits[1]._id },
            { nom: "Pantalons", typeProduit: tProduits[1]._id },
            { nom: "Boissons", typeProduit: tProduits[2]._id }
        ]);

        console.log("Creating Commission Config...");
        await CommissionConfig.create({ tauxGlobal: 5 });

        console.log("Creating Admin User (Password will be hashed)...");
        await Utilisateur.create({
            nom: "Admin Système",
            email: "admin@test.com",
            motDePasse: "test",
            role: "admin"
        });

        console.log("Creating Boutiques...");
        const boutiques = await Boutique.insertMany([
            {
                nom: "Matrix Tech",
                typeBoutique: tBoutiques[0]._id,
                heureOuverture: "08:00",
                heureFermeture: "19:00",
                nbJoursOuverture: 6,
                status: "active",
                tauxCommission: 8,
                photo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1"
            },
            {
                nom: "Vogue Fashion",
                typeBoutique: tBoutiques[1]._id,
                heureOuverture: "09:00",
                heureFermeture: "20:00",
                nbJoursOuverture: 7,
                status: "active",
                tauxCommission: 12,
                photo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            },
            {
                nom: "Fresh Market",
                typeBoutique: tBoutiques[2]._id,
                heureOuverture: "07:00",
                heureFermeture: "21:00",
                nbJoursOuverture: 7,
                status: "active",
                tauxCommission: null,
                photo: "https://images.unsplash.com/photo-1542838132-92c53300491e"
            }
        ]);

        console.log("Creating Boutique Owners (Passwords will be hashed)...");
        // Using create for users to ensure pre-save hook (hashing) runs
        const ownersData = [
            { nom: "Thomas Neo", email: "matrix@test.com", motDePasse: "test", role: "boutique", boutique: boutiques[0]._id, isActive: true },
            { nom: "Sarah Vogue", email: "vogue@test.com", motDePasse: "test", role: "boutique", boutique: boutiques[1]._id, isActive: true },
            { nom: "Marc Fresh", email: "fresh@test.com", motDePasse: "test", role: "boutique", boutique: boutiques[2]._id, isActive: true }
        ];

        for (const owner of ownersData) {
            await Utilisateur.create(owner);
        }

        console.log("Creating Products...");
        const prodData = [
            { nom: "MacBook Pro M3", info: "L'ordinateur le plus puissant pour pro.", photo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8", sType: sTypes[0], b: boutiques[0], p: 12500000 },
            { nom: "S24 Ultra", info: "Le summum d'Android.", photo: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c", sType: sTypes[1], b: boutiques[0], p: 6500000 },
            { nom: "Chemise Lin", info: "Léger et élégant pour l'été.", photo: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c", sType: sTypes[2], b: boutiques[1], p: 150000 },
            { nom: "Jean Slim", info: "Coupe moderne et robuste.", photo: "https://images.unsplash.com/photo-1542272604-787c3835535d", sType: sTypes[3], b: boutiques[1], p: 200000 },
            { nom: "Café Arabica 1kg", info: "Grain torréfié artisanalement.", photo: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e", sType: sTypes[4], b: boutiques[2], p: 85000 },
            { nom: "Thé Vert Bio", info: "Infusion relaxante de haute qualité.", photo: "https://images.unsplash.com/photo-1544787210-22bb840c5d6f", sType: sTypes[4], b: boutiques[2], p: 45000 }
        ];

        const products = [];
        for (const pd of prodData) {
            const prod = await Produit.create({
                nom: pd.nom,
                info: pd.info,
                photo: pd.photo,
                sousTypeProduit: pd.sType._id,
                boutique: pd.b._id
            });
            products.push({ ...prod.toObject(), basePrice: pd.p });
        }

        console.log("Stock & Price movements...");
        for (const p of products) {
            await MouvementProduit.create({
                produit: p._id,
                in: 100,
                out: 0,
                boutique: p.boutique
            });
            await MouvementPrixProduit.create({
                produit: p._id,
                prix: p.basePrice
            });
        }

        console.log("Creating Buyers (Passwords will be hashed)...");
        const buyersData = [
            { nom: "Alice Liddell", email: "alice@test.com", motDePasse: "test", role: "acheteur", isActive: true },
            { nom: "Bob Marley", email: "bob@test.com", motDePasse: "test", role: "acheteur", isActive: true },
            { nom: "Charlie Brown", email: "charlie@test.com", motDePasse: "test", role: "acheteur", isActive: true }
        ];

        const buyers = [];
        for (const bData of buyersData) {
            const b = await Utilisateur.create(bData);
            buyers.push(b);
        }

        console.log("Announcements...");
        await Annonce.insertMany([
            { boutique: boutiques[0]._id, contenu: "Nouveauté : Le MacBook Pro M3 est maintenant disponible en boutique ! Rendez-vous chez Matrix Tech pour le découvrir en avant-première.", photos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"] },
            { boutique: boutiques[0]._id, contenu: "Restockage en cours : nos Samsung S24 Ultra sont de retour en stock après rupture. Commandez dès maintenant !", photos: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c"] },
            { boutique: boutiques[1]._id, contenu: "La nouvelle collection printemps-été est arrivée ! Découvrez nos chemises en lin et jeans slim dans vos coloris préférés.", photos: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8"] },
            { boutique: boutiques[1]._id, contenu: "Horaires spéciaux ce weekend : Vogue Fashion sera ouvert de 10h à 18h. Au plaisir de vous accueillir !", photos: [] },
            { boutique: boutiques[2]._id, contenu: "Nouveau produit en rayon : notre Café Arabica 1kg issu de producteurs locaux est désormais disponible à la commande.", photos: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e"] },
            { boutique: boutiques[2]._id, contenu: "Restockage Thé Vert Bio effectué ! Nos stocks sont reconstitués, passez vite votre commande avant la prochaine rupture.", photos: ["https://images.unsplash.com/photo-1544787210-22bb840c5d6f"] }
        ]);

        console.log("Reviews...");
        await AvisNote.insertMany([
            { utilisateur: buyers[0]._id, boutique: boutiques[0]._id, note: 5, avis: "Excellent service et produits de pointe !" },
            { utilisateur: buyers[1]._id, boutique: boutiques[0]._id, note: 4, avis: "Bon prix, mais attente un peu longue à la récupération." },
            { utilisateur: buyers[2]._id, boutique: boutiques[1]._id, note: 5, avis: "Ma boutique de vêtements préférée ❤️" }
        ]);

        console.log("Favorites...");
        await Favori.insertMany([
            { utilisateur: buyers[0]._id, boutique: boutiques[0]._id },
            { utilisateur: buyers[0]._id, boutique: boutiques[1]._id },
            { utilisateur: buyers[1]._id, boutique: boutiques[1]._id }
        ]);

        console.log("Generating Orders history (30 days)...");
        const now = new Date();
        const etatArecup = getEtat(ETATS.A_RECUPERER);
        const etatAttente = getEtat(ETATS.EN_ATTENTE);
        const etatPayeRecup = getEtat(ETATS.PAYEE_ET_RECUPEREE);
        const etatAnnule = getEtat(ETATS.ANNULEE);

        for (let i = 0; i < 60; i++) { // 60 simulated orders
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);

            const buyer = buyers[Math.floor(Math.random() * buyers.length)];
            const prod = products[Math.floor(Math.random() * products.length)];
            const boutique = boutiques.find(b => b._id.toString() === prod.boutique.toString());

            const randomState = Math.random();
            let state;
            if (randomState < 0.6) state = etatPayeRecup;
            else if (randomState < 0.8) state = etatArecup;
            else if (randomState < 0.9) state = etatAttente;
            else state = etatAnnule;

            const qte = Math.floor(Math.random() * 3) + 1;
            const total = prod.basePrice * qte;
            const taux = boutique.tauxCommission || 5;
            const commission = (total * taux) / 100;

            const panier = await Panier.create({
                utilisateur: buyer._id,
                etat: state._id,
                produit: prod._id,
                prix: prod.basePrice,
                quantite: qte,
                createdAt: date,
                updatedAt: date
            });

            const achat = await Achat.create({
                client: buyer._id,
                boutique: boutique._id,
                total: total,
                commission: commission,
                nombreItems: qte,
                createdAt: date,
                updatedAt: date
            });

            await AchatInfo.create({
                achat: achat._id,
                panier: panier._id,
                prix: prod.basePrice,
                quantite: qte,
                etat: state._id,
                createdAt: date
            });
        }

        console.log("Seeding completed! ✅");
        console.log("Users to test (All passwords hashed):");
        console.log("- Admin: admin@mean.com / test");
        console.log("- Boutique Matrix: matrix@mean.com / test");
        console.log("- Buyer Alice: alice@example.com / test");

    } catch (error) {
        console.error("Seeding failed! ❌");
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};


seed();
