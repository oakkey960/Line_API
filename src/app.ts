// app.ts
import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import authRoutes from "./routes/auth.route";
import publicRoutes from "./routes/public.route";
import lineWebhookRoutes from "./routes/lineWebhook.route";
import groupRoutes from "./routes/group.route";
import broadcastRoutes from "./routes/broadcast.route";
import templateRoutes from "./routes/template.route";
import sequelize from "./config/db";
import mediaRoutes from "./routes/media.route";

const app = express();

// LINE signatures must be checked against the untouched request bytes.
app.use("/api/line/webhook", lineWebhookRoutes);
app.use(express.json());
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_WEB_URL || "http://localhost:3000")
  .split(",").map((value) => value.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: false }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/ready", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: "ready", database: "connected" });
  } catch {
    res.status(503).json({ status: "not_ready", database: "unavailable" });
  }
});

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/line/groups", groupRoutes);
app.use("/api/broadcasts", broadcastRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/media",mediaRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ success: false, error: "Internal Server Error" });
});

export default app;
