import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib';

type MarkdownMessageProps = {
  content: string;
  variant?: 'default' | 'buyer';
};

const isExternalLink = (href?: string) => Boolean(href && /^(https?:)?\/\//i.test(href));

function preprocessMarkdown(content: string): string {
  if (!content) return '';

  // 1. Split inline list items (e.g., " 2. " -> "\n2. ")
  let processed = content.replace(/[ \t]+(\d+)\.\s+/g, '\n$1. ');

  // 2. Add blank line before the first list item of a list block, and before headings.
  const lines = processed.split('\n');
  const result: string[] = [];
  
  const isListItem = (line: string) => /^\s*(\d+\.|\*|-)\s/.test(line);
  const isHeading = (line: string) => /^\s*#{1,6}\s/.test(line);
  const isEmpty = (line: string) => line.trim() === '';

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const prev = result[result.length - 1];

    if (i > 0 && !isEmpty(current)) {
      const prevIsEmpty = prev !== undefined && prev.trim() === '';
      
      // If current line is a list item, and previous line is NOT empty and NOT a list item
      if (isListItem(current) && !prevIsEmpty && !isListItem(prev)) {
        result.push(''); // Add blank line
      }
      // If current line is a heading, and previous line is NOT empty
      else if (isHeading(current) && !prevIsEmpty) {
        result.push(''); // Add blank line
      }
    }
    result.push(current);
  }

  return result.join('\n');
}

export function MarkdownMessage({ content, variant = 'default' }: MarkdownMessageProps) {
  const processedContent = variant === 'buyer' ? preprocessMarkdown(content) : content;

  return (
    <div className={cn("text-sm leading-relaxed", variant === 'buyer' && "leading-[1.6]")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml={true}
        components={{
          a: ({ href, children, ...props }) => {
            const external = isExternalLink(href);
            return (
              <a
                href={href}
                className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:text-primary/80"
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer noopener' : undefined}
                {...props}
              >
                {children}
                {external && (
                  <span className="inline-flex items-center gap-1 text-xs no-underline">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Mở tab mới
                  </span>
                )}
              </a>
            );
          },
          h1: ({ children, ...props }) => (
            <h1 className="mt-3 text-base font-semibold text-foreground first:mt-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="mt-3 text-sm font-semibold text-foreground first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="mt-3 text-sm font-medium text-foreground first:mt-0" {...props}>
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p className={cn("mb-2 whitespace-pre-wrap text-foreground last:mb-0", variant === 'buyer' && "mb-3 leading-[1.6]")} {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className={cn("mb-2 list-disc space-y-1 pl-5 last:mb-0", variant === 'buyer' && "mb-3 space-y-2.5 pl-6")} {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className={cn("mb-2 list-decimal space-y-1 pl-5 last:mb-0", variant === 'buyer' && "mb-3 space-y-2.5 pl-6")} {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className={cn("whitespace-pre-wrap", variant === 'buyer' && "leading-[1.6]")} {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="mb-2 border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground last:mb-0"
              {...props}
            >
              {children}
            </blockquote>
          ),
          pre: ({ children, ...props }) => (
            <pre
              className="mb-2 overflow-x-auto rounded-md bg-muted/60 p-3 text-xs text-foreground last:mb-0"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={cn('font-mono text-xs', className)} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
