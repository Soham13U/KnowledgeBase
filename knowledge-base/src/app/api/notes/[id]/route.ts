import { NextResponse } from "next/server";
import { requireUserKey } from "@/lib/server/requireUserKey";
import { getNoteById } from "@/lib/services/notes";

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
