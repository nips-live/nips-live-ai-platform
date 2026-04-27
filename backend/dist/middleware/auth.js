import { verifyUser } from '../utils/token.js';
export function authOptional(req, _res, next) { const h = req.headers.authorization; if (h?.startsWith('Bearer ')) {
    try {
        req.user = verifyUser(h.slice(7));
    }
    catch { }
} next(); }
export function authRequired(req, res, next) { const h = req.headers.authorization; if (!h?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Unauthorized' }); try {
    req.user = verifyUser(h.slice(7));
    return next();
}
catch {
    return res.status(401).json({ error: 'Invalid token' });
} }
export const requireRole = (...roles) => (req, res, next) => { if (!req.user)
    return res.status(401).json({ error: 'Unauthorized' }); if (!roles.includes(req.user.role))
    return res.status(403).json({ error: 'Forbidden' }); return next(); };
