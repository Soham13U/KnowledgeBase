"use client";

import * as React from "react";
import { apiFetch } from "@/lib/apiFetch";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type NoteLite = { id: number; title: string };

type Props = {
  fromNoteId: number;
  existingToIds: number[]; // notes already linked from this note
  onLinked: () => void; // refresh detail
};

export function LinkNoteDialog({ fromNoteId, existingToIds, onLinked }: Props) {
  const [open, setOpen] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<NoteLite[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [linking, setLinking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debounced search
  React.useEffect(() => {
    if (!open) return;

    const trimmed = q.trim();
    // don’t spam when empty; but you can change this to show recent notes if you want
    if (trimmed.length === 0) {
      setResults([]);
      setError(null);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("query", trimmed);

        const res = await apiFetch(`/api/notes?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data?.error ?? "Search failed");
          setResults([]);
          return;
        }

        // filter: remove self + already linked targets
        const existing = new Set(existingToIds);
        const filtered = (data as NoteLite[]).filter(
          (n) => n.id !== fromNoteId && !existing.has(n.id)
        );

        setResults(filtered);
      } catch {
        setError("Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [q, open, fromNoteId, existingToIds]);

  async function createLink(toId: number) {
    setLinking(true);
    setError(null);

    try {
      const res = await apiFetch("/api/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fromId: fromNoteId, toId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Failed to link note");
        return;
      }

      setOpen(false);
      setQ("");
      setResults([]);
      onLinked();
    } catch {
      setError("Failed to link note");
    } finally {
      setLinking(false);
    }
  }

  return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button variant="outline">Link note</Button>
    </DialogTrigger>

    <DialogContent className="sm:max-w-lg bg-card border-border">
      <DialogHeader>
        <DialogTitle>Link this note to…</DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        <Input
          value={q}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQ(e.target.value)
          }
          placeholder="Search notes by title…"
          disabled={linking}
        />

        {loading && (
          <div className="text-sm text-muted-foreground">
            Searching…
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          q.trim().length > 0 &&
          results.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No results.
            </div>
          )}

        <div className="max-h-64 space-y-2 overflow-auto">
          {results.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => createLink(n.id)}
              disabled={linking}
              className="
                w-full
                rounded-md
                border
                border-border
                bg-card
                px-3
                py-2
                text-left
                text-sm
                hover:bg-muted
                disabled:opacity-50
              "
            >
              {n.title}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={linking}
          >
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

}
