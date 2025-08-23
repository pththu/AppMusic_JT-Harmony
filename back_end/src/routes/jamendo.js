const express = require("express");
const router = express.Router();
const { searchTracks } = require("../controllers/jamendoController");

router.get("/search", searchTracks);

module.exports = router;
