"use client";
import { NewNoteDialog } from "@/components/notes/NewNoteDialog";
import { Navbar } from "@/components/Navbar";


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
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

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

async function handleCreateTag() {
  if (!newTagName.trim()) return;

  setCreatingTag(true);

  try {
    const res = await apiFetch("/api/tags", {
      method: "POST",
      body: JSON.stringify({ name: newTagName.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error ?? "Failed to create tag");
      return;
    }

    setNewTagName("");
    setTags((prev) => [data, ...prev]);
  } catch {
    alert("Failed to create tag");
  } finally {
    setCreatingTag(false);
  }
}



 return (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />

    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notes</h1>
      </div>

      {/* Create Tag */}
      <div className="space-y-2 rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-medium">Create Tag</div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewTagName(e.target.value)
            }
            placeholder="Tag name"
            className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm"
          />

          <Button
            onClick={handleCreateTag}
            disabled={creatingTag}
            variant="outline"
          >
            {creatingTag ? "Adding…" : "Add"}
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
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

      {loading && (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((n) => (
          <Link
            key={n.id}
            href={`/notes/${n.id}`}
            className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(n.updatedAt).toLocaleString()}
              </div>
            </div>

            {n.content ? (
              <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {n.content}
              </div>
            ) : null}

            {n.noteTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {n.noteTags.map((nt) => (
                  <span
                    key={nt.tag.id}
                    className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-foreground"
                  >
                    {nt.tag.name}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}

        {!loading && !error && notes.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            No notes found.
          </div>
        )}
      </div>
    </div>
  </div>
);
}