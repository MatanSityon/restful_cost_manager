const mongoose = require("mongoose");

/**
 * Defines the schema for storing individual cost entries in the MongoDB database.
 * Each cost entry includes details such as description, category, user ID, amount, and date.
 */
const costSchema = new mongoose.Schema({
    /**
     * Description of the cost.
     * Provides details about the expense.
     * @type {string}
     * @required
     */
    description: { type: String, required: true },

    /**
     * Category of the cost.
     * Must be one of the predefined categories: "food", "health", "housing", "sport", "education".
     * @type {string}
     * @enum ["food", "health", "housing", "sport", "education"]
     * @required
     */
    category: {
        type: String,
        enum: ["food", "health", "housing", "sport", "education"],
        required: true
    },

    /**
     * Unique numeric ID of the user associated with this cost.
     * @type {number}
     * @required
     */
    userid: { type: Number, required: true },

    /**
     * Amount spent on the cost.
     * @type {number}
     * @required
     */
    sum: { type: Number, required: true },

    /**
     * Year when the cost was recorded.
     * @type {number}
     * @required
     */
    year: { type: Number, required: true },

    /**
     * Month when the cost was recorded (1-12).
     * @type {number}
     * @required
     */
    month: { type: Number, required: true },

    /**
     * Day when the cost was recorded (1-31).
     * @type {number}
     * @required
     */
    day: { type: Number, required: true },

    /**
     * Time when the cost was recorded.
     * Stored as a string in "hh:mm" format.
     * @type {string}
     * @required
     */
    time: { type: String, required: true }
});

/**
 * Exports the Cost model based on the schema.
 * This model interacts with the "costs" collection in MongoDB.
 */
module.exports = mongoose.model("Cost", costSchema);
