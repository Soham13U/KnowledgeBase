import { NextResponse } from "next/server";
import { requireUserKey } from "@/lib/server/requireUserKey";
import { getNoteById } from "@/lib/services/notes";
import { z } from "zod";
import { updateNoteById } from "@/lib/services/notes";
import { deleteNoteById } from "@/lib/services/notes";

const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  tagIds: z.array(z.number().int()).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let userKey: string;

  try {
    userKey = requireUserKey(req);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = updateNoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const updated = await updateNoteById(userKey, id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Invalid tagIds")) {
      return NextResponse.json({ error: "Invalid tagIds" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userKey = requireUserKey(req);

    const { id: idStr } = await params; // <-- MUST await
    const id = Number(idStr);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const note = await getNoteById(userKey, id);
    if (!note) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let userKey: string;

  try {
    userKey = requireUserKey(req);
  } catch {
    return NextResponse.json({ error: "Missing x-user-key" }, { status: 400 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const deleted = await deleteNoteById(userKey, id);

  if (deleted === false) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted });
}
