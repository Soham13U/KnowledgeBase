"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { EditNoteDialog } from "@/components/notes/EditNoteDialog";
import type { Tag } from "@/components/notes/TagMultiSelect";
import { DeleteNoteButton } from "@/components/notes/DeleteNoteButton";
import { LinkNoteDialog } from "@/components/notes/LinkNoteDialog";
import { Navbar } from "@/components/Navbar";




type NoteDetail = {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
  noteTags: Array<{ tag: { id: number; name: string } }>;
  outgoingLinks: Array<{ toNote: { id: number; title: string } }>;
  incomingLinks: Array<{ fromNote: { id: number; title: string } }>;
};

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [note, setNote] = useState<NoteDetail | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function reload() {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [noteRes, tagsRes] = await Promise.all([
        apiFetch(`/api/notes/${id}`),
        apiFetch("/api/tags"),
      ]);

      const [noteData, tagsData] = await Promise.all([
        noteRes.json(),
        tagsRes.json(),
      ]);

      if (!noteRes.ok) {
        setError(noteData?.error ?? "Failed to load note");
        setNote(null);
        return;
      }

      setNote(noteData);

      if (tagsRes.ok) {
        setAllTags(tagsData);
      } else {
        setAllTags([]);
      }
    } catch {
      setError("Failed to load note");
      setNote(null);
      setAllTags([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-black">
      <Navbar/>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/notes">
            <Button variant="outline">Back</Button>
          </Link>
          {note && (
  <LinkNoteDialog
    fromNoteId={note.id}
    existingToIds={note.outgoingLinks.map((l) => l.toNote.id)}
    onLinked={reload}
  />
)}


          <div className="flex items-center gap-2">
  {note && <EditNoteDialog note={note} allTags={allTags} onSaved={reload} />}
  {note && <DeleteNoteButton noteId={note.id} />}
</div>
        </div>

        {loading && <div className="text-zinc-500">Loading…</div>}
        {!loading && error && <div className="text-red-500">{error}</div>}

        {!loading && !error && note && (
          <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xl font-semibold">{note.title}</div>

            <div className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {note.content}
            </div>

            {note.noteTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.noteTags.map((nt) => (
                  <span
                    key={nt.tag.id}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                  >
                    {nt.tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-medium">Outbound links</div>
                <div className="space-y-2 text-sm">
                  {note.outgoingLinks.length === 0 ? (
                    <div className="text-zinc-500">None</div>
                  ) : (
                    note.outgoingLinks.map((l) => (
                      <Link
                        key={l.toNote.id}
                        href={`/notes/${l.toNote.id}`}
                        className="block underline"
                      >
                        {l.toNote.title}
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Backlinks</div>
                <div className="space-y-2 text-sm">
                  {note.incomingLinks.length === 0 ? (
                    <div className="text-zinc-500">None</div>
                  ) : (
                    note.incomingLinks.map((l) => (
                      <Link
                        key={l.fromNote.id}
                        href={`/notes/${l.fromNote.id}`}
                        className="block underline"
                      >
                        {l.fromNote.title}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-500">
              Updated: {new Date(note.updatedAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
