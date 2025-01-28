const express = require("express");
const router = express.Router();

router.get("/about", (req, res) => {
    res.json([
        { first_name: "Niv", last_name: "Romano" },
        { first_name: "Moshe Matan", last_name: "Sityon" }
    ]);
});

module.exports = router;
