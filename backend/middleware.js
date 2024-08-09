const { verify } = require("jsonwebtoken");
const User = require("./models/user.model.js");

module.exports = async (req, res, next) => {
  const token = req.cookies["token"]; // Use req.cookies to get the token
  if (!token) {
    return res.status(401).json({ message: "No token" + token });
  }

  try {
    const { sub } = verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ discID: sub }); // Find user by discID
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user; // Attach user to req object
    next(); // Call the next middleware or route handler
  } catch (e) {
    console.log("Error verifying token:", e.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};
