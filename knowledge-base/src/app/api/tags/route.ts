import { NextResponse } from "next/server";
import { requireUserKey } from "@/lib/server/requireUserKey";
import { listTags, createTag } from "@/lib/services/tags";
import { z } from "zod";

const createTagSchema = z.object({
  name: z.string().trim().min(1),
});

export async function GET(req: Request) {
  let userKey: string;

  try {
    userKey = requireUserKey(req);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }

  const tags = await listTags(userKey);
  return NextResponse.json(tags);
}

export async function POST(req: Request) {
  let userKey: string;

  try {
    userKey = requireUserKey(req);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = createTagSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const tag = await createTag(userKey, parsed.data.name);
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Tag already exists")) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
