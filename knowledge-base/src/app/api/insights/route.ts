import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserKey } from "@/lib/server/requireUserKey";
import { getInsights } from "@/lib/services/insights";

const rangeSchema = z.union([z.literal("7"), z.literal("30")]);

export async function GET(req: Request) {
  let userKey: string;

  try {
    userKey = requireUserKey(req);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }

  const url = new URL(req.url);
  const rangeRaw = url.searchParams.get("range") ?? "7";
  const parsed = rangeSchema.safeParse(rangeRaw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const rangeDays = parsed.data === "7" ? 7 : 30;

  try {
    const data = await getInsights(userKey, rangeDays);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
