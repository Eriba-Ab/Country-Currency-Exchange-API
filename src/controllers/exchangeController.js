import { fetchExchangeRate } from "../services/exchangeService.js";

export const getExchangeRate = async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({
        error: "Missing required query parameters: from, to, amount",
      });
    }

    const result = await fetchExchangeRate(from, to, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exchange rate" });
  }
};
