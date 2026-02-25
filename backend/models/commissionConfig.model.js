const mongoose = require("mongoose");

// Document unique — taux global de commission
const CommissionConfigSchema = new mongoose.Schema(
    {
        tauxGlobal: { type: Number, required: true, default: 5 }, // en %
    },
    { timestamps: true }
);

module.exports = mongoose.model("commission_config", CommissionConfigSchema);
