"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteNoteButton({ noteId }: { noteId: number }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

 async function onDelete() {
  setLoading(true);
  try {
    const res = await apiFetch(`/api/notes/${noteId}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);

    console.log("DELETE status", res.status, data);

    if (!res.ok) {
      alert(data?.error ?? "Delete failed");
      return;
    }

    router.push("/notes");
  } finally {
    setLoading(false);
  }
}


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this note?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the note and its links/tags.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
