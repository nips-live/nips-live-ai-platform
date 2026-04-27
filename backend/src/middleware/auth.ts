import type {NextFunction,Request,Response} from 'express'; import {verifyUser,type JwtUser} from '../utils/token.js';
export interface AuthRequest extends Request{user?:JwtUser}
export function authOptional(req:AuthRequest,_res:Response,next:NextFunction){const h=req.headers.authorization;if(h?.startsWith('Bearer ')){try{req.user=verifyUser(h.slice(7))}catch{}}next()}
export function authRequired(req:AuthRequest,res:Response,next:NextFunction){const h=req.headers.authorization;if(!h?.startsWith('Bearer '))return res.status(401).json({error:'Unauthorized'});try{req.user=verifyUser(h.slice(7));return next()}catch{return res.status(401).json({error:'Invalid token'})}}
export const requireRole=(...roles:string[])=>(req:AuthRequest,res:Response,next:NextFunction)=>{if(!req.user)return res.status(401).json({error:'Unauthorized'}); if(!roles.includes(req.user.role))return res.status(403).json({error:'Forbidden'}); return next()};
