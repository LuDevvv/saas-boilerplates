import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  uploadRequestSchema,
  uploadSuccessResponseSchema,
} from "@workspace/validators";
import { StorageController } from "./storage.controller";
import { authGuard } from "../../common/middlewares/authGuard";
import { rateLimit } from "../../common/middlewares/rateLimiter";
import type { AppContext } from "../../common/types/env";
import { ErrorSchema } from "@workspace/validators";

const app = new OpenAPIHono<AppContext>();

const uploadUrlRoute = createRoute({
  method: "post",
  path: "/upload-url",
  tags: ["Storage"],
  summary: "Request a presigned URL for direct-to-R2 uploads",
  description:
    "Generates a signed URL allowing direct uploads to the R2 bucket. Requires a valid JWT.",
  middleware: [
    rateLimit({ window: 60, limit: 20, keyPrefix: "storage" }),
    authGuard,
  ] as const,
  request: {
    body: {
      content: { "application/json": { schema: uploadRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Presigned URL successfully generated",
      content: { "application/json": { schema: uploadSuccessResponseSchema } },
    },
    400: {
      description: "Validation error constraints failed",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized - missing or invalid JWT",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

export const storageRouter = app
  .openapi(uploadUrlRoute, StorageController.getUploadUrl)
  .get("/image/:key{.+}", StorageController.getImage);
