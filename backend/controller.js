const Appmodel = require("./schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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
const forgotPassword = async (req, res) => {
  try {
    // 1. Find user with explicit field selection
    const user = await Appmodel.findOne({ username: req.body.username })
      .select('+resetToken +resetTokenExpiry +email');
    
    if (!user) {
      
      return res.status(200).json({ 
        message: 'If this username exists, a reset link has been sent' 
      });
    }

    // 2. Generate tokens
    const resetTokenRaw = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256')
      .update(resetTokenRaw)
      .digest('hex');

    // 3. Update with write concern
    const updateResult = await Appmodel.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken: hashedToken,
          resetTokenExpiry: new Date(Date.now() + 7200000) // Explicit Date object
        } 
      },
      { writeConcern: { w: 'majority' } } // Ensure write completes
    );

    console.log('Database update:', {
      matched: updateResult.matchedCount,
      modified: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    });

    // 4. Verify with fresh read (including hidden fields)
    const updatedUser = await Appmodel.findById(user._id)
      .select('+resetToken +resetTokenExpiry');
    
    if (!updatedUser.resetToken || !updatedUser.resetTokenExpiry) {
      throw new Error('Token fields not saved despite successful update');
    }

    console.log('Verified token save:', {
      tokenExists: !!updatedUser.resetToken,
      expiry: updatedUser.resetTokenExpiry,
      valid: updatedUser.resetTokenExpiry > new Date()
    });

    // 5. Send reset email
    const resetUrl = `https://u-me-chat-app.vercel.app/reset-password?token=${encodeURIComponent(resetTokenRaw)}`;
       const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });


    res.status(200).json({ message: 'Reset link sent if user exists' });
  } catch (error) {
    console.error('Password reset error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};
const resetPassword = async (req, res) => {
  if (!req.body.token || typeof req.body.token !== 'string') {
    return res.status(400).json({ 
      message: 'Valid token is required',
      received: {
        token: req.body.token ? 'present' : 'missing',
        type: typeof req.body.token
      }
    });
  }

  if (!req.body.newPassword || req.body.newPassword.length < 8) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters',
      receivedLength: req.body.newPassword ? req.body.newPassword.length : 0
    });
  }

  try {
    // 1. Verify token exists in database first (NEW CHECK)
    const allActiveTokens = await Appmodel.find({
      resetToken: { $exists: true }
    }).select('resetToken resetTokenExpiry');
    
    if (allActiveTokens.length === 0) {
      console.error('No active reset tokens found in database');
      return res.status(400).json({ 
        message: 'No active password reset requests found',
        debug: {
          dbState: 'No tokens found',
          serverTime: new Date()
        }
      });
    }

    // 2. Process the token
    const decodedToken = decodeURIComponent(req.body.token);
    const hashedToken = crypto.createHash('sha256').update(decodedToken).digest('hex');

    console.log('Reset attempt:', {
      rawToken: req.body.token,
      decodedToken,
      hashedToken,
      dbTokens: allActiveTokens.map(t => t.resetToken.substring(0, 8)),
      time: new Date()
    });

    // 3. Find user with EXACT match (case-sensitive)
    const user = await Appmodel.findOne({
      resetToken: { $eq: hashedToken }, // Strict equality
      resetTokenExpiry: { $gt: Date.now() }
    });

  if (!user) {
  // 4. Detailed diagnostic when token not found
  const similarTokens = allActiveTokens.filter(t => 
    t.resetToken.startsWith(hashedToken.substring(0, 8))
  ).map(t => ({
    tokenStart: t.resetToken.substring(0, 8),
    expiry: new Date(t.resetTokenExpiry)
  }));

  console.error('Token validation failed:', {
    receivedHash: hashedToken.substring(0, 8),
    similarTokensInDB: similarTokens,
    timeDifference: allActiveTokens.map(t => 
      Date.now() - t.resetTokenExpiry)
  });

  return res.status(400).json({ 
    message: 'Invalid or expired token',
    debug: {
      reason: !similarTokens.length ? 'Token not found in DB' : 'Token expired',
      expiryTime: similarTokens[0]?.expiry || null,
      serverTime: new Date()
    }
  });
}
    // 5. Update password
    user.password = await bcrypt.hash(req.body.newPassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    await user.save();
    console.log(`Password reset successful for ${user._id}`);

    return res.status(200).json({ 
      message: 'Password updated successfully',
      success: true 
    });

  } catch (error) {
    console.error('Critical reset error:', {
      error: error.message,
      stack: error.stack,
      token: req.body.token?.substring(0, 8),
      timestamp: new Date()
    });
    
    return res.status(500).json({ 
      message: 'Internal server error during password reset',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
  
 