"use client";
import { NewNoteDialog } from "@/components/notes/NewNoteDialog";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiFetch";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Tag = {
  id: number;
  name: string;
};

type Note = {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
  noteTags: Array<{
    tag: {
      id: number;
      name: string;
    };
  }>;
};

export default function NotesPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [query, setQuery] = useState("");
  const [tagId, setTagId] = useState<string>("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagIdNumber = useMemo(() => {
    if (tagId === "all") return undefined;
    const n = Number(tagId);
    return Number.isInteger(n) ? n : undefined;
  }, [tagId]);

  // Load tags once
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/tags");
        const data = await res.json();
        setTags(data);
      } catch {
        // tags failing shouldn't kill the whole page
      }
    })();
  }, []);

  // Load notes whenever query/tag changes
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("query", query.trim());
        if (tagIdNumber) params.set("tagId", String(tagIdNumber));

        const url = `/api/notes${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await apiFetch(url);

        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? "Failed to load notes");
          setNotes([]);
        } else {
          setNotes(data);
        }
      } catch {
        setError("Failed to load notes");
        setNotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [query, tagIdNumber]);


  async function reloadNotes() {
  setLoading(true);
  setError(null);

  try {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (tagIdNumber) params.set("tagId", String(tagIdNumber));

    const url = `/api/notes${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await apiFetch(url);
    const data = await res.json();

    if (!res.ok) {
      setError(data?.error ?? "Failed to load notes");
      setNotes([]);
    } else {
      setNotes(data);
    }
  } catch {
    setError("Failed to load notes");
    setNotes([]);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Notes</h1>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Select value={tagId} onValueChange={setTagId}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          
          <NewNoteDialog tags={tags} onCreated={reloadNotes} />

        </div>

        {loading && <div className="text-sm text-zinc-500">Loading…</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="space-y-3">
          {notes.map((n) => (
            <Link
              key={n.id}
              href={`/notes/${n.id}`}
              className="block rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-zinc-500">
                  {new Date(n.updatedAt).toLocaleString()}
                </div>
              </div>
              {n.content ? (
                <div className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {n.content}
                </div>
              ) : null}
              {n.noteTags.length > 0 ? (
  <div className="mt-3 flex flex-wrap gap-2">
    {n.noteTags.map((nt) => (
      <span
        key={nt.tag.id}
        className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
      >
        {nt.tag.name}
      </span>
    ))}
  </div>
) : null}

            </Link>
            
          ))}

          {!loading && !error && notes.length === 0 && (
            <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-800">
              No notes found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
