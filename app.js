const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

// Middleware untuk cek referer
function checkReferer(req, res, next) {
  const referer = req.headers.referer;
  if (!referer || !referer.startsWith("https://cek-rekening.lfourr.com/")) {
    return res.status(403).send("Access Denied");
  }
  next();
}

// Setup view engine dan static folder
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());

// Route home
app.get("/", (req, res) => {
  res.render("index");
});

// API daftar bank
app.get("/api/bank", checkReferer, async (req, res) => {
  try {
    const response = await axios.get("https://api-rekening.lfourr.com/listBank");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bank data" });
  }
});

// API daftar e-wallet
app.get("/api/ewallet", checkReferer, async (req, res) => {
  try {
    const response = await axios.get("https://api-rekening.lfourr.com/listEwallet");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching e-Wallet data" });
  }
});

// API cek akun
app.post("/checkAccount", checkReferer, async (req, res) => {
  const { layanan, bankCode, accountNumber } = req.body;
  const apiUrl =
    layanan === "bank"
      ? `https://api-rekening.lfourr.com/getBankAccount?bankCode=${bankCode}&accountNumber=${accountNumber}`
      : `https://api-rekening.lfourr.com/getEwalletAccount?bankCode=${bankCode}&accountNumber=${accountNumber}`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching account data",
      error: error.message
    });
  }
});

// Gunakan port dari environment Railway
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
