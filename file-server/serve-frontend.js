const path = require("path");
const express = require("express");
const mime = require("mime"); // Ensure this is installed and required correctly
const router = express.Router();

// Serve static files, ensuring MIME types are correct
router.use(
  express.static(path.join(__dirname, "../"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".jsx")) {
        res.setHeader("Content-Type", mime.getType("application/javascript"));
      }
    }
  })
);

// Serve index.html for all other routes
router.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../", "index.html"));
});

module.exports = router;
