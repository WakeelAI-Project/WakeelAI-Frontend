import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "../../../../lib/utils";

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const ALLOWED_MARKDOWN_ELEMENTS = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
];

export function safeMarkdownUrl(value) {
  const url = String(value || "").trim();

  if (!url) return "";
  if (url.startsWith("#") || url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return SAFE_URL_PROTOCOLS.has(parsed.protocol) ? url : "";
  } catch {
    return "";
  }
}

const markdownComponents = {
  a({ node: _node, href, children, ...props }) {
    const safeHref = safeMarkdownUrl(href);

    if (!safeHref) {
      return <span>{children}</span>;
    }

    const isExternal = /^https?:\/\//i.test(safeHref);

    return (
      <a
        {...props}
        href={safeHref}
        className="font-semibold text-(--ai-primary) underline underline-offset-3 break-words"
        rel={isExternal ? "noopener noreferrer" : undefined}
        target={isExternal ? "_blank" : undefined}
      >
        {children}
      </a>
    );
  },
  blockquote({ node: _node, ...props }) {
    return (
      <blockquote
        {...props}
        className="border-s-2 border-(--ai-primary) ps-3 text-(--text-secondary)"
      />
    );
  },
  code({ node: _node, className, ...props }) {
    return (
      <code
        {...props}
        className={cn(
          "rounded-xs bg-(--bg-page-alt) px-1.5 py-0.5 font-mono text-[0.8125rem] break-words text-(--text-primary)",
          className,
        )}
      />
    );
  },
  h1({ node: _node, ...props }) {
    return <h3 {...props} className="text-base font-semibold leading-snug text-(--text-primary)" />;
  },
  h2({ node: _node, ...props }) {
    return <h3 {...props} className="text-base font-semibold leading-snug text-(--text-primary)" />;
  },
  h3({ node: _node, ...props }) {
    return <h4 {...props} className="text-sm font-semibold leading-snug text-(--text-primary)" />;
  },
  h4({ node: _node, ...props }) {
    return <h4 {...props} className="text-sm font-semibold leading-snug text-(--text-primary)" />;
  },
  h5({ node: _node, ...props }) {
    return <h5 {...props} className="text-sm font-semibold leading-snug text-(--text-primary)" />;
  },
  h6({ node: _node, ...props }) {
    return <h6 {...props} className="text-xs font-semibold uppercase leading-snug text-(--text-secondary)" />;
  },
  hr({ node: _node, ...props }) {
    return <hr {...props} className="border-(--border-default)" />;
  },
  li({ node: _node, ...props }) {
    return <li {...props} className="ps-1" />;
  },
  ol({ node: _node, ...props }) {
    return <ol {...props} className="list-decimal space-y-1 ps-5" />;
  },
  p({ node: _node, ...props }) {
    return <p {...props} className="whitespace-pre-wrap" />;
  },
  pre({ node: _node, ...props }) {
    return (
      <pre
        {...props}
        className="max-w-full overflow-x-auto rounded-md border border-(--border-default) bg-(--bg-card-subtle) p-3 text-start"
      />
    );
  },
  table({ node: _node, ...props }) {
    return (
      <div className="max-w-full overflow-x-auto rounded-md border border-(--border-default)">
        <table {...props} className="min-w-full border-collapse text-start text-xs" />
      </div>
    );
  },
  tbody({ node: _node, ...props }) {
    return <tbody {...props} className="divide-y divide-(--border-default)" />;
  },
  td({ node: _node, ...props }) {
    return <td {...props} className="min-w-32 border-s border-(--border-default) px-3 py-2 align-top first:border-s-0" />;
  },
  th({ node: _node, ...props }) {
    return <th {...props} className="min-w-32 border-s border-(--border-default) bg-(--bg-card-subtle) px-3 py-2 text-start font-semibold align-top first:border-s-0" />;
  },
  thead({ node: _node, ...props }) {
    return <thead {...props} className="border-b border-(--border-default)" />;
  },
  ul({ node: _node, ...props }) {
    return <ul {...props} className="list-disc space-y-1 ps-5" />;
  },
};

export function MarkdownRenderer({ text, className }) {
  const content = String(text || "").trim();

  if (!content) return null;

  return (
    <div className={cn("chat-markdown min-w-0 max-w-full space-y-3 text-sm leading-relaxed", className)}>
      <ReactMarkdown
        allowedElements={ALLOWED_MARKDOWN_ELEMENTS}
        rehypePlugins={[rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        skipHtml
        unwrapDisallowed
        urlTransform={safeMarkdownUrl}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
