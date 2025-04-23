// app/notes/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowClockwise,
  CalendarDots,
  Clipboard,
  Lightning,
  NotePencil,
  CheckCircle,
  Trash,
} from "@phosphor-icons/react";
import { SyncLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import useIsMobile from "@/hooks/useIsMobile";

interface DateItem {
  label: string;
  date: string;
}

export default function NotePage() {
  const isMobile = useIsMobile();
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();
  const qc = useQueryClient();

  // 1) Fetch note + summary fields
  const { data: note, isLoading, isError } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("title, content, summary, dates, actions, tags, sentiment")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // 2) Local state (including summary fields)
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [dates, setDates] = useState<DateItem[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // 3) Initialize state from loaded note (including previously saved summary)
  useEffect(() => {
    if (!note) return;
    setTitle(note.title);
    setContent(note.content);
    if (note.summary) {
      setSummary(note.summary);
      setDates(note.dates ?? []);
      setActions(note.actions ?? []);
      setTags(note.tags ?? []);
      setSentiment(note.sentiment ?? null);
    }
  }, [note]);

  // 4) Save (update) mutation for title/content
  const updateNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["note", id] });
    },
  });

  // 5) Delete mutation
  const deleteNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      router.push("/main/dashboard");
    },
  });

  // 6) Summarize & persist mutation
  interface SummaryResponse {
    summary: string;
    dates: DateItem[];
    actions: string[];
    tags: string[];
    sentiment: string | null;
    error?: string;
  }

  interface SavedNote {
    summary: string;
    dates: DateItem[] | null;
    actions: string[] | null;
    tags: string[] | null;
    sentiment: string | null;
  }

  const summarizeAndSave = useMutation<SavedNote, Error, void, unknown>({
    mutationFn: async () => {
      // call AI summarization
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const payload = await res.json() as SummaryResponse;
      if (!res.ok || payload.error) {
        throw new Error((payload as any).error || "Summary failed");
      }
      // update DB with summary + structured data
      const { data, error } = await supabase
        .from("notes")
        .update({
          summary:   payload.summary,
          dates:     payload.dates,
          actions:   payload.actions,
          tags:      payload.tags,
          sentiment: payload.sentiment,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as SavedNote;
    },
    onSuccess: (saved) => {
        // reflect the saved summary immediately
        setSummary(saved.summary);
        setDates(saved.dates ?? []);
        setActions(saved.actions ?? []);
        setTags(saved.tags ?? []);
        setSentiment(saved.sentiment ?? null);
        qc.invalidateQueries({ queryKey: ["notes"] });
        qc.invalidateQueries({ queryKey: ["note", id] });
      },
    }
  );

  // 7) Copy summary to clipboard
  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) return <p className="p-4">Loading note…</p>;
  if (isError)   return <p className="p-4 text-red-500">Error loading note.</p>;

  return (
    <div className="p-6 h-screen w-full flex flex-col gap-5 overflow-auto">
      {/* Title editor */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note Title"
        className="!text-4xl font-semibold border-none shadow-none focus-visible:ring-0 w-full"
      />
      <div className="space-y-4 h-screen overflow-auto">
      {/* Summary panel */}
      <div className="space-y-4">
        {summary ? (
          <div className="max-w-xl rounded-lg">
            <div className="bg-neutral-50 p-4 rounded-lg space-y-4">
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              <Lightning weight="duotone" className="text-yellow-600" />
              AI Summary
            </h1>
            <p className="font-light">{summary}</p>

            {/* Timeline */}
            {dates.length > 0 && (
              <>
                <h4 className="flex items-center gap-2 font-semibold">
                  <CalendarDots size={20} /> Timeline
                </h4>
                <ul className="list-disc pl-5 font-light">
                  {dates.map((d, i) => (
                    <li key={i}>
                      {d.date}: {d.label}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Next Steps */}
            {actions.length > 0 && (
              <>
                <h4 className="flex items-center gap-2 font-semibold">
                  <NotePencil size={20} /> Next Steps
                </h4>
                <ul className="list-disc pl-5 font-light">
                  {actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <Badge key={i}>{t}</Badge>
                ))}
              </div>
            )}

            {/* Sentiment */}
            {sentiment && (
              <div>
                <h4 className="font-semibold">Priority</h4>
                <Badge
                  variant={sentiment === "urgent" ? "destructive" : "secondary"}
                >
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </Badge>
              </div>
            )}
            </div>

            {/* Regenerate & Copy */}
            <div className="pt-4 flex items-center gap-2">
              <Button
                onClick={() => summarizeAndSave.mutate()}
                disabled={summarizeAndSave.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-primary rounded-lg text-xs"
              >
                <ArrowClockwise
                  size={14}
                  weight="bold"
                  className="text-black"
                />
                {summarizeAndSave.isPending
                  ? "Generating…"
                  : "Generate Again"}
              </Button>

              <Button
                onClick={handleCopy}
                className="flex items-center gap-2 p-2 bg-primary rounded-lg text-xs"
              >
                {isCopied ? (
                  <CheckCircle
                    size={16}
                    weight="duotone"
                    className="text-black"
                  />
                ) : (
                  <Clipboard
                    size={16}
                    weight="duotone"
                    className="text-black"
                  />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => summarizeAndSave.mutate()}
            disabled={summarizeAndSave.isPending}
            className="flex items-center gap-2 bg-neutral-50 hover:bg-primary/50 text-black p-7"
          >
            <Lightning
              size={20}
              weight="duotone"
              className="text-yellow-600"
            />
            {summarizeAndSave.isPending
              ? "Generating AI Summary…"
              : "Generate AI Summary"}
            {summarizeAndSave.isPending && (
              <SyncLoader className="ml-2" size={5} />
            )}
          </Button>
        )}
      </div>

      {/* Content editor */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note here…"
        rows={6}
        className="border-none shadow-none focus-visible:ring-0 !w-full !text-lg !font-light"
      />
      </div>

      {/* Save / Delete */}
      <div className={cn("flex gap-2 lg:pb-0", isMobile && "pb-12")}>
        <Button
          onClick={() => updateNote.mutate()}
          disabled={updateNote.isPending}
        >
          {updateNote.isPending ? "Saving…" : "Save"}
        </Button>
        <Button variant="destructive" onClick={() => deleteNote.mutate()}>
          <Trash weight="duotone" size={20} />
          Delete
        </Button>
      </div>
    </div>
  );
}