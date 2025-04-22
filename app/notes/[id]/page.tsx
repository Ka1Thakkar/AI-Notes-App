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
import { CalendarDots, Lightning, NotePencil } from "@phosphor-icons/react";
import {SyncLoader} from "react-spinners";

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
  const { data: note, isLoading, isError } = useQuery({
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
    enabled: !!id
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", "note", id] })
  });
  const deleteNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      router.push("/dashboard");
    }
  });

  // Summarize
  const handleSummarize = async () => {
    setSummarizing(true);
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

  if (isLoading) return <p className="p-4">Loading note…</p>;
  if (isError) return <p className="p-4 text-red-500">Error loading note.</p>;

  return (
    <div className="p-6 h-full flex gap-5 overflow-auto">
      {/* Edit Area */}
      <div className="w-2/3">
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="border-2 border-white shadow-none focus-visible:ring-0 focus-visible:border-neutral-50 text-xl font-semibold"
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here…"
          rows={6}
          className="text-lg border-2 border-white shadow-none focus-visible:ring-0 focus-visible:border-neutral-50"
        />
      </div>

      <div className="flex space-x-2 mt-4">
        <Button onClick={() => updateNote.mutate()} disabled={updateNote.isPending}>
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
      {/* Summary & Details (scrollable) */}
      <div className="space-y-6 w-1/3">
        {summary ? (
          <Card className="bg-neutral-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Lightning weight="duotone" />AI Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-light">{summary}</p>

              {dates.length > 0 && (
                <>
                  <h4 className="font-semibold flex gap-2 items-center"><CalendarDots weight="duotone" size={20} /> Timeline</h4>
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
                  <h4 className="font-semibold flex items-center gap-2"><NotePencil weight="duotone" size={20} /> Next Steps</h4>
                  <ul className="list-disc pl-5">
                    {actions.map((a, i) => (
                      <li className="font-light" key={i}>{a}</li>
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
                  <Badge variant={sentiment === "urgent" ? "destructive" : "secondary"}>
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Button variant={"ghost"} onClick={handleSummarize} className="bg-gray-50 text-black w-full p-7">
                <Lightning size={20} weight="duotone" />
                <p className="text-lg">
                {!summarizing ? "Generate AI Summary": "Generating AI Summary"}
                </p>
                {summarizing && <SyncLoader className="ml-2" size={5} />}
          </Button>
        )}
      </div>
    </div>
  );
}