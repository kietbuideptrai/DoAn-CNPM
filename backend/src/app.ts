import cors from "cors";
import express from "express";
import { adminRouter } from "./routes/admin.routes";
import { analyticsRouter } from "./routes/analytics.routes";
import { artifactsRouter } from "./routes/artifacts.routes";
import { healthRouter } from "./routes/health.routes";
import { languagesRouter } from "./routes/languages.routes";
import { museumRouter } from "./routes/museum.routes";
import { corsOptions } from "./middleware/cors";
import { errorHandler } from "./middleware/errors";
import { notFoundHandler } from "./middleware/not-found";

export const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/admin", adminRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/artifacts", artifactsRouter);
app.use("/api/languages", languagesRouter);
app.use("/api/museum", museumRouter);
app.use("/api/health", healthRouter);
app.use(notFoundHandler);
app.use(errorHandler);
