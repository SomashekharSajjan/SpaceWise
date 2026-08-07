const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("Headers:", req.headers);

  const token = req.header("Authorization");

  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = verifyToken;