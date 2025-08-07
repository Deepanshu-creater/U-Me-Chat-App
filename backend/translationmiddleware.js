const translationLimitMiddleware = (req, res, next) => {
  if (!req.user.paid && req.user.translationCount >= 5) {
    return res.status(403).json({
     error: "You've used all 5 free translations!",
      upgradeMessage: "Upgrade to premium for unlimited translations.",
      upgradeUrl: "/api/payment/checkout", // Payment link
      limitReached: true
    });
  }
  next();
};
module.exports = translationLimitMiddleware;