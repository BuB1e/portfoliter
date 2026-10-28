import type { ComponentProps } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";

// Structure every design shares (lists, spacing, code); designs add their own type and colour.
export const markdownBase =
  "min-w-0 break-words [&>*+*]:mt-4 [&_li+li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:pl-1 [&_pre]:overflow-x-auto [&_pre]:p-4 [&_code]:text-[0.92em] [&_strong]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_img]:max-w-full [&_blockquote]:border-l-4 [&_blockquote]:pl-4";

interface MarkdownProps {
  children: string;
  className?: string;
}

// Renders project content as React elements. Raw HTML in the markdown is dropped (skipHtml) and
// link/image URLs go through react-markdown's transform, which strips javascript: and other unsafe
// schemes. No HTML string is ever injected into the page.
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown skipHtml urlTransform={defaultUrlTransform} components={{ a: MarkdownLink }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

function MarkdownLink({ node: _node, href, children, ...rest }: ComponentProps<"a"> & { node?: unknown }) {
  const isExternal = href ? /^https?:\/\//i.test(href) : false;
  return (
    <a href={href} {...rest} {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}
