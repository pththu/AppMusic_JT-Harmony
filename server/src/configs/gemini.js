const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("⚠️ Vui lòng thiết lập GEMINI_API_KEY trong file .env");
  process.exit(1);
}

// Khởi tạo và export instance của genAI
// const genAI = new GoogleGenerativeAI(apiKey);
const genAI = new GoogleGenAI({ apiKey });

module.exports = { genAI };