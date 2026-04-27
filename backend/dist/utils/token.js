import jwt from 'jsonwebtoken';
import { env } from '../env.js';
export const signUser = (u) => jwt.sign(u, env.jwtSecret, { expiresIn: '7d' });
export const verifyUser = (t) => jwt.verify(t, env.jwtSecret);
