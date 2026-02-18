const achat = require("../models/achat.model");
const achatInfo = require("../models/achatInfo.model");
const panier = require("../models/panier.model");
const achatService = require("../services/achat.service");

exports.createAchat = async (req, res) => {
  try {
    const paniers = req.body.map(data => new panier(data));
    const achatData = achatService.extractAchat(paniers);
    const achatInfos = achatService.extractAchatInfo(paniers);
    const newAchat = await achat.create(achatData);
    const newAchatInfos = await achatInfo.insertMany(achatInfos.map(info => ({ ...info, achat: newAchat._id })));
    res.status(201).json(newAchat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAchatById = async (req, res) => {
    try {
        const achatId = req.params.achatId;
        const achatData = await achat.findById(achatId).populate('client');
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
        const achats = await achat.find({ client: userId }).sort({ createdAt: -1 });
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
