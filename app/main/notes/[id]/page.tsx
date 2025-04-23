// app/notes/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowClockwise,
  CalendarDots,
  Clipboard,
  Lightning,
  NotePencil,
  CheckCircle,
} from "@phosphor-icons/react";
import { SyncLoader } from "react-spinners";

interface DateItem {
  label: string;
  date: string;
}

export default function NotePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();
  const qc = useQueryClient();

  // Fetch note
  const {
    data: note,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("title, content")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Local state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [dates, setDates] = useState<DateItem[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  // Save/Delete mutations
  const updateNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", "note", id] }),
  });
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

  // Summarize
  const handleSummarize = async () => {
    setSummarizing(true);
    setSummary(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const payload = await res.json();
      if (!res.ok || payload.error) throw new Error(payload.error || "Error");

      const {
        summary: summed,
        dates: foundDates = [],
        actions: foundActions = [],
        tags: foundTags = [],
        sentiment: foundSentiment = null,
      } = payload;

      setSummary(summed);
      setDates(foundDates);
      setActions(foundActions);
      setTags(foundTags);
      setSentiment(foundSentiment);
    } catch (e) {
      console.error(e);
      setSummary("Failed to generate summary.");
      setDates([]);
      setActions([]);
      setTags([]);
      setSentiment(null);
    } finally {
      setSummarizing(false);
    }
  };

  const [isCopied, setIsCopied] = useState(false);

  // ...existing code...

  const handleCopy = () => {
    navigator.clipboard.writeText(summary || "");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000); // Show check mark for 2 seconds
  };

  if (isLoading) return <p className="p-4">Loading note…</p>;
  if (isError) return <p className="p-4 text-red-500">Error loading note.</p>;

  return (
    <div className="p-6 h-screen flex flex-col gap-5 overflow-auto">
      {/* Edit Area */}
      <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="border-none shadow-none focus-visible:ring-0 focus-visible:border-none text-3xl font-semibold w-full px-2"
          />
      <div className="h-full overflow-auto relative">
        <div className="space-y-4">
          {/* <div className="">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="border-none shadow-none focus-visible:ring-0 focus-visible:border-none text-3xl font-semibold w-full px-2"
          />
          </div> */}
          <div className="">
            {summary ? (
              <div className="max-w-xl">
                <div className="bg-neutral-50 p-4 rounded-lg space-y-4">
                  <h1 className="flex items-center gap-2">
                    <Lightning weight="duotone" className="text-yellow-600" />
                    AI Summary
                  </h1>
                  <p className="font-light">{summary}</p>
                  {dates.length > 0 && (
                    <>
                      <h4 className="font-semibold flex gap-2 items-center pt-2">
                        <CalendarDots weight="duotone" size={20} /> Timeline
                      </h4>
                      <ul className="list-disc pl-5">
                        {dates.map((d, i) => (
                          <li className="font-light" key={i}>
                            {d.date}: {d.label}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {actions.length > 0 && (
                    <>
                      <h4 className="font-semibold flex items-center gap-2">
                        <NotePencil weight="duotone" size={20} /> Next Steps
                      </h4>
                      <ul className="list-disc pl-5">
                        {actions.map((a, i) => (
                          <li className="font-light" key={i}>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t, i) => (
                        <Badge key={i}>{t}</Badge>
                      ))}
                    </div>
                  )}

                  {sentiment && (
                    <div>
                      <h4 className="font-semibold">Priority</h4>
                      <Badge
                        variant={
                          sentiment === "urgent" ? "destructive" : "secondary"
                        }
                      >
                        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="pt-4 flex gap-0 items-center">
                  <button
                    onClick={handleSummarize}
                    className=" flex gap-2 items-center px-5 py-2 bg-primary rounded-lg text-xs"
                  >
                    <ArrowClockwise
                      size={14}
                      weight="bold"
                      className="text-black"
                    />
                    Generate Again
                  </button>
                  <button
                    className="ml-2 flex gap-2 items-center p-2 bg-primary rounded-lg text-xs"
                    onClick={handleCopy}
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
                  </button>
                </div>
              </div>
            ) : (
              <Button
                variant={"default"}
                onClick={handleSummarize}
                className="bg-neutral-50 hover:bg-primary/50 text-black p-7"
              >
                <Lightning
                  size={20}
                  weight="duotone"
                  className="text-yellow-600"
                />
                <p className="">
                  {!summarizing
                    ? "Generate AI Summary"
                    : "Generating AI Summary"}
                </p>
                {summarizing && <SyncLoader className="ml-2" size={5} />}
              </Button>
            )}
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here…"
            rows={6}
            className="border-none shadow-none focus-visible:ring-0 focus-visible:border-none !w-full !text-lg !font-light"
          />
        </div>
      </div>
      {/* Summary & Details (scrollable) */}
      <div className="flex gap-2 pb-12 lg:pb-0">
          <Button
            onClick={() => updateNote.mutate()}
            disabled={updateNote.isPending}
          >
            {updateNote.isPending ? "Saving…" : "Save"}
          </Button>
          <Button variant="destructive" onClick={() => deleteNote.mutate()}>
            Delete
          </Button>
          {/* <Button variant="secondary" onClick={handleSummarize} disabled={summarizing}>
          {summarizing ? "Summarizing…" : "Summarize"}
        </Button> */}
        </div>
    </div>
  );
}

