const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/Users');


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Local Strategy
passport.use (new LocalStrategy(
    { 
        usernameField: 'email',
        passwordField: 'password'
    }, 
    async(email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Utente non trovato' });
            }

            // Verifica se l'utente ha una password (potrebbe essere un utente Google)
            if (!user.password) {
                return done(null, false, { message: 'Metodo di autenticazione non valido' });
            }

            // Verifica se la password è già hashata (controlla se inizia con $2b$)
            const isMatch = user.password.startsWith('$2b$') 
                ? await bcrypt.compare(password, user.password) 
                : user.password === password; // Fallback per password non hashate

            if (!isMatch) {
                return done(null, false, { message: 'Password errata' });
            }
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }
));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3100/auth/google/callback'
}, async(accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // Verifica se esiste già un utente con questa email
            const existingUser = await User.findOne({ email: profile.emails[0].value });
            if (existingUser) {
                // Aggiorna l'utente esistente con l'ID Google
                existingUser.googleId = profile.id;
                await existingUser.save();
                return done(null, existingUser);
            }

            // Create a new user
            user = await User.create({
                googleId: profile.id,
                firstName: profile.name.givenName, // Corretto da 'name' a 'firstName'
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                password: await bcrypt.hash(Math.random().toString(36), 10) // Random password
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
}
));




module.exports = passport;