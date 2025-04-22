// components/Sidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CaretLineLeft,
  CaretLineRight,
  HouseLine,
  Plus,
  Note,
  SignOut,
} from "@phosphor-icons/react";
import useIsMobile from "@/hooks/useIsMobile";
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
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface NoteListItem {
  id: string;
  title: string;
}

export default function Sidebar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const qc = useQueryClient();

  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // track userId, and subscribe to auth changes
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    // initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
    // subscribe
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // fetch notes once userId is known
  const { data: notes = [] } = useQuery<NoteListItem[]>({
    queryKey: ["sidebarNotes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notes")
        .select("id, title")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // create–and–navigate mutation
  const createNote = useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("notes")
        .insert([{ title, content, user_id: userId }])
        .select("id")
        .single();
      if (error) throw error;
      return data!.id;
    },
    onSuccess: (newId) => {
      qc.invalidateQueries({ queryKey: ["sidebarNotes", userId] });
      setTitle("");
      setContent("");
      setOpen(false);
      router.push(`/notes/${newId}`);
    },
  });

  // logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // back‐to‐dashboard
  const onBack = () => router.push("/dashboard");

  // current note highlight
  const currentId = pathname.startsWith("/notes/") ? pathname.split("/")[2] : null;

  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
  return null;
  }

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r transition-width ease-in-out duration-200 h-full",
        !isMobile && collapsed ? "w-16" : "",
        !isMobile && !collapsed ? "w-64" : "",
        isMobile ? "w-full" : ""
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between p-3 border-b", collapsed && "flex-col-reverse")}>
          <button onClick={onBack} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100">
            <HouseLine size={24} weight="duotone" />
            {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
          </button>
        <button className="p-1 rounded hover:bg-gray-100" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <CaretLineRight size={24} /> : <CaretLineLeft size={24} />}
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        <nav className="py-2">
          {notes.map((note) => {
            const active = note.id === currentId;
            return (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <div
                  className={cn(
                    "px-4 py-2 text-sm truncate flex items-center gap-2",
                    active ? "bg-blue-100 font-medium" : "hover:bg-gray-50"
                  )}
                >
                  <Note size={28} weight="duotone" />
                  {!collapsed && <p className="font-medium">{note.title || "Untitled"}</p>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: New Note & Logout */}
      <div className="px-4 py-2 border-t space-y-2">
        {/* New Note trigger */}
        {isMobile ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                <Plus className="mr-2 h-4 w-4" />
                {!collapsed && "New Note"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm w-11/12 flex flex-col">
              <DialogHeader>
                <DialogTitle>New Note</DialogTitle>
                <DialogDescription>Enter title & content, then save.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createNote.mutate();
                }}
                className="flex-1 overflow-auto space-y-4 mt-4 px-2"
              >
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <Textarea placeholder="Content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
              </form>
              <DialogFooter className="flex justify-end px-2 py-2">
                <Button type="submit" disabled={createNote.isPending}>
                  {createNote.isPending ? "Saving…" : "Save Note"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                <Plus size={20} />
                {!collapsed && <span className="ml-2">New Note</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-full w-full flex flex-col">
              <SheetHeader>
                <SheetTitle>New Note</SheetTitle>
                <SheetDescription>Enter title & content.</SheetDescription>
              </SheetHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createNote.mutate();
                }}
                className="overflow-auto space-y-4 px-4"
              >
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <Textarea placeholder="Content" rows={6} value={content} onChange={(e) => setContent(e.target.value)} required />
              </form>
              <SheetFooter className="flex justify-end px-4 py-2">
                <Button type="submit" disabled={createNote.isPending}>
                  {createNote.isPending ? "Saving…" : "Save Note"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}

        {/* Logout */}
        <Button variant="default" size="sm" onClick={handleLogout} className="w-full flex items-center justify-center">
          <SignOut size={20} />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}