import { Request, Response } from 'express';
import prisma from '../models/prismaClient';

interface AuthenticatedRequest extends Request {
    user?: any; 
  }

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ id: user.id, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};