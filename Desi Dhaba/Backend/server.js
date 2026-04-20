const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const validateEnv = require("./config/validateEnv");
const socket = require("./lib/socket");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
validateEnv();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socket.init(io);

io.on("connection", (sock) => {
  console.log(`⚡ Socket connected: ${sock.id}`);

  sock.on("join_order", (orderId) => {
    sock.join(`order_${orderId}`);
  });

  sock.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${sock.id}`);
  });
});

connectDB().then(() => {
  ensureIndexes();
});

async function ensureIndexes() {
  try {
    const Order = require("./models/Order");
    const Cart = require("./models/Cart");
    const Review = require("./models/Review");
    const FoodItem = require("./models/FoodItem");
    const Restaurant = require("./models/Restaurant");

    await Order.collection.createIndex({ userId: 1, createdAt: -1 });
    await Order.collection.createIndex({ status: 1, createdAt: -1 });
    await Order.collection.createIndex({ restaurantId: 1, createdAt: -1 });
    await Cart.collection.createIndex({ userId: 1 }, { unique: true });
    await Review.collection.createIndex({ targetId: 1, targetType: 1 });
    await Review.collection.createIndex({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
    await FoodItem.collection.createIndex({ restaurantId: 1, isAvailable: 1 });
    await FoodItem.collection.createIndex({ category: 1 });
    await Restaurant.collection.createIndex({ isActive: 1, isOpen: 1 });

    console.log("✅  MongoDB indexes ensured");
  } catch (err) {
    console.error("[INDEX] Failed to create indexes:", err.message);
  }
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many auth attempts, please try again later." },
});

app.use("/api/", apiLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/refresh", authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(mongoSanitize());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown";
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? "healthy" : "degraded",
    db: dbStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/restaurants", require("./routes/restaurantRoutes"));
app.use("/api/v1/foods", require("./routes/foodRoutes"));
app.use("/api/v1/cart", require("./routes/cartRoutes"));
app.use("/api/v1/orders", require("./routes/orderRoutes"));
app.use("/api/v1/reviews", require("./routes/reviewRoutes"));
app.use("/api/v1/coupons", require("./routes/couponRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/payments", require("./routes/paymentRoutes"));

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Desi Dhaba API is running 🚀",
    version: "2.0.0",
    apiBase: "/api/v1",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅  Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  console.log(`📡  API Base: http://localhost:${PORT}/api/v1`);
  console.log(`❤️   Health:  http://localhost:${PORT}/health`);
});

const shutdown = async (signal) => {
  console.log(`\n[${signal}] Shutting down gracefully…`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("✅  MongoDB connection closed.");
    } catch (err) {
      console.error("Error closing MongoDB connection:", err.message);
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
