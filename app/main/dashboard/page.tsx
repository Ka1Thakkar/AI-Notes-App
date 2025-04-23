// app/main/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import useIsMobile from "@/hooks/useIsMobile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MagnifyingGlass, Trash } from "@phosphor-icons/react";
import { MoreHorizontal, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const qc = useQueryClient();
  const isMobile = useIsMobile();

  // Dynamic greeting logic
  const [greetingTitle, setGreetingTitle] = useState<string>("");
  const [greetingSubtitle, setGreetingSubtitle] = useState<string>("");
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const md = user.user_metadata as Record<string, any>;
      const firstName =
        md.first_name ||
        md.name?.split(" ")[0] ||
        user.email?.split("@")[0] ||
        "there";
      if (!md.firstLoginShown) {
        setGreetingTitle(`Welcome, ${firstName}!`);
        setGreetingSubtitle("Your journey with SageQuill starts now.");
        await supabase.auth.updateUser({
          data: { ...md, firstLoginShown: true },
        });
      } else {
        setGreetingTitle(`Welcome back, ${firstName}!`);
        setGreetingSubtitle("Let's quill some clarity.");
      }
    })();
  }, [supabase, router]);

  // Delete-note mutation
  const deleteNote = useMutation<void, Error, string>({
    mutationFn: async (noteId) => {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  // New-note state + mutation
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createNote = useMutation<string, unknown, void>({
    mutationFn: async () => {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !user) throw authErr || new Error("Not authenticated");
      const { data, error } = await supabase
        .from("notes")
        .insert([{ title, content, user_id: user.id }])
        .select("id")
        .single();
      if (error) throw error;
      return data!.id;
    },
    onSuccess: (newId) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      setTitle("");
      setContent("");
      setOpen(false);
      router.push(`/main/notes/${newId}`);
    },
  });

  // Search + notes query
  const [search, setSearch] = useState("");
  const {
    data: notes = [],
    isError,
  } = useQuery<Note[]>({
    queryKey: ["notes", search],
    queryFn: async () => {
      let qb = supabase
        .from("notes")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false });
      if (search.trim()) {
        qb = qb.or(
          `title.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%`
        );
      }
      const { data, error } = await qb;
      if (error) throw error;
      return data;
    },
    placeholderData: (prev) => prev,
  });

  if (isError) return <p className="p-4 text-red-500">Failed to load notes.</p>;

  return (
    <div className="flex flex-col h-screen overflow-auto p-6 text-[var(--foreground)]">
      {/* Greeting */}
      {(greetingTitle || greetingSubtitle) && (
        <div className="mb-6 space-y-2">
          <h1 className="lg:text-5xl text-4xl font-semibold">
            {greetingTitle}
          </h1>
          <p className="lg:text-3xl text-2xl font-light">
            {greetingSubtitle}
          </p>
        </div>
      )}

      {/* Search + New Note */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-[var(--background)] rounded-full px-3">
            <MagnifyingGlass
              size={20}
              weight="bold"
              className="text-[var(--accent)]"
            />
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-0 w-full"
            />
          </div>
        </div>

        {isMobile ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-11/12">
              <DialogHeader>
                <DialogTitle>New Note</DialogTitle>
                <DialogDescription>
                  Enter title & content, then save.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createNote.mutate();
                }}
                className="space-y-4 mt-4"
              >
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="focus-visible:ring-0"
                />
                <Textarea
                  placeholder="Content"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="h-32 focus-visible:ring-0"
                />
                <DialogFooter className="flex justify-end">
                  <Button type="submit" disabled={createNote.isPending}>
                    {createNote.isPending ? "Saving…" : "Save Note"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Note
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="h-full w-11/12 md:w-1/3 flex flex-col"
            >
              <SheetHeader>
                <SheetTitle>New Note</SheetTitle>
                <SheetDescription>Enter title & content.</SheetDescription>
              </SheetHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createNote.mutate();
                }}
                className="flex flex-col flex-1 overflow-auto space-y-4 mt-4 px-4"
              >
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="focus-visible:ring-0"
                />
                <Textarea
                  placeholder="Content"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="h-32 focus-visible:ring-0"
                />
                <SheetFooter className="flex justify-end">
                  <Button type="submit" disabled={createNote.isPending}>
                    {createNote.isPending ? "Saving…" : "Save Note"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="relative">
            <Link href={`/main/notes/${note.id}`} className="h-full">
              <Card className="cursor-pointer h-full p-5 bg-[var(--card)] text-[var(--card-foreground)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <div className="truncate text-lg font-semibold">
                      {note.title || "Untitled"}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 hover:bg-[var(--primary)]/5 hover:text-[var(--foreground)]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white hover:bg-accent transition-all p-0">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteNote.mutate(note.id);
                          }}
                          className="bg-white hover:bg-accent transition-all p-2"
                        >
                          <Trash className="hover:text-white" weight="duotone" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 pt-2">
                    {note.content}
                  </p>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}