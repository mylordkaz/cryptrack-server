// import { Request, Response, NextFunction } from "express";
// import jwt, {JwtPayload} from "jsonwebtoken";
// import prisma from "../models/prismaClient";

// const requireAuth = async (req:Request, res:Response, next:NextFunction) =>{
//     const {authorization} = req.headers

//     if(!authorization){
//         return res.status(401).json({error: "Authorization token required"})
//     }
//     const token = authorization.split(' ')[1]

//     try {
//         const {_id} = jwt.verify(token, process.env.SECRET || '') as JwtPayload
        
//         req.user = await prisma.user.findUnique({where: {id: _id}, select: {id: true}})
//         next()
//     } catch (error:any) {
//         console.log(error);
//     res.status(401).json({ error: 'Request is not authorized' });
//     }
// }