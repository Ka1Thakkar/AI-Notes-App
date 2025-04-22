// app/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import useIsMobile from "@/hooks/useIsMobile";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import { Trash } from "@phosphor-icons/react";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function DashboardPage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const router = useRouter();
  const isMobile = useIsMobile();

  // fetch all notes
  const { data: notes = [], isLoading, isError } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // delete mutation
  const deleteNote = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  // create-note state + mutation
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createNote = useMutation<string>({
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
      router.push(`/notes/${newId}`);
    },
  });
  if (isError) return <p className="p-4 text-red-500">Failed to load notes.</p>;

  // common submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNote.mutate();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Notes</h1>

        {/* New Note */}
        {isMobile ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-11/12">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <DialogHeader>
                  <DialogTitle>New Note</DialogTitle>
                  <DialogDescription>
                    Enter title & content.
                  </DialogDescription>
                </DialogHeader>
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
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Note
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-full w-full flex flex-col"
            >
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <SheetHeader>
                  <SheetTitle>New Note</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-auto space-y-4 px-4">
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
                </div>
                <SheetFooter className="flex justify-end px-4 py-2">
                  <Button type="submit" disabled={createNote.isPending}>
                    {createNote.isPending ? "Saving…" : "Save Note"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* notes grid */}
      <div className="overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="relative">
            <Link href={`/notes/${note.id}`} className="h-full">
              <Card className="cursor-pointer h-full flex flex-col justify-between p-5">
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
                        className="p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteNote.mutate(note.id);
                        }}
                        className="p-0"
                      >
                        <Button variant="destructive" className=" w-full border-0 shadow-none">
                        <Trash weight="duotone" className="text-white" />
                        Delete
                        </Button>
                      </DropdownMenuItem>
                      {/* add more items as needed */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-sm text-neutral-600 line-clamp-3 pt-2 font-light">
                  {note.content}
                </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}