import express from "express";
import { getExchangeRate } from "../controllers/exchangeController.js";

const router = express.Router();

router.get("/", getExchangeRate);

export default router;
