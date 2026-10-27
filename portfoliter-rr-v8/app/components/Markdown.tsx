import type { ComponentProps } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";

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
