// components/Navbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  // detect noteId if on /notes/[id]
  let noteId: string | null = null;
  if (pathname.startsWith("/notes/")) {
    const parts = pathname.split("/");
    if (parts[2]) noteId = parts[2];
  }

  // fetch title when viewing a single note
  const { data: note, isLoading } = useQuery({
    queryKey: ["noteTitle", noteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("title")
        .eq("id", noteId!)
        .single();
      return data;
    },
    enabled: !!noteId
  });

  const title = noteId
    ? isLoading
      ? "Loading…"
      : note?.title || "Untitled"
    : "Your Notes";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-3 shadow">
      <h1 className="text-lg font-semibold">{title}</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none">
            <Avatar>
              <AvatarImage src="/avatar.png" alt="Profile" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}