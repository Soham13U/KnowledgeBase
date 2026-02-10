import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserKey } from "@/lib/server/requireUserKey";
import { createLink, deleteLink } from "@/lib/services/links";

const createLinkSchema = z.object({
  fromId: z.number().int(),
  toId: z.number().int(),
});

export async function POST(req: Request) {
  let userKey: string;

  try {
    userKey = requireUserKey(req);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = createLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { fromId, toId } = parsed.data;

  try {
    const link = await createLink(userKey, fromId, toId);
    return NextResponse.json(link, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";

    if (msg.includes("Self link")) {
      return NextResponse.json(
        { error: "Self link not allowed" },
        { status: 400 }
      );
    }

    if (msg.includes("already exists")) {
      return NextResponse.json(
        { error: "Link already exists" },
        { status: 409 }
      );
    }

    if (msg.includes("Invalid note ids")) {
      return NextResponse.json(
        { error: "Invalid note ids" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  let userKey: string;

  try {
    userKey = requireUserKey(req);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }

  const url = new URL(req.url);
  const fromId = Number(url.searchParams.get("fromId"));
  const toId = Number(url.searchParams.get("toId"));

  if (!Number.isInteger(fromId) || !Number.isInteger(toId)) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const deleted = await deleteLink(userKey, fromId, toId);
  return NextResponse.json({ deleted });
}
