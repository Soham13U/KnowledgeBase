import { NextResponse } from "next/server";
import { requireUserKey } from "@/lib/server/requireUserKey";
import { listNotes, createNote } from "@/lib/services/notes";
import { z } from "zod";


const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  tagIds: z.array(z.number().int()).optional(),
});



export async function GET(req: Request) {
  try {
    const userKey = requireUserKey(req);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") ?? undefined;

    const tagIdRaw = searchParams.get("tagId");
    const tagId = tagIdRaw ? Number(tagIdRaw) : undefined;

    const notes = await listNotes(userKey, {
      query,
      tagId: Number.isInteger(tagId) ? tagId : undefined,
    });

    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const userKey = requireUserKey(req);

    const body = await req.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    try {
      const note = await createNote(userKey, parsed.data);
      return NextResponse.json(note, { status: 201 });
    } catch (err) {
      if (err instanceof Error && err.message.includes("Invalid tagIds")) {
        return NextResponse.json({ error: "Invalid tagIds" }, { status: 400 });
      }
      // unknown service/db failure
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  } catch (err) {
    // requireUserKey throws => missing header
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }
}


