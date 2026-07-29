import React from "react";

// Lightweight inline formatter: **bold**, *italic*
const parseBioInline = (text, keyPrefix) => {
  const parts = text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter((p) => p !== "");
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={`${keyPrefix}-b-${i}`}
          className="font-semibold text-white"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${keyPrefix}-i-${i}`}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>;
  });
};

// Formats a raw bio string into paragraphs with bold/italic markup and
// auto-linked URLs.
export const renderFormattedBio = (bio) => {
  if (!bio) return null;
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  return bio.split("\n").map((line, lineIdx) => {
    const segments = line.split(urlPattern);
    return (
      <p key={lineIdx} className={lineIdx > 0 ? "mt-3" : ""}>
        {segments.map((seg, segIdx) =>
          /^https?:\/\//.test(seg) ? (
            <a
              key={segIdx}
              href={seg}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-white/30 hover:decoration-white/70 transition-colors break-all"
            >
              {seg}
            </a>
          ) : (
            <React.Fragment key={segIdx}>
              {parseBioInline(seg, `${lineIdx}-${segIdx}`)}
            </React.Fragment>
          ),
        )}
      </p>
    );
  });
};