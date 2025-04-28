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
  CheckFat,
  FloppyDisk,
  PushPin,
  PushPinSlash,
} from "@phosphor-icons/react";
import { BounceLoader, SyncLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import useIsMobile from "@/hooks/useIsMobile";
import { RichTextEditor } from "@/components/rich-text-editor";
import TurndownService from "turndown";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";
import mammoth from "mammoth";
import Markdown from 'react-markdown'

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
        .select("title, content, summary, dates, actions, tags, sentiment, pinned")
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
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);

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
    setPinned(note.pinned ?? false);
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

  async function handleAskQuestion() {
    setQaLoading(true);
    setQaError(null);
    setQaAnswer(null);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, question: qaQuestion }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setQaError(data.error || "Failed to get answer");
      } else {
        setQaAnswer(data.answer);
      }
    } catch (err: any) {
      setQaError(err.message || "Unknown error");
    } finally {
      setQaLoading(false);
    }
  }

  // Export handlers
  function handleExportPDF() {
    const doc = new jsPDF();
    doc.text(title, 10, 10);
    doc.text("\n", 10, 20);
    const pageWidth = doc.internal.pageSize.getWidth() - 20; // 10 margin on each side
    const lines = doc.splitTextToSize(content.replace(/<[^>]+>/g, ''), pageWidth);
    doc.text(lines, 10, 30);
    doc.save(`${title || "note"}.pdf`);
  }

  function handleExportMarkdown() {
    const turndownService = new TurndownService();
    const md = turndownService.turndown(content);
    const blob = new Blob([md], { type: "text/markdown" });
    saveAs(blob, `${title || "note"}.md`);
  }

  async function handleExportWord() {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: title, heading: "Heading1" }),
            new Paragraph({ text: content.replace(/<[^>]+>/g, '') }),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title || "note"}.docx`);
  }

  // Import handlers
  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith('.md')) {
      const text = await file.text();
      setContent(text); // You may want to convert markdown to HTML for the editor
    } else if (file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setContent(result.value);
    }
  }

  if (isLoading) return <div className="p-4 w-full h-full flex items-center justify-center"><BounceLoader color="#B2AC88" /></div>;
  if (isError)   return <p className="p-4 text-red-500">Error loading note.</p>;

  return (
    <div className="p-6 h-screen w-full flex flex-col gap-5 overflow-auto">
      {/* Title editor + Export/Import */}
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="!text-4xl font-semibold border-none shadow-none focus-visible:ring-0 w-full"
        />
        <Button
          variant={"default"}
          onClick={async () => {
            const { error } = await supabase
              .from("notes")
              .update({ pinned: !pinned })
              .eq("id", id);
            if (!error) setPinned(!pinned);
          }}
          size="icon"
          title={pinned ? "Unpin" : "Pin"}
          className={cn(pinned && "bg-secondary/75 hover:bg-secondary/50")}
        >
          {pinned ? <PushPin weight="duotone" /> : <PushPinSlash weight="duotone" />}
        </Button>
        {/* <div className="flex gap-1">
          <Button onClick={handleExportPDF} variant="outline" size="sm">PDF</Button>
          <Button onClick={handleExportMarkdown} variant="outline" size="sm">MD</Button>
          <Button onClick={handleExportWord} variant="outline" size="sm">Word</Button>
          <label className="inline-block cursor-pointer bg-primary/10 px-3 py-2 rounded text-xs font-medium">
            Import
            <input type="file" accept=".md,.docx" onChange={handleImportFile} className="hidden" />
          </label>
        </div> */}
      </div>
      <div className="space-y-4 h-screen overflow-auto relative">
      {/* Summary panel */}
      <div className={cn("flex gap-y-5 w-full gap-x-4 justify-between items-start", isMobile && "flex-col")}>
      <div className={cn("space-y-4 w-6/12 max-w-xl", isMobile && "w-full")}>
        {summary ? (
          <div className="rounded-lg">
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
                      {new Date(d.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: 'short',
                        year: 'numeric',
                      })}: {d.label}
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
              <div className="space-y-2">
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
                {/* {summarizeAndSave.isPending
                  ? "Generating…"
                  : "Generate Again"} */}
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

      {/* AI Q&A */}
      <div className={cn("w-6/12 max-w-xl bg-neutral-50 p-4 rounded-lg space-y-4 mb-4", isMobile && "w-full" )}>
        <h2 className="font-semibold text-lg mb-2">AI Q&A</h2>
        <div className="flex gap-2 items-center">
          <Input
            value={qaQuestion}
            onChange={e => setQaQuestion(e.target.value)}
            placeholder="Ask a question about this note..."
            className="flex-1 focus-visible:ring-0"
            onKeyDown={e => { if (e.key === 'Enter') handleAskQuestion(); }}
          />
          <Button onClick={handleAskQuestion} disabled={qaLoading || !qaQuestion.trim()}>
            {qaLoading ? "Asking..." : "Ask"}
          </Button>
        </div>
        {qaError && <div className="text-red-500 text-sm mt-2">{qaError}</div>}
        {qaAnswer && <div className="mt-2 text-sm bg-primary/25 p-2 rounded"><Markdown>{qaAnswer}</Markdown></div>}
      </div>
      </div>

      {/* Content editor */}
      <RichTextEditor
        content={content}
        onChange={setContent}
      />
      </div>

      {/* Save / Delete */}
      <div className={cn("flex gap-2 lg:pb-0", isMobile && "pb-12")}>
        <Button
          onClick={() => updateNote.mutate()}
          disabled={updateNote.isPending}
        >
          <FloppyDisk weight="duotone" />
          {/* <CheckFat weight="duotone" /> */}
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