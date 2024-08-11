const path = require("path");
const express = require("express");
const router = express.Router();

// Serve static files from the 'dist' directory
router.use(express.static(path.join(__dirname, "../dist")));

// Serve index.html for all other routes (to support client-side routing)
router.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
});

module.exports = router;
