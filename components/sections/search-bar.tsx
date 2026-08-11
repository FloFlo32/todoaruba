"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchBar({ size = "lg" }: { size?: "lg" | "sm" }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/things-to-do?q=${encodeURIComponent(q)}` : "/things-to-do");
  }

  if (size === "sm") {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-64 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 transition-colors focus-within:border-primary/40"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="h-auto flex-1 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("mx-auto flex max-w-xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-lg shadow-primary/5")}
    >
      <Search className="ml-2.5 size-5 shrink-0 text-muted-foreground" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search snorkeling, ATV tours, sunset cruises..."
        className="h-10 flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
      />
      <Button type="submit" size="lg" className="rounded-full">
        Search
      </Button>
    </form>
  );
}
