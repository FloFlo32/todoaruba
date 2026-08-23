"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/sections/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const links = [{ href: "/discover", label: "Discover" }];

const tabGroups = [
  {
    base: "/things-to-do",
    label: "Things To Do",
    items: [
      { href: "/things-to-do", label: "Things To Do" },
      { href: "/things-to-do/boat-tours", label: "Boat Trips" },
      { href: "/things-to-do/snorkeling", label: "Snorkeling" },
      { href: "/things-to-do/diving", label: "Scuba Diving" },
      { href: "/things-to-do/adventure", label: "ATV & Off-Road" },
      { href: "/things-to-do/water-activities", label: "Water Sports" },
      { href: "/things-to-do/cultural-experiences", label: "Culture" },
      { href: "/things-to-do/nightlife", label: "Nightlife" },
    ],
  },
  {
    base: "/where-to-stay",
    label: "Where to Stay",
    items: [
      { href: "/where-to-stay", label: "Where to Stay" },
      { href: "/where-to-stay#palm-beach", label: "Palm Beach" },
      { href: "/where-to-stay#eagle-beach", label: "Eagle Beach" },
      { href: "/where-to-stay#malmok", label: "Malmok" },
      { href: "/where-to-stay#oranjestad", label: "Oranjestad" },
      { href: "/where-to-stay#de-palm", label: "De Palm" },
    ],
  },
];

const plainTabs = [{ href: "/transportation", label: "Transportation" }];

const tabs = [...tabGroups.flatMap((g) => g.items), ...plainTabs];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background transition-all duration-300",
        scrolled ? "border-b border-border/60 shadow-sm" : "border-b border-transparent"
      )}
    >
      <nav className="container-px mx-auto flex h-16 max-w-6xl items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Todo Aruba" className="h-13 w-auto" />
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar size="sm" />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/plan"
            className="hidden items-center rounded-full border-2 border-primary px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 md:inline-flex"
          >
            Plan My Trip
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-block"
            >
              {l.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      <div className="hidden border-t border-border/60 md:block">
        <div className="container-px mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto">
          {tabGroups.map((g) => {
            const active = pathname === g.base || pathname.startsWith(`${g.base}/`);
            return (
              <DropdownMenu key={g.base}>
                <DropdownMenuTrigger
                  className={cn(
                    "flex shrink-0 items-center gap-1 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium outline-none transition-colors",
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {g.label}
                  <ChevronDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {g.items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
          {plainTabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container-px mx-auto flex max-w-6xl flex-col gap-1 py-4">
            <div className="mb-2">
              <SearchBar size="sm" />
            </div>
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm hover:bg-accent",
                  pathname === t.href ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </Link>
            ))}
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/plan"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full border-2 border-primary px-4 py-2 text-sm font-semibold text-primary"
            >
              Plan My Trip
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
