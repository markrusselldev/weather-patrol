const path = require("path");
const express = require("express");
const router = express.Router();

router.use(express.static(path.join(__dirname, "../dist"))); // Adjust path to frontend build

router.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist", "index.html")); // Adjust path to frontend build
});

module.exports = router;
