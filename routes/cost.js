const express = require("express");
const router = express.Router();
const Cost = require("../models/cost");
const User = require("../models/user"); // Import User model to check if the user exists

// Define supported categories
const CATEGORIES = ["food", "health", "housing", "sport", "education"];

/**
 * @route GET /api/report
 * @description Retrieves the grouped monthly cost report for a user.
 * @access Public
 * @param {string} req.query.id - The user ID.
 * @param {number} req.query.year - The year of the report.
 * @param {number} req.query.month - The month of the report (1-12).
 * @returns {Object} JSON response containing the cost report or an error message.
 */
router.get("/report", async (req, res) => {
    try {
        const { id, year, month } = req.query;

        // Validate required parameters
        if (!id || !year || !month) {
            return res.status(400).json({ error: "Missing required parameters: id, year, month" });
        }

        // Convert to numbers to ensure correct type
        const userId = Number(id);
        const reportYear = Number(year);
        const reportMonth = Number(month);

        // Check if user exists
        const userExists = await User.findOne({ id: userId });
        if (!userExists) {
            return res.status(404).json({ error: `User with ID ${userId} not found` });
        }

        // Define the date range for filtering
        const start = new Date(reportYear, reportMonth - 1, 1);
        const end = new Date(reportYear, reportMonth, 0);

        // Fetch costs for the given user and month
        const costs = await Cost.find({
            userid: userId,
            date: { $gte: start, $lte: end }
        });

        // Initialize response with empty categories
        const categorizedCosts = CATEGORIES.map(category => ({ [category]: [] }));

        // Populate response if there are costs
        costs.forEach(cost => {
            const categoryData = categorizedCosts.find(item => item[cost.category]);
            if (categoryData) {
                categoryData[cost.category].push({
                    sum: cost.sum,
                    description: cost.description,
                    day: new Date(cost.date).getDate()
                });
            }
        });

        // Construct the response object
        const response = {
            userid: userId,
            year: reportYear,
            month: reportMonth,
            costs: categorizedCosts
        };

        res.json(response);

    } catch (err) {
        console.error("Error fetching report:", err); // Log the error for debugging
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
