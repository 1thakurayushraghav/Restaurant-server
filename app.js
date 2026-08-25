const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Razorpay webhook needs the raw body for signature verification — mount BEFORE json parser
app.use("/api/payments/razorpay/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/api", apiLimiter);
app.use("/api", routes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Shree Munnalal API is running" });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
