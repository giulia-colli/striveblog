require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("./utils/passport");

//routes
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const authRoutes = require("./routes/auth");

const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in produzione
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 ore
    }
}));

//passport
app.use(passport.initialize());
app.use(passport.session());

//Mongo
mongoose.connect(process.env.MONGO_URL, { });

mongoose.connection.on("connected", () => {
    console.log("Connesso a MongoDB");
});
mongoose.connection.on("error", (err) => {
    console.log("Errore di connessione a MongoDB", err);
});


//URL
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

//AVVIO SERVER
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});

