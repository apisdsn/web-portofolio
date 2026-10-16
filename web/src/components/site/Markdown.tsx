import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Renders case study Markdown. Raw HTML in the source is not rendered. */
export function Markdown({ source }: { source: string }) {
  return (
    <div
      className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-accent
        prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
        prose-pre:rounded-lg prose-pre:bg-ink prose-pre:text-codefg
        prose-table:block prose-table:overflow-x-auto prose-table:text-base"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  );
}
