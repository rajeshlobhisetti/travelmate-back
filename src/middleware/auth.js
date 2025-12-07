function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ message: 'Unauthorized' });
}

function ensureAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'ADMIN') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

module.exports = { ensureAuthenticated, ensureAdmin };
