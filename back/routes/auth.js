const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/Users');

// funzione generazione JWT
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Login Locale
router.post('/login/local', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) { return res.status(400).json({ message: info.message });
    }

    const token = generateToken(user);
    const userToSend = {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
    };
    res.json({ user: userToSend, token });
})(req, res, next);
});

// Registrazione Locale 
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Utente già registrato' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            firstName, 
            lastName, 
            email, 
            password: hashedPassword 
        });
        await newUser.save();

        const userToSend = {
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
        };

        const token = generateToken(newUser);
        res.status(201).json({ user: userToSend, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`https://striveblog-one.vercel.app/login?token=${token}`);
});

// Endpoint per ottenere le informazioni dell'utente corrente
router.get('/me', async (req, res) => {
    try {
        // Estrai il token dall'header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token non fornito' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verifica il token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Trova l'utente
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        
        res.json({ user });
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token non valido o scaduto' });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;