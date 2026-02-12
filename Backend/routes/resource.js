const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");

router.post("/", async (req, res) => {
  try {
    const { title, link } = req.body;
    if (!title || !link)
      return res.status(400).json({ message: "Title and link required" });
    const newResource = new Resource({ title, link });
    await newResource.save();
    res.status(201).json(newResource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
