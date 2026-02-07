
"use client";

import * as React from "react";
import { apiFetch } from "@/lib/apiFetch";
import { TagMultiSelect, Tag } from "@/components/notes/TagMultiSelect";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type NoteDetail = {
  id: number;
  title: string;
  content: string;
  noteTags: Array<{ tag: { id: number; name: string } }>;
};

type Props = {
  note: NoteDetail;
  allTags: Tag[];
  onSaved: () => void; // refresh detail
};

export function EditNoteDialog({ note, allTags, onSaved }: Props) {
  const [open, setOpen] = React.useState(false);

  const initialTagIds = React.useMemo(
    () => note.noteTags.map((nt) => nt.tag.id),
    [note.noteTags]
  );

  const [title, setTitle] = React.useState(note.title);
  const [content, setContent] = React.useState(note.content ?? "");
  const [tagIds, setTagIds] = React.useState<number[]>(initialTagIds);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // When you open the dialog, reset fields to latest note data
  React.useEffect(() => {
    if (!open) return;
    setTitle(note.title);
    setContent(note.content ?? "");
    setTagIds(note.noteTags.map((nt) => nt.tag.id));
    setError(null);
  }, [open, note]);

  async function handleSave() {
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          tagIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to save");
        return;
      }

      setOpen(false);
      onSaved();
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm">Title</div>
            <Input
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm">Content</div>
            <Textarea
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
              rows={8}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm">Tags</div>
            <TagMultiSelect tags={allTags} value={tagIds} onChange={setTagIds} />
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
