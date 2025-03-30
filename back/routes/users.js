const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const mailer = require("../utils/mailer") ; // Importa il mailer

//GET
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password"); //esclude il campo password
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//POST registrazione
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Verifica se l'email esiste già
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email già registrata" });
        }

        const newUser = new User({ firstName, lastName, email, password });
        await newUser.save();
        
        // Non inviare la password nella risposta
        const userWithoutPassword = newUser.toObject();
        delete userWithoutPassword.password;

        // Invia email di benvenuto
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: "Benvenuto!",
            text: `Ciao ${firstName},\n\nGrazie per esserti registrato alla nostra piattaforma!`
        };

        mailer.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Errore durante l'invio dell'email:", error);
            } else {
                console.log("Email inviata:", info.response);
            }
        });

        res.status(201).json(userWithoutPassword);
       
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//POST login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email
        })
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato" });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Password errata" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
);

module.exports = router;

// PUT update
router.put("/:id", async (req, res) => {
    try {
      const { firstName, lastName, currentPassword, newPassword } = req.body;
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
  
      // Verifica password attuale se si sta tentando di cambiarla
      if (newPassword) {
        if (user.password !== currentPassword) {
          return res.status(401).json({ message: "Password attuale non corretta" });
        }
        user.password = newPassword;
      }
  
      user.firstName = firstName;
      user.lastName = lastName;
  
      await user.save();
  
      // Non inviare la password nella risposta
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
  
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE utente
  router.delete("/:id", async (req, res) => {
      try {
          const comment = await User.findByIdAndDelete(req.params.id);
          if (!comment) {
              return res.status(404).json({ message: "utente non trovato" });
          }
          res.json({ message: "utente eliminato" });
      } catch (err) {
          res.status(500).json({ error: err.message });
      }
  });
  
  module.exports = router;