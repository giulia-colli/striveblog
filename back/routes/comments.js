const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// GET commenti per post
router.get("/post/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate("author", "firstName lastName")
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST nuovo commento
router.post("/", async (req, res) => {
    try {
        const { content, author, post } = req.body;
        const newComment = new Comment({ content, author, post });
        const savedComment = await newComment.save();
        const populatedComment = await Comment.findById(savedComment._id)
            .populate("author", "firstName lastName");
        res.status(201).json(populatedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE commento
router.delete("/:id", async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Commento non trovato" });
        }
        res.json({ message: "Commento eliminato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;