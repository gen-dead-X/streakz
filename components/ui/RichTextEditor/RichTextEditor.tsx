'use client';
import './RichTextEditor.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { RichTextEditorProps } from './RichTextEditor.types';

function toolbarBtn(label: string, active: boolean, onClick: () => void, title?: string) {
  return (
    <button
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
      onChange(editor.getJSON());
    },
  });

  if (!editor) return null;

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
        {toolbarBtn('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold')}
        {toolbarBtn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic')}
        {toolbarBtn('U', editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Underline')}
        {toolbarBtn('S', editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'Strikethrough')}
        <div className="rte-toolbar-sep" />
        {toolbarBtn('H1', editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
        {toolbarBtn('H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {toolbarBtn('H3', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        <div className="rte-toolbar-sep" />
        {toolbarBtn('•—', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bullet list')}
        {toolbarBtn('1—', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Numbered list')}
        {toolbarBtn('❝', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Blockquote')}
        <div className="rte-toolbar-sep" />
        {toolbarBtn('`', editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), 'Inline code')}
        {toolbarBtn('🔗', editor.isActive('link'), setLink, 'Link')}
        {toolbarBtn('—', false, () => editor.chain().focus().setHorizontalRule().run(), 'Horizontal rule')}
      </div>
      <div className="rte-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
