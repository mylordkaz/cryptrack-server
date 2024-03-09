import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export const getCryptoPrices = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apiKey = process.env.APIKEY;
    const url = process.env.APIURL;

    if (!apiKey || !url) {
      throw new Error(
        'API key or URL is not defined in the environment variables.'
      );
    }

    const response = await axios.get(url, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
      },
    });
    const data = response.data;

    const cryptoPrices = data.data.map(
      (crypto: { name: any; quote: { USD: { price: any } } }) => ({
        name: crypto.name,
        price: crypto.quote.USD.price,
      })
    );
    (res as any).status(200).json({ cryptoPrices });
  } catch (error: any) {
    console.error('Error fetching crypto prices:', error.message);
    (res as any).status(500).send('Internal Server Error');
  }
};
