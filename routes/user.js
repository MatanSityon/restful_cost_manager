const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Cost = require("../models/cost");

/**
 * @route GET /api/users/:id
 * @description Retrieves details of a specific user, including total costs.
 * @access Public
 * @param {string} req.params.id - The ID of the user to fetch.
 * @returns {Object} The user details including `first_name`, `last_name`, `id`, and total cost sum.
 */
router.get("/users/:id", async (req, res) => {
    try {
        const userId = Number(req.params.id);

        const user = await User.findOne({ id: userId });

        if (!user)
            return res.status(404).json({ error: "User not found" });


        res.json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total: user.total_cost || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



/**
 * @route POST /api/users
 * @description Creates a new user in the database.
 * @access Public
 * @param {number} req.body.id - Unique ID for the user.
 * @param {string} req.body.first_name - User's first name.
 * @param {string} req.body.last_name - User's last name.
 * @param {string} req.body.birthday - User's birthdate (ISO 8601 format).
 * @param {string} req.body.marital_status - User's marital status.
 * @returns {Object} The created user object.
 */
router.post("/users", async (req, res) => {
    try {
        const { id, first_name, last_name, birthday, marital_status } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ id });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Create a new user document
        const user = new User({ id, first_name, last_name, birthday, marital_status });

        // Save the new user in the database
        await user.save();

        // Return the created user with status 201 (Created)
        res.status(201).json(user);
    } catch (err) {
        // Handle server errors
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
