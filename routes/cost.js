const express = require("express");
const router = express.Router();
const Cost = require("../models/cost");

// Add Cost Item
router.post("/add", async (req, res) => {
    try {
        const { description, category, userid, sum } = req.body;
        const cost = new Cost({ description, category, userid, sum });
        await cost.save();
        res.json(cost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Monthly Report
router.get("/report", async (req, res) => {
    try {
        const { id, year, month } = req.query;
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const costs = await Cost.find({
            userid: id,
            created_at: { $gte: start, $lte: end }
        });

        const grouped = costs.reduce((acc, cost) => {
            acc[cost.category] = acc[cost.category] || [];
            acc[cost.category].push(cost);
            return acc;
        }, {});

        res.json(grouped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
