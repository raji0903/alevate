const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Alevate API is healthy"
    });
});

module.exports = router;