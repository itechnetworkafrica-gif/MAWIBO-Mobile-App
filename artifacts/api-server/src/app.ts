import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// CORS — allow any origin in development; restrict to known origins in production
const allowedOrigins = [
  // Replit dev/deploy domains (wildcard matched below)
  /\.replit\.dev$/,
  /\.replit\.app$/,
  // Vercel preview + production deployments
  /\.vercel\.app$/,
  // Local development
  /^http:\/\/localhost(:\d+)?$/,
];

const vercelProductionUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : null;
const appUrl = process.env.APP_URL ?? null;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, mobile native)
      if (!origin) return callback(null, true);
      // Allow explicitly configured URLs
      if (
        (vercelProductionUrl && origin === vercelProductionUrl) ||
        (appUrl && origin === appUrl)
      ) {
        return callback(null, true);
      }
      // Allow pattern-matched origins
      if (allowedOrigins.some((pattern) => pattern.test(origin))) {
        return callback(null, true);
      }
      // In development, allow all
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
