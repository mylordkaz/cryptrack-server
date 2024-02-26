import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';


interface AuthenticatedRequest extends Request {
  user?: any; 
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');
  console.log('Received Token:', token);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  console.log("request header:", req.headers)
  
  try {
    
    console.log('Secret:', process.env.SECRET || 'mycryptoapp');

    const decoded = jwt.verify(token, process.env.SECRET || 'mycryptoapp') as any;
    

    req.user = decoded;
    
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
