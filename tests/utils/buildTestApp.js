/**
 * Shared helper for building a minimal Express app around a single
 * controller/route for unit tests, with a stubbed `requireAuth`.
 *
 * Usage:
 *   const app = buildTestApp((router) => router.post("/api/items", createItem), {
 *     userId: "64f000000000000000000001",
 *   });
 */
import express from "express";

export const FAKE_USER_ID = "64f000000000000000000001";

export const buildTestApp = (mountFn, { userId = FAKE_USER_ID } = {}) => {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.use((req, _res, next) => {
    req.user = { id: userId };
    next();
  });
  mountFn(app);
  return app;
};