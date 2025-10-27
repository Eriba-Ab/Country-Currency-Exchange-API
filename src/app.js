import express from "express";
import exchangeRoutes from "./routes/exchangeRoutes.js";

const app = express();

app.use(express.json());
app.use("/api/exchange", exchangeRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Country Currency Exchange API is live 🚀" });
});

export default app;
