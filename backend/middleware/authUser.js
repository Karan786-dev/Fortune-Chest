var jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const authUser = async (req, res, next) => {
    try {
        const token = req.header('auth-token');
        if (!token) {
            res.status(401).send({ error: true, message: "Please authenticate using a valid token", code: 'AUTH_ERROR' })
        }
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data;
        next();
    } catch (error) {
        res.status(401).send({ error: true, message: "Please authenticate using a valid token", code: 'AUTH_ERROR' })
    }
}
module.exports = authUser