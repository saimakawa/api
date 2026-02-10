const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const EMAIL = "your_chitkara_email@chitkara.edu.in";

/* ---------- Utility Functions ---------- */
const fibonacci = (n) => {
  const res = [];
  let a = 0,
    b = 1;
  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
};

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const hcf = (arr) => arr.reduce((a, b) => gcd(a, b));
const lcm = (arr) => arr.reduce((a, b) => (a * b) / gcd(a, b));

/* ---------- POST /bfhl ---------- */
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const key = Object.keys(body)[0];

    if (!key || Object.keys(body).length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Invalid request",
      });
    }

    let data;

    if (key === "fibonacci") {
      data = fibonacci(body[key]);
    } else if (key === "prime") {
      data = body[key].filter(isPrime);
    } else if (key === "lcm") {
      data = lcm(body[key]);
    } else if (key === "hcf") {
      data = hcf(body[key]);
    } else if (key === "AI") {
      const aiRes = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
          process.env.GEMINI_KEY,
        {
          contents: [{ parts: [{ text: body[key] }] }],
        },
      );
      data = aiRes.data.candidates[0].content.parts[0].text.split(" ")[0];
    } else {
      return res.status(400).json({ is_success: false });
    }

    res.json({
      is_success: true,
      official_email: EMAIL,
      data,
    });
  } catch (err) {
    res.status(500).json({
      is_success: false,
      message: "Server error",
    });
  }
});

/* ---------- GET /health ---------- */
app.get("/health", (req, res) => {
  res.json({
    is_success: true,
    official_email: EMAIL,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
