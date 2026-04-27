import { Router } from 'express'; import { prisma } from '../db.js'; import { authRequired,requireRole } from '../middleware/auth.js'; import { asyncHandler } from '../utils/asyncHandler.js';
export const adminRouter=Router(); adminRouter.use(authRequired,requireRole('ADMIN'));
adminRouter.get('/stats',asyncHandler(async(_req,res)=>{const [users,payments,requests]=await Promise.all([prisma.user.count(),prisma.payment.count(),prisma.aiRequest.count()]); res.json({users,payments,requests});}));
adminRouter.get('/users',asyncHandler(async(_req,res)=>res.json({users:await prisma.user.findMany({orderBy:{createdAt:'desc'},take:100,select:{id:true,email:true,name:true,role:true,credits:true,createdAt:true}})})));
adminRouter.get('/payments',asyncHandler(async(_req,res)=>res.json({payments:await prisma.payment.findMany({orderBy:{createdAt:'desc'},take:100})})));
