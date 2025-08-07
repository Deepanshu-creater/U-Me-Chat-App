// authMiddleware.js
const jwt = require('jsonwebtoken');
const Appmodel = require('./schema');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Appmodel.findById(decoded.id); // Fetch full user
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = { // Attach all required fields
      id: user._id,
      username: user.username,
      paid: user.paid || false, // Default to false if undefined
      translationCount: user.translationCount || 0
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};