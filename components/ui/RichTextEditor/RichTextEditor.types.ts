import type { JSONContent } from '@tiptap/core';

export interface RichTextEditorProps {
  value?: JSONContent;
  onChange: (v: JSONContent) => void;
  placeholder?: string;
}
