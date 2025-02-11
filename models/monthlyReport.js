const mongoose = require("mongoose");

const monthlyReportSchema = new mongoose.Schema({
    userid: { type: Number, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    costs: {
        food: { type: Array, default: [] },
        health: { type: Array, default: [] },
        housing: { type: Array, default: [] },
        sport: { type: Array, default: [] },
        education: { type: Array, default: [] }
    }
});

module.exports = mongoose.model("MonthlyReport", monthlyReportSchema);
