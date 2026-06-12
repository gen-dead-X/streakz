'use client';
import './RichTextEditor.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { JSONContent } from '@tiptap/core';
import type { RichTextEditorProps } from './RichTextEditor.types';

export function RichTextEditor({ value, onChange, placeholder = 'Write a description…' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getJSON() as JSONContent);
    },
  });

  if (!editor) return null;

  function btn(label: string, active: boolean, onClick: () => void, title?: string) {
    return (
      <button
        key={label}
        type="button"
        className={`rte-toolbar-btn${active ? ' is-active' : ''}`}
        onClick={onClick}
        title={title ?? label}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  }

  function setLink() {
    const prev = editor!.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="rte-wrapper">
      <div className="rte-toolbar">
        {btn('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold')}
        {btn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic')}
        {btn('U', editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Underline')}
        {btn('S', editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'Strikethrough')}
        <div className="rte-toolbar-sep" />
        {btn('H1', editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
        {btn('H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn('H3', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        <div className="rte-toolbar-sep" />
        {btn('•—', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bullet list')}
        {btn('1—', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Numbered list')}
        {btn('❝', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Blockquote')}
        <div className="rte-toolbar-sep" />
        {btn('`', editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), 'Inline code')}
        {btn('🔗', editor.isActive('link'), setLink, 'Link')}
        {btn('—', false, () => editor.chain().focus().setHorizontalRule().run(), 'Horizontal rule')}
      </div>
      <div className="rte-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
