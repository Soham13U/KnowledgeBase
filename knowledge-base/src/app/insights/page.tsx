"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";


import { Button } from "@/components/ui/button";

type Insights = {
  rangeDays: 7 | 30;
  start: string;
  createdCount: number;
  updatedCount: number;
  topTags: Array<{ tagId: number; name: string; count: number }>;
};

export default function InsightsPage() {
  const [range, setRange] = useState<7 | 30>(7);
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/insights?range=${range}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? "Failed to load insights");
        setData(null);
        return;
      }

      setData(json);
    } catch {
      setError("Failed to load insights");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />

    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/notes">
          <Button variant="outline">Back</Button>
        </Link>

        <div className="flex gap-2">
          <Button
            variant={range === 7 ? "default" : "outline"}
            onClick={() => setRange(7)}
          >
            7 days
          </Button>
          <Button
            variant={range === 30 ? "default" : "outline"}
            onClick={() => setRange(30)}
          >
            30 days
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-lg font-semibold">Insights</div>
        <div className="text-sm text-muted-foreground">
          Range: last {range} days
        </div>

        {loading && (
          <div className="mt-4 text-sm text-muted-foreground">
            Loading…
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="mt-4 space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-muted p-3">
                <div className="text-sm text-muted-foreground">
                  Notes created
                </div>
                <div className="text-2xl font-semibold">
                  {data.createdCount}
                </div>
              </div>

              <div className="rounded-md border border-border bg-muted p-3">
                <div className="text-sm text-muted-foreground">
                  Notes updated
                </div>
                <div className="text-2xl font-semibold">
                  {data.updatedCount}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">
                Top tags
              </div>

              {data.topTags.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No tags yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {data.topTags.map((t) => (
                    <div
                      key={t.tagId}
                      className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"
                    >
                      <div className="font-medium">
                        {t.name}
                      </div>
                      <div className="text-muted-foreground">
                        {t.count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Since: {new Date(data.start).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

}
