const { ADMIN_PASSWORD } = require("../config");
const jwt = require('jsonwebtoken')
module.exports = async (req, res, next) => {
  try {
    const token = req.header("admin-auth-token");
    console.log(token)
    if (!token) {
      return res.status(401).send({
        error: true,
        message: "Please authenticate using a valid token",
        code:'AUTH_ERROR'
      });
    }
    jwt.verify(token, ADMIN_PASSWORD);
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).send({
      error: true,
      message: "Please authenticate using a valid token",
      code:'AUTH_ERROR'
    });
  }
};
