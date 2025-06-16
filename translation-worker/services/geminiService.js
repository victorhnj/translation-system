import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function traduzirComGemini(text, language) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `Traduza para ${language}: "${text}"`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}
