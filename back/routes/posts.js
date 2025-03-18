const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { upload, default: uploadCloudinary } = require('../utils/cloudinary');

//GET tutti i post
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        // Aggiungi il filtro per autore se presente
        const filter = req.query.author ? { author: req.query.author } : {};

        // Conta il totale dei post
        const totalPosts = await Post.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limit);

        // Ottieni i post paginati
        const posts = await Post.find(filter)
            .populate("author", "firstName lastName")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Ordina per data di creazione, più recenti prima

        res.json({
            posts,
            currentPage: page,
            totalPages,
            totalPosts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//GET post per id
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "firstName lastName");
        if (!post) {
            return res.status(404).json({ message: "Post non trovato" });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//POST
router.post("/", uploadCloudinary.single('cover'), async (req, res) => {
    try {
        const { title, category, content, readTime, author } = req.body;
        
        // Validazione dei dati
        if (!title || !category || !content || !author || !req.file) {
            return res.status(400).json({ 
                message: "Tutti i campi sono obbligatori" 
            });
        }

        // Parse readTime da stringa a oggetto JSON
        const parsedReadTime = JSON.parse(readTime);

        const newPost = new Post({
            title,
            category,
            cover: req.file.path, // Usa il path del file caricato su Cloudinary
            content,
            readTime: parsedReadTime,
            author
        });

        const savedPost = await newPost.save();
        
        // Popola i dati dell'autore prima di inviare la risposta
        const populatedPost = await Post.findById(savedPost._id)
            .populate('author', 'firstName lastName');

        res.status(201).json(populatedPost);
    } catch (err) {
        console.error('Errore server:', err);
        res.status(500).json({ 
            message: "Errore durante il salvataggio del post",
            error: err.message 
        });
    }
});

//PUT
router.put("/:id", uploadCloudinary.single('cover'), async (req, res) => {
    try {
        const { title, category, content, readTime } = req.body;
        
        const updateData = {
            title,
            category,
            content,
            readTime: JSON.parse(readTime)
        };

        // Aggiorna il cover solo se è stato caricato un nuovo file
        if (req.file) {
            updateData.cover = req.file.path;
        }

        const post = await Post.findByIdAndUpdate(
            req.params.id, 
            updateData,
            { new: true } // Ritorna il documento aggiornato
        ).populate('author', 'firstName lastName');

        if (!post) {
            return res.status(404).json({ message: "Post non trovato" });
        }

        res.json(post);
    } catch (err) {
        console.error('Errore server:', err);
        res.status(500).json({ 
            message: "Errore durante l'aggiornamento del post",
            error: err.message 
        });
    }
});

//DELETE
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post non trovato" });
        }
        res.json({ message: "Post eliminato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
);


module.exports = router;