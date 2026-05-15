const Appmodel = require("./schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const registerUser = async (req, res) => {
    const { username, email, phone, password } = req.body;
     console.log("REGISTER BODY:", req.body);
    try {
       const existingEmail = await Appmodel.findOne({ email });
const existingUsername = await Appmodel.findOne({ username });

if (existingEmail) {
  return res.status(400).json({ message: "Email already registered" });
}
if (existingUsername) {
  return res.status(400).json({ message: "Username already taken" });
}

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Appmodel({
            username,
            email,
            phone,
            password: hashedPassword
        });
        await newUser.save();
        console.log("New User",newUser)        
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        res.status(201).json({ token, user: { id: newUser._id, username: newUser.username, email: newUser.email, phone: newUser.phone } });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Appmodel.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json();
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, phone: user.phone } });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = {registerUser, loginUser};