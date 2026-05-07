const jwt = require('jsonwebtoken');

// Sets req.userId if a valid Bearer token is present, but never rejects the request.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.userId;
    } catch {
      // invalid / expired token — proceed as anonymous
    }
  }
  next();
};

module.exports = optionalAuth;
