const express = require("express");
const router = express.Router();
const Cost = require("../models/cost");
const User = require("../models/user"); // Import User model to check if the user exists

// Define supported categories
const CATEGORIES = ["food", "health", "housing", "sport", "education"];

/**
 * @route POST /api/add
 * @description Adds a new cost item for a user.
 * @access Public
 * @param {string} req.body.userid - The ID of the user.
 * @param {string} req.body.description - A brief description of the cost.
 * @param {string} req.body.category - The category of the cost (food, health, housing, sport, education).
 * @param {number} req.body.sum - The cost amount.
 * @param {number} [req.body.year] - The year of the cost (optional).
 * @param {number} [req.body.month] - The month of the cost (optional, 1-12).
 * @param {number} [req.body.day] - The day of the cost (optional).
 * @returns {Object} The newly created cost object or an error message.
 */
router.post("/add", async (req, res) => {
    try {
        const { description, category, userid, sum, year, month, day } = req.body;

        // Ensure required fields are provided
        if (!description || !category || !userid || !sum) {
            return res.status(400).json({ error: "Missing required fields: description, category, userid, sum" });
        }

        // Ensure category is valid
        if (!CATEGORIES.includes(category)) {
            return res.status(400).json({ error: `Invalid category. Supported categories: ${CATEGORIES.join(", ")}` });
        }

        // Ensure user exists
        const userExists = await User.findOne({ id: userid });
        if (!userExists) {
            return res.status(404).json({ error: `User with ID ${userid} not found` });
        }

        // Determine the correct date
        let date;
        if (year && month && day) {
            date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // Force UTC date
        } else {
            date = new Date(); // Default to current date
        }

        // Create and save the cost item
        const cost = new Cost({ description, category, userid, sum, date });
        await cost.save();

        res.status(200).json(cost);
    } catch (err) {
        console.error("Error adding cost:", err); // Log the error for debugging
        res.status(500).json({ error: "Internal server error" });
    }
});

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
