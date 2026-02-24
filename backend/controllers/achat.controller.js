const achat = require("../models/achat.model");
const achatInfo = require("../models/achatInfo.model");
const panier = require("../models/panier.model");
const achatService = require("../services/achat.service");
const panierController = require("./panier.controller");
const mongoose = require("mongoose");


exports.createAchat = async (req, res) => {
  try {
    const paniers = req.body.map(data => new panier(data));
    const achatData = achatService.extractAchat(paniers);
    const achatInfos = achatService.extractAchatInfo(paniers);
    const newAchat = await achat.create(achatData);
    const newAchatInfos = await achatInfo.insertMany(achatInfos.map(info => ({ ...info, achat: newAchat._id })));
    const panierValidate = await panierController.validerPaniers(req, res);
    res.status(201).json(newAchat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAchatById = async (req, res) => {
    try {
        const achatId = req.params.achatId;
        const achatData = await achat.findById(achatId).populate('client').populate('etat');
        if (!achatData) {
            return res.status(404).json({ error: "Achat non trouvé" });
        }
        res.status(200).json(achatData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAchatsByUser = async (req, res) => {
    try{
        const userId = req.params.userId;
        const achats = await achat.find({ client: userId }).populate('etat').sort({ createdAt: -1 });
        res.status(200).json(achats);
    } catch (err) {
        res.status(400).json({ error: err.message });   
    }
};

exports.getAchatDetails = async (req, res) => {
    try {
        const achatId = req.params.achatId;
        const achatDetails = await achatInfo.find({ achat: achatId }).populate({
            path: 'panier',
            populate: {
                 path: 'produit',
                 select: 'nom',
                populate: { 
                    path: 'boutique',
                    select: 'nom'
                }
             }
        });

        res.status(200).json(achatDetails);
    }catch(err){
        res.status(400).json({ error: err.message });
    }
};

exports.achatRecent = async (req, res) => {
    try {
        const recentAchats = await achat.find().sort({ createdAt: -1 }).limit(3).populate('etat');
        res.status(200).json(recentAchats);
    } catch (err) {
        res.status(400).json({ error: err.message });
        }
};

exports.listCommmandes = async (req, res) => {
    try {
        const {boutique} = req.params;
        const boutiqueId = boutique? new mongoose.Types.ObjectId(boutique) : null;
        const etat =  new mongoose.Types.ObjectId("6997d956319cef48fa23a812");
        console.log("Boutique ID:", boutiqueId);
        console.log("Etat ID:", etat);
        
        const commandes = await achatInfo.aggregate([
            { $lookup: {
                from: 'achats',
                localField: 'achat',
                foreignField: '_id',
                as: 'achatDetails'
             }
            },
            {
                $unwind: '$achatDetails'
            },
            { $lookup: {
                from: 'paniers',
                localField: 'panier',
                foreignField: '_id',
                as: 'panierDetails'
            }},
            { $unwind: '$panierDetails' },
            { $lookup: {
                from: 'utilisateurs',
                localField: 'panierDetails.utilisateur',
                foreignField: '_id',
                as: 'clientDetails'
             }
            },
            { $unwind: '$clientDetails' },

            { $lookup: {
                from: 'produits',
                localField: 'panierDetails.produit',
                foreignField: '_id',
                as: 'produitDetails'
             }
            },
            { $unwind: '$produitDetails' },

            { $match: { "produitDetails.boutique": boutiqueId, "panierDetails.etat": etat } },
            { $group: {
                _id: '$achat',
                totalPrix: { $sum: { $multiply: ["$panierDetails.quantite", "$panierDetails.prix"] } },
                totalQuantite: { $sum: "$panierDetails.quantite" },
                createdAt: { $first: "$achatDetails.createdAt" },
                client: { $first: "$clientDetails.nom" },
                etat: { $first: "$achatDetails.etat" }
            } },
            { $project: {
                _id: 1,
                totalPrix: 1,
                totalQuantite: 1,
                createdAt: 1,
                client: 1,
                etat: 1
            }
            }
        ]);
        // console.log(commandes);
        res.status(200).json(commandes);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};