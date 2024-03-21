import { Request, Response } from 'express';
import prisma from '../models/prismaClient';
import bcrypt from 'bcrypt';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user.id;
  const { username, email, currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let newHash = user.password;

    if (
      newPassword &&
      currentPassword &&
      (await bcrypt.compare(currentPassword, user.password))
    ) {
      newHash = await bcrypt.hash(newPassword, 10);
    } else if (newPassword) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        username: username || user.username,
        email: email || user.email,
        password: newHash,
      },
    });
    res.json({ message: 'Profile updated succesfully' });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};
