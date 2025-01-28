const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Cost = require("../models/cost");

// Get Specific User Details
router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ error: "User not found" });

        const totalCosts = await Cost.aggregate([
            { $match: { userid: user.id } },
            { $group: { _id: null, total: { $sum: "$sum" } } }
        ]);

        const total = totalCosts[0]?.total || 0;

        res.json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});
// Add New User
router.post("/users", async (req, res) => {
    try {
        const { id, first_name, last_name, birthday, marital_status } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ id });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const user = new User({ id, first_name, last_name, birthday, marital_status });
        await user.save();

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
