"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import useIsMobile from "@/hooks/useIsMobile";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
      }),
      Link.configure({
        openOnClick: isMobile,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: "Write your note here…",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      setSelectedText(text);
      
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();
          
          setPopoverPosition({
            top: rect.bottom - editorRect.top + 10,
            left: rect.left - editorRect.left,
          });
        }
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setIsLinkPopoverOpen(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setIsLinkPopoverOpen(false);
  };

  const handleLinkClick = () => {
    if (editor.isActive('link')) {
      const link = editor.getAttributes('link');
      setLinkUrl(link.href);
    } else {
      setLinkUrl('');
    }
    setIsLinkPopoverOpen(true);
  };

  const openLink = () => {
    const href = editor?.getAttributes('link').href;
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className=" relative border border-primary/25" ref={editorRef}>
      {/* Top editing toolbar */}
      <div className="bg-primary z-10 sticky top-0 border-b border-primary/15 w-full shadow-sm p-2 flex items-center gap-1">
        <Button
          variant="default"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`hover:bg-secondary/50 bg-primary ${editor.isActive("bold") ? "bg-secondary/50" : ""}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`hover:bg-secondary/50 primary ${editor.isActive("italic") ? "bg-secondary/50" : ""}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="default"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`hover:bg-secondary/50 bg-priamry ${editor.isActive("bulletList") ? "bg-secondary/50" : ""}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`hover:bg-secondary/50 bg-primary ${editor.isActive("orderedList") ? "bg-secondary/50" : ""}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        {editor.isActive('link') ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="default"
                size="sm"
                ref={popoverTriggerRef}
                onClick={handleLinkClick}
                className="hover:bg-secondary/50 bg-primary"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 bg-background p-4 rounded-md shadow-md" 
              sideOffset={20} 
              align="start"
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Edit Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Edit or remove the current link
                  </p>
                </div>
                <div className="grid gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addLink();
                      }
                    }}
                    className="w-full p-2 text-base focus-visible:ring-0"
                  />
                  <div className="flex gap-2">
                    <Button onClick={addLink} className="flex-1">
                      Update Link
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={openLink}
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={removeLink}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="default"
                size="sm"
                ref={popoverTriggerRef}
                onClick={handleLinkClick}
                className="hover:bg-secondary/50 bg-primary"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 bg-background p-4 rounded-md shadow-md" 
              sideOffset={20} 
              align="start"
              alignOffset={-140}
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Add Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter the URL for your link
                  </p>
                </div>
                <div className="grid gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addLink();
                      }
                    }}
                    className="w-full p-2 text-base focus-visible:ring-0"
                  />
                  <Button onClick={addLink} className="w-full">
                    Add Link
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="default"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          className="hover:bg-secondary/50 bg-primary"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          className="hover:bg-secondary/50 bg-primary"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      {/* End top editing toolbar */}
      <EditorContent
        editor={editor}
        className="max-w-none p-4 min-h-[200px] focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:border-transparent"
      />
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={() => !isMobile}
          className="bg-background border rounded-lg shadow-lg p-2 flex items-center gap-1 w-fit"
        >
          <Button
            variant="default"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`hover:bg-primary/50 bg-background ${editor.isActive("bold") ? "bg-primary/50" : ""}`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`hover:bg-primary/50 bg-background ${editor.isActive("italic") ? "bg-primary/50" : ""}`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="default"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`hover:bg-primary/50 bg-background ${editor.isActive("bulletList") ? "bg-primary/50" : ""}`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`hover:bg-primary/50 bg-background ${editor.isActive("orderedList") ? "bg-primary/50" : ""}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          {editor.isActive('link') ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    ref={popoverTriggerRef}
                    onClick={handleLinkClick}
                    className="hover:bg-primary/50 bg-background"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 bg-background p-4 rounded-md shadow-md" 
                  sideOffset={20} 
                  align="start"
                >
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Edit Link</h4>
                      <p className="text-sm text-muted-foreground">
                        Edit or remove the current link
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Input
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addLink();
                          }
                        }}
                        className="w-full p-2 text-base focus-visible:ring-0"
                      />
                      <div className="flex gap-2">
                        <Button onClick={addLink} className="flex-1">
                          Update Link
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={openLink}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={removeLink}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="default"
                size="sm"
                onClick={openLink}
                title="Open in new tab"
                className="hover:bg-primary/50 bg-background"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={removeLink}
                className="hover:bg-primary/50 bg-background"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  ref={popoverTriggerRef}
                  onClick={handleLinkClick}
                  className="hover:bg-primary/50 bg-background"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-80 bg-background p-4 rounded-md shadow-md" 
                sideOffset={20} 
                align="start"
                alignOffset={-140}
              >
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Add Link</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter the URL for your link
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Input
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addLink();
                        }
                      }}
                      className="w-full p-2 text-base focus-visible:ring-0"
                    />
                    <Button onClick={addLink} className="w-full">
                      Add Link
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="default"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            className="hover:bg-primary/50 bg-background"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            className="hover:bg-primary/50 bg-background"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
    </div>
  );
} 