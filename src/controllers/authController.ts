import { Request, Response } from 'express';
import prisma from '../models/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.SECRET || 'my_secret';
const REFRESH = process.env.REFRESH_SECRET || 'my_refresh_secret';

const generateAccessToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: '15m',
  });
};
const generateRefreshToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, REFRESH, {
    expiresIn: '7d',
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    if (!email || !password) {
      throw new Error('All fields must be filled');
    }
    if (!validator.isEmail(email)) {
      throw new Error('Email not valid');
    }
    if (!validator.isStrongPassword(password)) {
      throw new Error('Password not strong enough');
    }

    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) {
      throw new Error('email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // if (!SECRET) {
    //   console.error('SECRET is not defined in the environment variable');
    //   return res.status(500).send('Internal Server Error');
    // }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'none',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'none',
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log('loginUser called'); // Log to check if the function is called
  console.log('Request body:', req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  console.log('User found:', user);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    console.log('Invalid credentials');
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // if (!SECRET) {
  //   console.error('SECRET is not defined in the environment variable');
  //   return res.status(500).send('Internal Server Error');
  // }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  console.log('access Token:', accessToken);
  console.log('refresh Token:', refreshToken);

  res.cookie('AccessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'none',
  });
  res.cookie('RefreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'none',
  });

  console.log('Set-Cookie:', res.getHeaders()['set-cookie']);
  res.json({ accessToken, refreshToken });
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).send('No token');
    }

    const isTokenBlacklisted = await prisma.blacklistedToken.findUnique({
      where: { token: refreshToken },
    });

    if (isTokenBlacklisted) {
      return res.sendStatus(401); // already invalidated
    }

    // add token to blacklist
    await prisma.blacklistedToken.create({
      data: { token: refreshToken },
    });
    // remove token from cookie
    res.cookie('accessToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'none',
    });
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'none',
    });

    res.sendStatus(200); // Logout successful
  } catch (error) {
    console.error('Error during logout:', error);
    res.sendStatus(500); // Internal Server Error
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  jwt.verify(refreshToken, REFRESH, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'none',
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'none',
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });
};
