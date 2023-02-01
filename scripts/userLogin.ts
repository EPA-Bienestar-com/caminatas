import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

const app = express();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      const user = {
        accessToken,
        refreshToken,
        profile,
      };

      await saveUserToDatabase(user);

      cb(null, user);
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user.profile.id);
});

passport.deserializeUser(async (id, cb) => {
  const user = await getUserFromDatabase(id);
  cb(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const state = req.query.state;

    if (state === req.session.state) {
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  }
);

app.listen(3000, () => {
  console.log("OAuth server is listening on port 3000");
});

async function saveUserToDatabase(user) {
  // Save the user to the database
}

async function getUserFromDatabase(id) {
  // Retrieve the user from the database
}
