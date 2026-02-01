import { requireUserKey } from "@/lib/server/requireUserKey";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const userKey = requireUserKey(req);
    return NextResponse.json({ ok: true, userKey });
  } catch {
    return NextResponse.json(
      { error: "Missing x-user-key" },
      { status: 400 }
    );
  }
}
