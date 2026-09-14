const jwt = require("jsonwebtoken");

// ==========================================
// VERIFY JWT TOKEN
// ==========================================

const verifyToken = (req, res, next) => {
  try {
    console.log("====================================");
    console.log("AUTH MIDDLEWARE");
    console.log("Authorization Header:", req.headers.authorization);
    console.log("====================================");

    let token = req.header("Authorization");

    // ------------------------------------------
    // TOKEN NOT PROVIDED
    // ------------------------------------------

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No token provided.",
      });
    }

    // ------------------------------------------
    // SUPPORT BOTH:
    //
    // Authorization: token
    //
    // AND:
    //
    // Authorization: Bearer token
    // ------------------------------------------

    if (token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    token = token.trim();

    console.log("Token received:", token ? "YES" : "NO");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. Invalid token.",
      });
    }

    // ------------------------------------------
    // VERIFY TOKEN
    // ------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("JWT decoded:", decoded);

    // ------------------------------------------
    // STORE USER INFORMATION
    // ------------------------------------------

    req.user = decoded;

    // ------------------------------------------
    // CONTINUE
    // ------------------------------------------

    next();
  } catch (error) {
    console.error(
      "JWT Verification Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = verifyToken;