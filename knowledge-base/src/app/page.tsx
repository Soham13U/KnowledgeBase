'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useEffect } from "react";
import { apiFetch } from "@/lib/apiFetch";




export default function Home() {
 useEffect(() => {
  console.log("Home mounted, calling apiFetch");
  apiFetch("/api/notes")
    .then((r) => r.json())
    .then(console.log);
}, []);


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <ModeToggle/>
      <Button variant="outline">Button</Button>
    </div>
  );
}
