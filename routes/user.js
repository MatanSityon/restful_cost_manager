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

module.exports = router;
