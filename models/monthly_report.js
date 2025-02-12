const mongoose = require("mongoose");

/**
 * Defines the schema for storing monthly reports in the MongoDB database.
 * Each report is associated with a user and contains categorized expenses.
 */
const monthlyReportSchema = new mongoose.Schema({
    /**
     * Unique numeric ID of the user associated with this report.
     * @type {number}
     * @required
     */
    userid: { type: Number, required: true },

    /**
     * Year of the monthly report.
     * @type {number}
     * @required
     */
    year: { type: Number, required: true },

    /**
     * Month of the report (1-12).
     * @type {number}
     * @required
     */
    month: { type: Number, required: true },

    /**
     * Categorized costs for the month.
     * Each category stores an array of expense entries.
     */
    costs: {
        /**
         * List of food-related expenses.
         * @type {Array}
         * @default []
         */
        food: { type: Array, default: [] },

        /**
         * List of health-related expenses.
         * @type {Array}
         * @default []
         */
        health: { type: Array, default: [] },

        /**
         * List of housing-related expenses.
         * @type {Array}
         * @default []
         */
        housing: { type: Array, default: [] },

        /**
         * List of sport-related expenses.
         * @type {Array}
         * @default []
         */
        sport: { type: Array, default: [] },

        /**
         * List of education-related expenses.
         * @type {Array}
         * @default []
         */
        education: { type: Array, default: [] }
    }
});

/**
 * Exports the MonthlyReport model based on the schema.
 * This model interacts with the "monthlyreports" collection in MongoDB.
 */
module.exports = mongoose.model("MonthlyReport", monthlyReportSchema);
