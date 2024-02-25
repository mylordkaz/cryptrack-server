import { Request, Response } from 'express';
import prisma from '../models/prismaClient';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import validator from "validator"




const createToken = (_id: number) => {
    return jwt.sign({_id}, process.env.SECRET || '', {expiresIn: '3d'})
}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        throw new Error('Incorrect email');
      }
  
      const match = await bcrypt.compare(password, user.password);
  
      if (!match) {
        throw new Error('Incorrect password');
      }
  
      // create a token
      const token = createToken(user.id);
  
      res.status(200).json({ email, token });
    } catch (error:any) {
      res.status(400).json({ error: error.message });
    }
  };

  export const registerUser = async (req: Request, res: Response) => {
    const {username, email, password} = req.body

    try {
        if (!email || !password){
            throw new Error('All fields must be filled')
        }
        if(!validator.isEmail(email)){
            throw new Error('Email not valid')
        }
        if(!validator.isStrongPassword(password)){
            throw new Error('Password not strong enough')
        }
        const exist = await prisma.user.findUnique({where: {email}})

        if (exist){
            throw new Error('Email already in use')
        }

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const newUser = await prisma.user.create({data: {username, email, password: hash }})
        const token = createToken(newUser.id)

        res.status(200).json({email, token})
    } catch (error:any) {
        res.status(400).json({error: error.message })
    }
  }