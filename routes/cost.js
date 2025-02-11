const express = require("express");
const router = express.Router();
const Cost = require("../models/cost");
const User = require("../models/user"); // Import User model to check if the user exists

// Define supported categories
const CATEGORIES = ["food", "health", "housing", "sport", "education"];


const MonthlyReport = require("../models/monthlyReport"); // Import MonthlyReport model
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
        const user = await User.findOne({ id: userid });
        if (!user) {
            return res.status(404).json({ error: `User with ID ${userid} not found` });
        }

        // Determine the correct date
        let date;
        if (year && month && day) {
            date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        } else {
            date = new Date();
        }

        // Create and save the cost item
        const cost = new Cost({ description, category, userid, sum, date });
        await cost.save();

        // **Ensure the monthly report updates correctly**
        const updatedReport = await MonthlyReport.findOneAndUpdate(
            { userid, year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 },
            { $inc: { [`costs.${category}`]: sum } }, // Increment the category total
            { upsert: true, new: true }
        );

        res.status(200).json({cost});
    } catch (err) {
        console.error("Error adding cost:", err);
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

        // Convert to numbers
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

        // Initialize response with categories, setting default value to 0
        const categorizedCosts = CATEGORIES.reduce((acc, category) => {
            acc[category] = 0; // Default value for empty categories
            return acc;
        }, {});

        // Populate response with actual cost data
        costs.forEach(cost => {
            // If category is empty (0), initialize as an array
            if (categorizedCosts[cost.category] === 0) {
                categorizedCosts[cost.category] = [];
            }
            categorizedCosts[cost.category].push({
                sum: cost.sum,
                description: cost.description,
                day: new Date(cost.date).getDate()
            });
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
        console.error("Error fetching report:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
