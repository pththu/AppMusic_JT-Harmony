const axios = require("axios");

exports.searchTracks = async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get("https://api.jamendo.com/v3.0/tracks", {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID,
        format: "json",
        limit: 10,
        search: q,
      },
    });
    res.json(response.data.results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
