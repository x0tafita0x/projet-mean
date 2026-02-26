require("dotenv").config();
const mongoose = require("mongoose");
const Etat = require("./models/etat.model");

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const etats = await Etat.find();
        console.log(etats);
        mongoose.disconnect();
    })
    .catch(err => console.error(err));
