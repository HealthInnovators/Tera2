import { GoogleGenerativeAI } from '@google/generative-ai';
<<<<<<< HEAD

const model = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
export const genAI = model.getGenerativeModel({ model: 'gemini-2.0-flash' });
=======
import pool from '@/lib/db';
const model = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
export const genAI = model.getGenerativeModel({ model: 'gemini-2.0-flash' });
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
const result = await pool.query('SELECT NOW()');
res.status(200).json({ time: result.rows[0] });
}
>>>>>>> origin/main
