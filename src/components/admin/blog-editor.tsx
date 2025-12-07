"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState, useEffect } from "react";
import {
    Bold,
    Italic,
    Heading2,
    Heading3,
    List,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    Type,
    Undo,
    Redo,
} from "lucide-react";

interface BlogEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export default function BlogEditor({ content, onChange }: BlogEditorProps) {
    const [mode, setMode] = useState<"rich" | "html">("rich");
    const [localContent, setLocalContent] = useState(content);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-purple-600 hover:text-purple-700 underline",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg max-w-full h-auto",
                },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3",
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setLocalContent(html);
            onChange(html);
        },
    });

    // Sync external content changes if needed (be careful with loops)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if the content is truly different to avoid cursor jumping
            // This is a simple check; for production might need more robust diffing
            // or just rely on initial content if we assume one-way data flow from editor -> parent
        }
    }, [content, editor]);

    const toggleMode = () => {
        if (mode === "rich") {
            // Switching to HTML: Local content is already updated via onUpdate
            setMode("html");
        } else {
            // Switching to Rich: Update editor with current local content
            if (editor) {
                editor.commands.setContent(localContent);
            }
            setMode("rich");
        }
    };

    const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setLocalContent(newContent);
        onChange(newContent);
    };

    const addLink = () => {
        if (!editor) return;
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const addImage = () => {
        if (!editor) return;
        const url = window.prompt("Image URL");

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {mode === "rich" ? (
                        <>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700 text-purple-600" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                title="Bold"
                            >
                                <Bold size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700 text-purple-600" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                title="Italic"
                            >
                                <Italic size={18} />
                            </button>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive("heading", { level: 2 })
                                    ? "bg-gray-200 dark:bg-gray-700 text-purple-600"
                                    : "text-gray-600 dark:text-gray-400"
                                    }`}
                                title="Heading 2"
                            >
                                <Heading2 size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive("heading", { level: 3 })
                                    ? "bg-gray-200 dark:bg-gray-700 text-purple-600"
                                    : "text-gray-600 dark:text-gray-400"
                                    }`}
                                title="Heading 3"
                            >
                                <Heading3 size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().setParagraph().run()}
                                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive("paragraph") ? "bg-gray-200 dark:bg-gray-700 text-purple-600" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                title="Paragraph"
                            >
                                <Type size={18} />
                            </button>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700 text-purple-600" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                title="Bullet List"
                            >
                                <List size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={addLink}
                                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700 text-purple-600" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                title="Link"
                            >
                                <LinkIcon size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={addImage}
                                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive("image") ? "bg-gray-200 dark:bg-gray-700 text-purple-600" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                title="Image"
                            >
                                <ImageIcon size={18} />
                            </button>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().undo().run()}
                                disabled={!editor.can().undo()}
                                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 disabled:opacity-50"
                                title="Undo"
                            >
                                <Undo size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().redo().run()}
                                disabled={!editor.can().redo()}
                                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 disabled:opacity-50"
                                title="Redo"
                            >
                                <Redo size={18} />
                            </button>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive("codeBlock") ? "bg-gray-200 dark:bg-gray-700 text-purple-600" : "text-gray-600 dark:text-gray-400"
                                    }`}
                                title="Code Block"
                            >
                                <Code size={18} />
                            </button>
                        </>
                    ) : (
                        <div className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            HTML Source Mode
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={toggleMode}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    <Code size={16} />
                    {mode === "rich" ? "Switch to HTML" : "Switch to Visual"}
                </button>
            </div>

            {/* Editor Area */}
            <div className="relative min-h-[400px]">
                {mode === "rich" ? (
                    <EditorContent editor={editor} />
                ) : (
                    <textarea
                        value={localContent}
                        onChange={handleHtmlChange}
                        className="w-full h-full min-h-[400px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-y focus:outline-none"
                        spellCheck={false}
                    />
                )}
            </div>

            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <span>
                    {mode === "rich"
                        ? "Pro tip: Select text to see formatting options"
                        : "You are editing raw HTML. Be careful with tags."}
                </span>
                <span>
                    {editor.storage.characterCount?.words?.() || 0} words
                </span>
            </div>
        </div>
    );
}
