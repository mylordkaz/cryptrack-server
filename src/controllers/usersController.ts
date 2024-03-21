import { Request, Response } from 'express';
import prisma from '../models/prismaClient';
import bcrypt from 'bcrypt';

interface AuthenticatedRequest extends Request {
  user?: any;
}
interface UpdateProfileRequest {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
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
  const { username, email, currentPassword, newPassword } =
    req.body as UpdateProfileRequest;
  const updateData: { username?: string; email?: string; password?: string } =
    {};

  if (username) {
    updateData.username = username;
  }

  if (email) {
    updateData.email = email;
  }

  if (newPassword && currentPassword && userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      res.status(401).json({ message: 'Invalid current password' });
      return;
    }
    updateData.password = await bcrypt.hash(newPassword, 10);
  } else if (newPassword && !currentPassword) {
    res
      .status(400)
      .json({ message: 'Current password is required for password update.' });
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
