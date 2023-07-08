const { ADMIN_PASSWORD, JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");
const userDataToRequest = require("./userDataToRequest");

// Middleware function to verify admin or user authentication token
module.exports = async (req, res, next) => {
  try {
    // Get token from request headers
    const token = req.header("admin-auth-token") || req.header("auth-token");
    if (!token) {
      // If token is not provided in headers, return an error
      return res
        .status(400)
        .send({ message: "Please provide auth token in headers" ,code:'INCORRECT_HEADERS'});
    }

    let decoded;

    // Try to verify token with admin password
    try {
      jwt.verify(token, ADMIN_PASSWORD);
      req.is_admin = true
      // If token is verified with admin password, call next middleware function
      return next();
    } catch (adminErr) {
      // If token is not verified with admin password, try to verify with user secret
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        // If token is verified with user secret, set user data in request object and call userDataToRequest middleware
        console.log('Token Data',decoded)
        req.user = decoded;
        await userDataToRequest(req, res, next);
      } catch (userErr) {
        // If token is not verified with user secret, return an error
        res.status(400).send({ message: "Invalid Auth Token" ,code:'AUTH_ERROR'});
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error",code:'ERROR' });
  }
};
