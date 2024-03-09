import { Request, Response } from 'express';
import prisma from '../models/prismaClient';

interface AuthenticatedRequest extends Request {
  user?: any;
}
interface Transaction {
  name: string;
  quantity: number;
}

interface Totals {
  [name: string]: number;
}

export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
    });

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'transactions not found' });
    }

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

function calculateTotalHold(transactions: Transaction[]): Totals {
  const totals: Totals = {};

  transactions.forEach((transaction) => {
    const { name, quantity } = transaction;

    if (!totals[name]) {
      totals[name] = 0;
    }

    totals[name] += quantity;
  });

  return totals;
}
export const getTotalAmounts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Fetch transactions from the database
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
    });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found' });
    }

    // Calculate total amounts based on transaction names
    const totalAmounts = calculateTotalHold(transactions);

    // Combine transactions and total amounts in the response
    const response = { totalAmounts };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send('Internal Server Error');
  }
};
