const express = require("express");
const router = express.Router();
const Cost = require("../models/cost");

/**
 * @route POST /api/add
 * @description Adds a new cost item to the database.
 * @access Public
 * @param {string} req.body.description - A short description of the cost.
 * @param {string} req.body.category - The category of the cost (must be one of: "food", "health", "housing", "sport", "education").
 * @param {number} req.body.userid - The ID of the user who owns this cost entry.
 * @param {number} req.body.sum - The total sum of the cost.
 * @param {string} [req.body.created_at] - (Optional) A full ISO timestamp for the date of the expense.
 * @param {number} [req.body.year] - (Optional) The year of the expense (used if `created_at` is not provided).
 * @param {number} [req.body.month] - (Optional) The month of the expense (1-12, used if `created_at` is not provided).
 * @param {number} [req.body.day] - (Optional) The day of the expense (used if `created_at` is not provided).
 * @returns {Object} The created cost item.
 */
router.post("/add", async (req, res) => {
    try {
        const { description, category, userid, sum, created_at, year, month, day } = req.body;

        let date;
        if (created_at) {
            // If `created_at` is provided, use it as the date
            date = new Date(created_at);
        } else if (year && month && day) {
            // Convert year, month, and day to a UTC Date object
            // Month is zero-indexed in JavaScript, so subtract 1
            date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // 12:00 PM UTC prevents time zone shifts
        } else {
            // Default to the current date in UTC if no date is provided
            date = new Date();
        }

        // Create a new cost entry
        const cost = new Cost({
            description,
            category,
            userid,
            sum,
            date
        });

        // Save the cost entry in MongoDB
        await cost.save();

        // Return the saved cost item as JSON response
        res.json(cost);
    } catch (err) {
        // If an error occurs, send a 500 error response with the error message
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
