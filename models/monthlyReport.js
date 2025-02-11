const mongoose = require("mongoose");

const monthlyReportSchema = new mongoose.Schema({
    userid: { type: Number, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    costs: {
        food: { type: Number, default: 0 },
        health: { type: Number, default: 0 },
        housing: { type: Number, default: 0 },
        sport: { type: Number, default: 0 },
        education: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model("MonthlyReport", monthlyReportSchema);
