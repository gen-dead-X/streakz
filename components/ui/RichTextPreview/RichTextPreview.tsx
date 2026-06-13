'use client';
import './RichTextPreview.css';
import { generateHTML } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import { RENDER_EXTENSIONS } from '@/components/ui/RichTextEditor';

interface RichTextPreviewProps {
  content: JSONContent | string | undefined | null;
  className?: string;
}

export function RichTextPreview({ content, className }: RichTextPreviewProps) {
  if (!content) return null;

  const cls = `rich-preview${className ? ` ${className}` : ''}`;

  if (typeof content === 'string') {
    return <p className={cls}>{content}</p>;
  }

  const html = generateHTML(content, RENDER_EXTENSIONS);
  return <div className={cls} dangerouslySetInnerHTML={{ __html: html }} />;
}
