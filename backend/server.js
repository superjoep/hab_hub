const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Import your middleware
const authenticateUser = require("./middleware.js");

// Models
const Trade = require("./models/trade.model.js");
const User = require("./models/user.model.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// Configure CORS to allow requests from your frontend
app.use(
  cors({
    origin: "https://habhub.site", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(cookieParser()); // Use cookie-parser middleware

app.post("/api/trade/delete", async (req, res) => {
  try {
    await Trade.deleteOne({ _id: req.body });
    res.status(200).json({ message: "Trade deleted successfully" });
  } catch (error) {
    console.error("Error deletingg trade:", error.message);
    res.status(400).json({ message: error.message });
  }
});
// Use the authenticateUser middleware for routes that need authentication
app.post("/api/trade", async (req, res) => {
  try {
    const newTrade = new Trade(req.body);
    const savedTrade = await newTrade.save();
    res.status(200).json(savedTrade);
  } catch (error) {
    console.error("Error adding trade:", error.message);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/trade", async (req, res) => {
  try {
    const trades = await Trade.find({});
    res.status(200).json(trades);
  } catch (error) {
    console.error("Error retrieving trades:", error.message);
    res.status(500).json({ message: error.message });
  }
});

app.get("/user/me", authenticateUser, (req, res) => {
  res.status(200).json(req.user);
});

app.get("/auth/discord", (req, res) => {
  const url =
    "https://discord.com/oauth2/authorize?client_id=1270757425829511281&response_type=code&redirect_uri=https%3A%2F%2Fbackend-empty-wildflower-8995.fly.dev%2Fauth%2Fdiscord%2Fcallback&scope=identify  ";
  res.redirect(url);
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  console.log("Authorization code:", code);

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.DISCORD_REDIRECT,
  });

  try {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const response = await axios.post(
      "https://discord.com/api/oauth2/token",
      params.toString(),
      { headers }
    );

    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });

    const { id, username, avatar } = userResponse.data;

    let user = await User.findOne({ discID: id });

    if (user) {
      await User.updateOne({ discID: id }, { username, avatar });
    } else {
      const userData = { discID: id, username, avatar };
      user = new User(userData);
      await user.save();
    }

    const token = jwt.sign({ sub: id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Ensures the cookie is only sent over HTTPS
      sameSite: "None", // Necessary for cross-site requests
      domain: "backend-empty-wildflower-8995.fly.dev", // Ensure this matches your backend domain
    });
  } catch (error) {
    console.error("Error during Discord OAuth process:", error.message);
    res.status(500).json({ message: "Error during Discord OAuth process" });
  }
  res.redirect("https://habhub.site");
});
app.post("/user/verify", async (req, res) => {
  try {
    console.log(req.body.discID + req.body.habName);
    //let habName = req.habName;
    await User.updateOne(
      { discID: req.body.discID },
      { habName: req.body.habName }
    );
    console.log("user updated");
  } catch (error) {
    console.error("error adding habboname");
  }
});
// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database");
    // Start the server after successful DB connection
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error.message);
    process.exit(1); // Exit the process if DB connection fails
  });
