import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { cn } from "../../../../lib/utils";

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

// KaTeX (with `output: "html"`, see below) renders math as nested <span>s,
// occasionally with <svg>/<path>/<line> for stretchy delimiters — these tags
// aren't in rehype-sanitize's default (GFM-oriented) schema, so both the
// sanitize schema and react-markdown's own allowlist need to admit them.
const KATEX_TAG_NAMES = ["span", "svg", "path", "line"];

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
  ...KATEX_TAG_NAMES,
];

const katexSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), ...KATEX_TAG_NAMES],
  attributes: {
    ...defaultSchema.attributes,
    span: ["className", "style", "ariaHidden"],
    svg: ["xmlns", "width", "height", "viewBox", "preserveAspectRatio", "style", "className"],
    path: ["d"],
    line: ["x1", "x2", "y1", "y2"],
  },
};

// Unicode "asterisk" characters that LLMs sometimes emit instead of the
// standard ASCII '*' (U+002A).  We normalise them to '*' so that
// ReactMarkdown can turn ** ... ** into <strong> elements.
const UNICODE_ASTERISK_RE = /[∗＊﹡⁎٭]/g;

// Never touch fenced/inline code so real code samples containing
// backslashes or brackets aren't corrupted.
const CODE_SEGMENT_REGEX = /(```[\s\S]*?```|`[^`\n]*`)/g;

function normalizeMathDelimiters(text) {
  return text
    .split(CODE_SEGMENT_REGEX)
    .map((segment, index) => {
      if (index % 2 === 1) return segment; // code fence/span — leave untouched

      // 1. Normalise Unicode asterisk variants → ASCII '*' outside code blocks.
      let out = segment.replace(UNICODE_ASTERISK_RE, "*");

      // 2. Convert \[...\] block math.  Strip any **bold** markers *inside*
      //    the LaTeX expression so KaTeX doesn't choke on them, then render
      //    the bold text as a separate Markdown segment that follows the math block.
      out = out.replace(/\\\[([\s\S]+?)\\\]/g, (_match, expr) => {
        // Extract trailing "= **value unit**" / "= *value unit*" patterns that
        // the LLM incorrectly placed inside the math block.
        const boldTrail = [];
        let cleanExpr = expr.replace(
          /=\s*\*{1,2}([^*]+?)\*{1,2}/g,
          (_m, inner) => {
            boldTrail.push(`**${inner.trim()}**`);
            return "";
          }
        );
        const suffix = boldTrail.length ? ` ${boldTrail.join(" ")}` : "";
        return `\n\n$$${cleanExpr.trim()}$$\n\n${suffix}`;
      });

      // 3. Convert \(...\) inline math.  Same bold-extraction logic.
      out = out.replace(/\\\(([\s\S]+?)\\\)/g, (_match, expr) => {
        const boldTrail = [];
        let cleanExpr = expr.replace(
          /=\s*\*{1,2}([^*]+?)\*{1,2}/g,
          (_m, inner) => {
            boldTrail.push(`**${inner.trim()}**`);
            return "";
          }
        );
        const suffix = boldTrail.length ? ` ${boldTrail.join(" ")}` : "";
        return `$${cleanExpr.trim()}$${suffix}`;
      });

      return out;
    })
    .join("");
}


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
        dir="auto"
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
    return <h3 dir="auto" {...props} className="text-base font-semibold leading-snug text-(--text-primary)" />;
  },
  h2({ node: _node, ...props }) {
    return <h3 dir="auto" {...props} className="text-base font-semibold leading-snug text-(--text-primary)" />;
  },
  h3({ node: _node, ...props }) {
    return <h4 dir="auto" {...props} className="text-sm font-semibold leading-snug text-(--text-primary)" />;
  },
  h4({ node: _node, ...props }) {
    return <h4 dir="auto" {...props} className="text-sm font-semibold leading-snug text-(--text-primary)" />;
  },
  h5({ node: _node, ...props }) {
    return <h5 dir="auto" {...props} className="text-sm font-semibold leading-snug text-(--text-primary)" />;
  },
  h6({ node: _node, ...props }) {
    return <h6 dir="auto" {...props} className="text-xs font-semibold uppercase leading-snug text-(--text-secondary)" />;
  },
  hr({ node: _node, ...props }) {
    return <hr {...props} className="border-(--border-default)" />;
  },
  li({ node: _node, ...props }) {
    return <li {...props} className="ps-1" />;
  },
  ol({ node: _node, ...props }) {
    return <ol dir="auto" {...props} className="list-decimal space-y-1 ps-5" />;
  },
  p({ node: _node, ...props }) {
    return <p dir="auto" {...props} className="whitespace-pre-wrap" />;
  },
  pre({ node: _node, ...props }) {
    return (
      <pre
        dir="auto"
        {...props}
        className="max-w-full overflow-x-auto rounded-md border border-(--border-default) bg-(--bg-card-subtle) p-3 text-start"
      />
    );
  },
  table({ node: _node, ...props }) {
    return (
      <div dir="auto" className="max-w-full overflow-x-auto rounded-md border border-(--border-default)">
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
  const raw = String(text || "").trim();

  if (!raw) return null;

  const content = normalizeMathDelimiters(raw);

  return (
    <div className={cn("chat-markdown min-w-0 max-w-full space-y-3 text-sm leading-relaxed", className)}>
      <ReactMarkdown
        allowedElements={ALLOWED_MARKDOWN_ELEMENTS}
        rehypePlugins={[[rehypeKatex, { output: "html", throwOnError: false, strict: false }], [rehypeSanitize, katexSanitizeSchema]]}
        remarkPlugins={[remarkGfm, remarkMath]}
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
