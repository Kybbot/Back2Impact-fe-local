import { useEffect, useImperativeHandle, useRef, type ReactNode, type Ref } from "react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type ChainedCommands, type Editor } from "@tiptap/react";

import { useT } from "@/i18n/use-t";

import { withLineBreaks } from "@/utils/html";

const HEADING_LEVELS = [1, 2, 3] as const;

type Tool = {
    /** translation key under `richTextEditor.*` */
    name: `heading${(typeof HEADING_LEVELS)[number]}` | "bold" | "italic" | "bulletList" | "orderedList";
    icon: ReactNode;
    isActive: (editor: Editor) => boolean;
    command: (chain: ChainedCommands) => ChainedCommands;
};

/** everything the editor can produce, in the toolbar's groups */
const TOOLBAR: Tool[][] = [
    HEADING_LEVELS.map((level) => ({
        name: `heading${level}` as const,
        icon: `H${level}`,
        isActive: (editor) => editor.isActive("heading", { level }),
        command: (chain) => chain.toggleHeading({ level }),
    })),
    [
        {
            name: "bold",
            icon: <b>B</b>,
            isActive: (editor) => editor.isActive("bold"),
            command: (chain) => chain.toggleBold(),
        },
        {
            name: "italic",
            icon: <i>I</i>,
            isActive: (editor) => editor.isActive("italic"),
            command: (chain) => chain.toggleItalic(),
        },
    ],
    [
        {
            name: "bulletList",
            icon: (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        d="M3 6h.01M3 12h.01M3 18h.01M8 6h13M8 12h13M8 18h13"
                    />
                </svg>
            ),
            isActive: (editor) => editor.isActive("bulletList"),
            command: (chain) => chain.toggleBulletList(),
        },
        {
            name: "orderedList",
            icon: (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"
                    />
                </svg>
            ),
            isActive: (editor) => editor.isActive("orderedList"),
            command: (chain) => chain.toggleOrderedList(),
        },
    ],
];

export type Props = {
    id: string;
    label: string;
    /** HTML, or "" while there's no text */
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    /** focuses the text, so a form can */
    ref?: Ref<{ focus: () => void }>;
    error?: string;
    isRequired?: boolean;
    placeholder?: string;
    className?: string;
};

export const RichTextEditor = ({
    id,
    label,
    value,
    onChange,
    onBlur,
    ref,
    error,
    isRequired = false,
    placeholder,
    className,
}: Props) => {
    const { t } = useT("common");

    const hasError = !!error;
    const labelId = `${id}-label`;

    // the last value the editor and the field agreed on, so only one set from outside (a reset) is loaded
    const syncedValue = useRef(value);

    const editor = useEditor({
        // created after mount, so a server render and the first client one match
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [...HEADING_LEVELS] },
                // only what the toolbar offers, so neither a markdown shortcut nor a paste brings in anything else
                blockquote: false,
                code: false,
                codeBlock: false,
                horizontalRule: false,
                link: false,
                strike: false,
                underline: false,
                // it adds an empty paragraph after a closing list or heading on the first transaction, even a
                // click, so an untouched description would be changed; two Enters leave a list just as well
                trailingNode: false,
            }),
            Placeholder.configure({ placeholder: placeholder ?? "" }),
        ],
        // text written before the editor keeps its line breaks
        content: withLineBreaks(value),
        editorProps: {
            // tiptap adds the `textbox` role
            attributes: {
                id,
                "aria-multiline": "true",
                "aria-labelledby": labelId,
                "aria-invalid": hasError ? "true" : "false",
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.isEmpty ? "" : editor.getHTML();

            syncedValue.current = html;
            onChange(html);
        },
        onBlur: () => onBlur?.(),
    });

    useEffect(() => {
        if (!editor || value === syncedValue.current) return;

        syncedValue.current = value;
        editor.commands.setContent(withLineBreaks(value), { emitUpdate: false });
    }, [editor, value]);

    useImperativeHandle(ref, () => ({ focus: () => editor?.commands.focus() }), [editor]);

    const tools = useEditorState({
        editor,
        selector: ({ editor }) =>
            Object.fromEntries(
                TOOLBAR.flat().map((tool) => [
                    tool.name,
                    {
                        isActive: !!editor && tool.isActive(editor),
                        isDisabled: !editor || !tool.command(editor.can().chain()).run(),
                    },
                ]),
            ),
    });

    return (
        <div className={`customTextarea richTextEditor ${className ? className : ""}`}>
            {/* a contenteditable can't be a <label>'s control, so it's named by id and focused by hand */}
            <span id={labelId} className="customTextarea__label" onClick={() => editor?.commands.focus()}>
                {label} {isRequired ? <span className="customInput__asterisk">*</span> : null}
            </span>

            <div className={`richTextEditor__field ${hasError ? "richTextEditor__field--error" : ""}`}>
                <div
                    role="toolbar"
                    aria-controls={id}
                    className="richTextEditor__toolbar"
                    aria-label={t("richTextEditor.toolbar")}
                >
                    {TOOLBAR.map((group) => (
                        <div key={group[0].name} className="richTextEditor__group">
                            {group.map((tool) => {
                                const state = tools?.[tool.name];

                                return (
                                    <button
                                        key={tool.name}
                                        type="button"
                                        title={t(`richTextEditor.${tool.name}`)}
                                        aria-label={t(`richTextEditor.${tool.name}`)}
                                        aria-pressed={!!state?.isActive}
                                        disabled={!state || state.isDisabled}
                                        // keeps the selection the command applies to
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => editor && tool.command(editor.chain().focus()).run()}
                                        className="richTextEditor__tool"
                                    >
                                        {tool.icon}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <EditorContent editor={editor} className="richTextEditor__content" />
            </div>

            {hasError && (
                <p role="alert" className="customTextarea__error">
                    {error}
                </p>
            )}
        </div>
    );
};
