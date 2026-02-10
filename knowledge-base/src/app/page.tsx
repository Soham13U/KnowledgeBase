"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Knowledge Base
          </h1>
          <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Create notes, tag them, and link them. Backlinks help you build
            a Zettelkasten-lite system.
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <Link href="/notes">
            <Button>Open Notes</Button>
          </Link>
          <Link href="/insights">
            <Button variant="outline">View Insights</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
