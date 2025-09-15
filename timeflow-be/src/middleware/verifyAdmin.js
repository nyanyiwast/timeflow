const verifyToken = require('./auth');

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  });
};

module.exports = verifyAdmin;