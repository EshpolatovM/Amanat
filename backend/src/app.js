import "./lib/bigint.js";
import "./lib/zod.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { swaggerConfig } from "./config/swagger.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.disable("x-powered-by");
if (env.trustProxy) {
  app.set("trust proxy", 1);
}

app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
  });
  next();
});

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig.spec));
app.get("/api-docs.json", (req, res) => res.json(swaggerConfig.spec));

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
