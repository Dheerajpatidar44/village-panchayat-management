import jwt from 'jsonwebtoken';

/**
 * Middleware: Verify JWT token
 * Attaches decoded user info to req.user
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ detail: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { sub: email, role, id }
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
};

/**
 * Middleware: Require specific role(s)
 * Usage: requireRole('admin') or requireRole('admin', 'clerk')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ detail: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ detail: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
};
