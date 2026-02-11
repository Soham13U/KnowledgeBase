"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

export type Tag = { id: number; name: string };

type Props = {
  tags: Tag[];
  value: number[]; // selected tagIds
  onChange: (next: number[]) => void;
  placeholder?: string;
};

export function TagMultiSelect({
  tags,
  value,
  onChange,
  placeholder = "Select tags…",
}: Props) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => {
    const set = new Set(value);
    return tags.filter((t) => set.has(t.id));
  }, [tags, value]);

  function toggle(id: number) {
    const set = new Set(value);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange(Array.from(set));
  }

  function remove(id: number) {
    onChange(value.filter((x) => x !== id));
  }

 return (
  <div className="w-full">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex flex-1 flex-wrap items-center gap-2 overflow-hidden">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">
                {placeholder}
              </span>
            ) : (
              selected.map((t) => (
                <Badge
                  key={t.id}
                  variant="secondary"
                  className="gap-1"
                >
                  {t.name}
                  <button
                    type="button"
                    className="ml-1 rounded-sm hover:opacity-70"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(t.id);
                    }}
                    aria-label={`Remove ${t.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 bg-popover border-border"
      >
        <Command>
          <CommandInput placeholder="Search tags…" />

          <CommandEmpty className="text-muted-foreground">
            No tags found.
          </CommandEmpty>

          <CommandGroup>
            {tags.map((t) => {
              const isSelected = value.includes(t.id);

              return (
                <CommandItem
                  key={t.id}
                  value={t.name}
                  onSelect={() => toggle(t.id)}
                  className="hover:bg-muted"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected
                        ? "opacity-100 text-primary"
                        : "opacity-0"
                    )}
                  />
                  {t.name}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
);

}
