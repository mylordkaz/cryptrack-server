import { Request, Response } from 'express';
import prisma from '../models/prismaClient';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import validator from 'validator';
import dotenv from 'dotenv';
dotenv.config();


const SECRET = process.env.SECRET; //"my_secret"

export const registerUser = async (req:Request, res:Response) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    if(!email || !password){
      throw new Error('All fields must be filled')
    }
    if (!validator.isEmail(email)){
      throw new Error('Email not valid')
    }
    if(!validator.isStrongPassword(password)){
      throw new Error('Password not strong enough')
    }

    const exist = await prisma.user.findUnique({where: {email}})
    if(exist){
      throw new Error('email already in use')
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ id: user.id, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if(!SECRET){
    console.error("SECRET is not defined in the environment variable")
    return res.status(500).send('Internal Server Error')
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {expiresIn: '3d'});

  res.json({ token });
};