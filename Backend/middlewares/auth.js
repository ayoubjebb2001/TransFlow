const User = require('../models/User');
const { verifyToken } = require('../services/jwt');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Authorization header missing or malformed'
            });
        }
        const bearerToken = authHeader.slice(7);
        if (!bearerToken) {
            return res.status(401).json({
                status: 'error',
                message: 'Token not provided'
            });
        }

        const decoded = verifyToken(bearerToken);
        if (!decoded) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired token'
            });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            })
        }
        req.user = user;
        next();
    } catch (error) {

        next(error);

    }
}

module.exports = auth;