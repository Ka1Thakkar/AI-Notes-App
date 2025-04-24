// components/Sidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Feather,
  SidebarSimple,
  Note,
  Plus,
  SignOut,
} from "@phosphor-icons/react";
import { User as UserIcon } from "@phosphor-icons/react";
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
import { set } from "react-hook-form";

interface NoteListItem {
  id: string;
  title: string;
}

interface SidebarProps {
  sheetOpen?: boolean;
  setSheetOpen?: (open: boolean) => void;
}

export default function Sidebar({sheetOpen, setSheetOpen}: SidebarProps) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const qc = useQueryClient();

  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // user metadata
  const [userName, setUserName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const md = user.user_metadata as any;
      setUserName(
        md.name || md.first_name + " "
      );
      setEmail(md.email || "")
      setAvatarUrl(md.avatar_url || null);
    });
  }, [supabase, router]);

  // fetch your notes
  const { data: notes = [] } = useQuery<NoteListItem[]>({
    queryKey: ["sidebarNotes", userName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // create note
  const createNote = useMutation<string, Error, void>({
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
      qc.invalidateQueries({ queryKey: ["sidebarNotes", userName] });
      setTitle("");
      setContent("");
      setOpen(false);
      router.push(`/main/notes/${newId}`);
    },
  });

  // logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // highlight current
  const currentId = pathname.startsWith("/main/notes/")
    ? pathname.split("/")[3]
    : null;

  // hide on auth pages
  if (/^\/(login|signup)/.test(pathname)) return null;

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r h-full transition-[width] duration-200",
        !isMobile && collapsed ? "w-16" : "w-64",
        isMobile && "w-full"
      )}
    >
      {/* header */}
      <div className={cn("flex border-b px-3 py-2 justify-between items-center gap-1", collapsed ? "flex-col" : "flex-row")}>
        {/* <div className="flex justify-between items-center"> */}
          <button
            onClick={() => router.push("/main/dashboard")}
            className="flex items-center gap-2"
          >
            <Feather weight="duotone" size={24} className="text-primary" />
            {!collapsed && <span className="text-lg font-semibold">SageQuill</span>}
          </button>
          {!isMobile && (
            <button onClick={() => setCollapsed((c) => !c)} className="p-1">
              <SidebarSimple weight="duotone" size={24} />
            </button>
          )}
        {/* </div> */}
      </div>

      {/* notes list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {notes.map((note) => {
          const active = note.id === currentId;
          return (
            <Link key={note.id} href={`/main/notes/${note.id}`}>
              <button
                onClick={() => {setSheetOpen && (
                  setTimeout(() => setSheetOpen(false), 1500))
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 truncate w-full",
                  active
                    ? "bg-primary/10 font-medium"
                    : "hover:bg-primary/15"
                )}
              >
                <Note weight="duotone" size={!collapsed ? 20 :28} className="min-w-max" />
                <p className="truncate">
                {!collapsed && note.title}
                </p>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* footer */}
      <div className="border-t px-4 py-3 space-y-2">
        {/* new note */}
        {isMobile ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full flex items-center justify-center bg-primary/25 hover:bg-primary/50 border-1 border-primary/25">
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
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="focus-visible:ring-0" />
                <Textarea placeholder="Content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required className="focus-visible:ring-0 h-32" />
                  <DialogFooter className="flex justify-end px-2 py-2">
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
              <Button variant="default" size="sm" className="w-full flex items-center justify-center bg-primary/25 hover:bg-primary/50 border-1 border-primary/25">
                <Plus size={20} />
                {!collapsed && <span className="ml-2">New Note</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="max-h-full w-full flex flex-col">
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
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="focus-visible:ring-0" />
                <Textarea placeholder="Content" rows={6} value={content} onChange={(e) => setContent(e.target.value)} required className="h-32 focus-visible:ring-0" />
                  <SheetFooter className="flex justify-end px-4 py-2">
                <Button type="submit" disabled={createNote.isPending}>
                  {createNote.isPending ? "Saving…" : "Save Note"}
                </Button>
              </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
          <div className={cn("mt-2 flex items-center gap-2 rounded-lg", !collapsed && "p-2 border-1 border-primary/25 bg-primary/25", collapsed && avatarUrl && "rounded-full", collapsed && !avatarUrl && "rounded-full bg-primary/25 border-1 border-primary/25 p-1 justify-center")}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userName}
                width={32}
                height={32}
                className="rounded-full w-[32px]"
              />
            ) : (
              <UserIcon weight="duotone" size={collapsed ? 20 : 28} className="text-black min-w-max" />
            )}
            {!collapsed &&
            <div className="flex flex-col w-full truncate">
              <p className="font-medium truncate text-sm">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground font-light truncate">
                {email}
              </p>
            </div> }
          </div>
        {/* logout */}
        <Button
          variant="default"
          size="sm"
          className={cn("w-full flex items-center justify-center gap-2 border-1 border-black/25", collapsed && "aspect-square")}
          onClick={handleLogout}
        >
          <SignOut weight="duotone" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
}