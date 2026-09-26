const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../config/database');

/**
 * Verify Firebase ID Token or fallback local JWT.
 */
async function verifyToken(token) {
  if (!token) return null;

  // 1. Check if token is a Firebase Auth ID Token
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (decoded && decoded.payload && decoded.payload.iss && decoded.payload.iss.includes('securetoken.google.com')) {
      const payload = decoded.payload;
      const now = Math.floor(Date.now() / 1000);

      // Verify audience and expiration
      if (payload.aud === config.firebaseProjectId && payload.exp > now) {
        const userId = payload.user_id || payload.sub;
        const email = payload.email || `${userId}@firebase.user`;
        const name = payload.name || email.split('@')[0] || 'LegalLens User';

        // Check if user already exists in local DB or insert
        let user = db.findUserByEmail(email) || db.findUserById(userId);
        if (!user) {
          try {
            user = db.createUser({
              id: userId,
              name,
              email,
              password_hash: 'firebase-authenticated',
              created_at: new Date().toISOString()
            });
          } catch (e) {
            user = db.findUserByEmail(email);
          }
        }
        return user;
      }
    }
  } catch (firebaseErr) {
    // Continue to standard local JWT check
  }

  // 2. Standard Local JWT Token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.findUserById(decoded.userId);
    return user || null;
  } catch (jwtErr) {
    return null;
  }
}

/**
 * Required authentication middleware.
 * Verifies Firebase token or local JWT.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to access this feature.' });
  }

  const token = authHeader.split(' ')[1];
  const user = await verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please sign in again.' });
  }

  req.user = user;
  next();
}

/**
 * Optional authentication middleware.
 * Attaches user to req.user if a valid token is provided.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  verifyToken
};
