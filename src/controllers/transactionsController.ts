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

interface AddTransactionRequest extends AuthenticatedRequest {
  body: {
    name: string;
    price: number;
    amount?: number;
    quantity: number;
    date?: Date;
  };
}

export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name } = req.query;

    let whereClause = { userId: req.user.id } as any;

    if (name) {
      whereClause = {
        ...whereClause,
        name: { contains: name as string },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
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

export const addTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, price, quantity, date } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        name,
        price,
        quantity,
        date: date || new Date(),
        userId: req.user.id,
      },
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const deleteTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction no found' });
    }

    if (transaction.userId !== userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this transaction' });
    }

    await prisma.transaction.delete({
      where: { id: parseInt(transactionId) },
    });

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.log('Error deleting transaction:', error);
    res.status(500).send('Internal Server Error');
  }
};
