import { prisma } from '../db.js'; import { HttpError } from '../utils/http.js';
export async function spendCredit(userId:string|undefined,cost=1){ if(!userId)return; const u=await prisma.user.findUnique({where:{id:userId}}); if(!u)throw new HttpError(401,'User not found'); if(u.credits<cost)throw new HttpError(402,'Not enough credits'); await prisma.user.update({where:{id:userId},data:{credits:{decrement:cost}}}); }
export const grantCredits=(userId:string,credits:number)=>prisma.user.update({where:{id:userId},data:{credits:{increment:credits}}});
