const express = require("express");
const router = express.Router();
const Cost = require("../models/cost");
const User = require("../models/user");
const MonthlyReport = require("../models/monthly_report");

// Define supported categories
const CATEGORIES = ["food", "health", "housing", "sport", "education"];

/**
 * @route POST /api/add
 * @description Adds a new cost item for a user.
 * @access Public
 * @param {Object} req.body - The request body.
 * @param {string} req.body.userid - The ID of the user.
 * @param {string} req.body.description - A brief description of the cost.
 * @param {string} req.body.category - The category of the cost (must be one of the predefined categories).
 * @param {number} req.body.sum - The cost amount.
 * @param {number} [req.body.year] - The year of the cost (optional).
 * @param {number} [req.body.month] - The month of the cost (optional, 1-12).
 * @param {number} [req.body.day] - The day of the cost (optional).
 * @param {string} [req.body.time] - The time of the cost in "hh:mm" format (optional).
 * @returns {Object} The newly created cost object or an error message.
 */
router.post("/add", async (req, res) => {
    try {
        let { description, category, userid, sum, year, month, day, time } = req.body;

        // Ensure required fields are provided
        if (!description || !category || !userid || !sum) {
            return res.status(400).json({ error: "Missing required fields: description, category, userid, sum" });
        }

        // Set default values for missing date and time fields
        if (!month || !year || !day || !time) {
            const now = new Date();
            year = now.getFullYear();
            month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
            day = now.getDate();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            time = `${hours}:${minutes}`;
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

        // Validate time format (hh:mm)
        const timePattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
        if (!timePattern.test(time)) {
            return res.status(400).json({ error: "Invalid time format. Expected hh:mm (24-hour format)" });
        }

        // Convert values to correct types before saving
        const parsedUserId = Number(userid);
        const parsedSum = Number(sum);
        const parsedYear = Number(year);
        const parsedMonth = Number(month);
        const parsedDay = Number(day);

        if (isNaN(parsedUserId) || isNaN(parsedSum) || isNaN(parsedYear) || isNaN(parsedMonth) || isNaN(parsedDay)) {
            return res.status(400).json({ error: "Invalid numeric values provided" });
        }

        // Create and save the cost item
        const cost = new Cost({
            description,
            category,
            userid: parsedUserId,
            sum: parsedSum,
            year: parsedYear,
            month: parsedMonth,
            day: parsedDay,
            time
        });

        await cost.save();

        // **Ensure the monthly report updates correctly**
        const report = await MonthlyReport.findOneAndUpdate(
            { userid: parsedUserId, year: parsedYear, month: parsedMonth }, // Identify the report by user and month
            {
                $push: {
                    [`costs.${category}`]: { sum: parsedSum, description, day: parsedDay, time } // Store each expense
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ cost });

    } catch (err) {
        console.error("Error adding cost:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route GET /api/report
 * @description Retrieves the grouped monthly cost report for a user.
 * @access Public
 * @param {Object} req.query - The request query parameters.
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

        // Fetch costs for the given user and month
        const costs = await Cost.find({
            userid: userId,
            year: reportYear,
            month: reportMonth
        });

        // Initialize response with categories set to `0`
        const categorizedCosts = CATEGORIES.reduce((acc, category) => {
            acc[category] = 0; // Default to 0
            return acc;
        }, {});

        // Populate response if there are costs
        costs.forEach(cost => {
            if (categorizedCosts[cost.category] === 0) {
                categorizedCosts[cost.category] = [];
            }
            categorizedCosts[cost.category].push({
                sum: cost.sum,
                description: cost.description,
                day: cost.day
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
