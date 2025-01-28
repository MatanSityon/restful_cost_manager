const mongoose = require("mongoose");

/**
 * Defines the schema for cost items in the MongoDB database.
 * Each cost entry includes a description, category, user ID, amount, and date.
 */
const costSchema = new mongoose.Schema({
    /**
     * Short description of the cost item.
     * @type {string}
     * @required
     */
    description: { type: String, required: true },

    /**
     * Category of the cost item.
     * Must be one of the predefined categories: "food", "health", "housing", "sport", "education".
     * @type {string}
     * @enum {"food" | "health" | "housing" | "sport" | "education"}
     * @required
     */
    category: {
        type: String,
        enum: ["food", "health", "housing", "sport", "education"],
        required: true
    },

    /**
     * The user ID associated with this cost entry.
     * This allows linking costs to specific users.
     * @type {number}
     * @required
     */
    userid: { type: Number, required: true },

    /**
     * The total sum (amount) of the cost item.
     * @type {number}
     * @required
     */
    sum: { type: Number, required: true },

    /**
     * The date of the expense.
     * Defaults to the current date if not provided.
     * @type {Date}
     * @default Date.now
     */
    date: { type: Date, default: Date.now }
});

/**
 * Exports the Cost model based on the schema.
 * This model interacts with the "costs" collection in MongoDB.
 */
module.exports = mongoose.model("Cost", costSchema);
