import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { logger } from "./logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler<C = any> = (req: NextRequest, context: C) => Promise<NextResponse>;

/**
 * Wraps an API route handler with centralized error handling and logging.
 * - Catches unhandled Prisma errors and maps them to proper HTTP responses
 * - Logs all errors with request context
 * - Returns consistent JSON error shape: { error: string }
 */
export function withHandler<C = unknown>(handler: RouteHandler<C>): RouteHandler<C> {
  return async (req: NextRequest, context: C): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (err) {
      const meta = { url: req.url, method: req.method };

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        logger.warn({ ...meta, prismaCode: err.code, err }, "Prisma known error");

        if (err.code === "P2025") {
          return NextResponse.json({ error: "Record tidak ditemukan" }, { status: 404 });
        }
        if (err.code === "P2002") {
          return NextResponse.json({ error: "Data sudah ada (duplikat)" }, { status: 409 });
        }
        if (err.code === "P2003") {
          return NextResponse.json({ error: "Referensi data tidak valid" }, { status: 422 });
        }

        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (err instanceof Prisma.PrismaClientValidationError) {
        logger.warn({ ...meta, err }, "Prisma validation error");
        return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
      }

      logger.error({ ...meta, err }, "Unhandled API error");
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
