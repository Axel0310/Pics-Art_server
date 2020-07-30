const express = require("express");
const router = express.Router();
const Tag = require("../models/Tag");

// Search for a tag
router.get("/:search", async (req, res, next) => {
    try {
        const fetchedTags = await Tag.find({
            name: { $regex: req.params.search, $options: "i" },
          });
          res.status(200).json(fetchedTags);
    } catch (error) {
        next(error)
    }
})


module.exports = router;