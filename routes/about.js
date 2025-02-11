const express = require("express");
const router = express.Router();

/**
 * @route GET /api/about
 * @description Returns information about the development team.
 * @access Public
 * @returns {Object[]} An array of team members, each containing:
 *  - `first_name` {string} - The first name of the team member.
 *  - `last_name` {string} - The last name of the team member.
 */
router.get("/about", (req, res) => {
    res.json([
        { first_name: "Niv", last_name: "Romano" },
        { first_name: "Moshe Matan", last_name: "Sityon" }
    ]);
});

module.exports = router;
