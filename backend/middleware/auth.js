import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cyber-trust-shield-super-secret-jwt-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate a JWT token for a given payload
 */
export function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Middleware: Mandatory JWT authentication
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(403).json({ message: 'Invalid or corrupted token.' });
  }
}

/**
 * Middleware: Mandatory Admin role requirement
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
}

/**
 * Middleware: Optional JWT authentication (populates req.user if valid token present)
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore token validation failure for optional auth
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}
