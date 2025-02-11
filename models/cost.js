const mongoose = require("mongoose");

const costSchema = new mongoose.Schema({
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ["food", "health", "housing", "sport", "education"],
        required: true
    },
    userid: { type: Number, required: true },
    sum: { type: Number, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    day: { type: Number, required: true },
    time: { type: String, required: true } // Storing as string "hh:mm"
});

module.exports = mongoose.model("Cost", costSchema);
