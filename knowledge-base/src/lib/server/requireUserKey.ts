import { NextResponse } from "next/server";
import { z } from "zod";

const nonEmptyStringSchema = z.string().min(1);

export function requireUserKey(req: Request) {
  const userKey = req.headers.get("x-user-key");

  const result = nonEmptyStringSchema.safeParse(userKey);

  if (!result.success) {
    throw new Error("Missing or invalid user key header");
  }

  return result.data;
}
