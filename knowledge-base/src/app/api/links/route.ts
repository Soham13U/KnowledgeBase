import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireUserKey } from "@/lib/server/requireUserKey";
import { createLink, deleteLink } from "@/lib/services/links";

const createLinkSchema = z.object({
  fromId: z.number().int(),
  toId: z.number().int(),
});

export async function POST(req: Request) {
  try {
    const userKey = requireUserKey(req);

    const body = await req.json();
    const parsed = createLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { fromId, toId } = parsed.data;
    if (fromId === toId) {
      return NextResponse.json(
        { error: "Self link not allowed" },
        { status: 400 },
      );
    }

    try {
      const link = await createLink(userKey, fromId, toId);
      return NextResponse.json(link, { status: 201 });
    } catch (err) {
      // Duplicate link (composite id / unique violation)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Link already exists" },
          { status: 409 },
        );
      }
      if (err instanceof Error && err.message.includes("Note not found")) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      if (err instanceof Error && err.message.includes("Self link")) {
        return NextResponse.json(
          { error: "Self link not allowed" },
          { status: 400 },
        );
      }
      throw err;
    }
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }
}
export async function DELETE(req: Request) {
  try {
    const userKey = requireUserKey(req);

    const { searchParams } = new URL(req.url);
    const fromRaw = searchParams.get("fromId");
    const toRaw = searchParams.get("toId");

    const fromId = fromRaw ? Number(fromRaw) : NaN;
    const toId = toRaw ? Number(toRaw) : NaN;

    if (!Number.isInteger(fromId) || !Number.isInteger(toId)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await deleteLink(userKey, fromId, toId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }
}
