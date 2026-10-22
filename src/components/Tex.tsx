import katex from "katex";
import "katex/contrib/mhchem";
import "katex/dist/katex.min.css";

/** Render inline $...$ math, escaping everything else. */
export function Tex({ text, className }: { text: string; className?: string }) {
  const html = text
    .split(/(\$[^$]+\$)/g)
    .map((piece) => {
      if (piece.startsWith("$") && piece.endsWith("$")) {
        return katex.renderToString(piece.slice(1, -1), { throwOnError: false, displayMode: false });
      }
      return piece.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    })
    .join("");
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Render a display block of LaTeX (with or without $ delimiters). */
export function MathBlock({ text }: { text: string }) {
  const body = text.trim().replace(/^\$+/, "").replace(/\$+$/, "");
  return (
    <div
      className="math-block"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(body, { throwOnError: false, displayMode: true }),
      }}
    />
  );
}
