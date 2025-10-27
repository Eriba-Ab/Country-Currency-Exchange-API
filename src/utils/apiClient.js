import { apiClient } from "../utils/apiClient.js";

export const fetchExchangeRate = async (from, to, amount) => {
  const apiKey = process.env.EXCHANGE_API_KEY;
  const response = await apiClient.get(`/pair/${from}/${to}/${amount}`, {
    params: { apiKey },
  });

  const { conversion_result, conversion_rate } = response.data;
  return { from, to, amount, conversion_rate, conversion_result };
};
