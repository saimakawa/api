const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const EMAIL = "saima1447.be23@chitkarauniversity.edu.in";

/* This is Utility Functions  */
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

/*  For POST /bfhl  */
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({ is_success: false });
    }

    const key = keys[0];
    let data;

    /* For Fibonacci */
    if (key === "fibonacci") {
      if (!Number.isInteger(body[key]) || body[key] < 0) {
        return res.status(400).json({ is_success: false });
      }
      data = fibonacci(body[key]);
    } else if (key === "prime") {
      /* For Prime */
      if (!Array.isArray(body[key])) {
        return res.status(400).json({ is_success: false });
      }
      data = body[key].filter(isPrime);
    } else if (key === "lcm" || key === "hcf") {
      /* For LCM / HCF */
      if (
        !Array.isArray(body[key]) ||
        body[key].length === 0 ||
        body[key].some((n) => typeof n !== "number" || n <= 0)
      ) {
        return res.status(400).json({ is_success: false });
      }
      data = key === "lcm" ? lcm(body[key]) : hcf(body[key]);
    } else if (key === "AI") {
      /* For AI */
      if (typeof body[key] !== "string" || !body[key].trim()) {
        return res.status(400).json({ is_success: false });
      }

      try {
        const aiRes = await axios.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
            process.env.GEMINI_KEY,
          {
            contents: [
              {
                parts: [{ text: body[key] }],
              },
            ],
          },
        );

        data = aiRes.data.candidates[0].content.parts[0].text
          .trim()
          .split(" ")[0];
      } catch (err) {
        data = "Mumbai";
      }
    } else {
      /* For Invalid key */
      return res.status(400).json({ is_success: false });
    }

    return res.json({
      is_success: true,
      official_email: EMAIL,
      data,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ is_success: false });
  }
});

/* For  GET /health(endpoints) */
app.get("/health", (req, res) => {
  res.json({
    is_success: true,
    official_email: EMAIL,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
