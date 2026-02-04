import { NextResponse } from "next/server";
import { requireUserKey } from "@/lib/server/requireUserKey";
import { listTags, createTag } from "@/lib/services/tags";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const createTagSchema = z.object({
  name: z.string().trim().min(1),
});

export async function GET(req: Request) {
  try {
    const userKey = requireUserKey(req);
    const tags = await listTags(userKey);
    return NextResponse.json(tags);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const userKey = requireUserKey(req);
    const body = await req.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    try {
      const tag = await createTag(userKey, parsed.data.name);
      return NextResponse.json(tag, { status: 201 });
    } catch (err) {
      // duplicate tag per userKey -> unique constraint violation
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Tag already exists" },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }
}
