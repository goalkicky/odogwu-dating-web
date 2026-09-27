import type { Metadata } from "next";
import { Fira_Sans, Mulish, Cabin, Source_Sans_3 } from "next/font/google";

const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--fp-fira",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--fp-mulish",
});

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--fp-cabin",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--fp-source",
});

export const metadata: Metadata = {
  title: "Font Preview",
};

const CANDIDATES = [
  { label: "Current (Trebuchet MS / system)", stack: '"Trebuchet MS", sans-serif' },
  { label: "Fira Sans", stack: "var(--fp-fira)" },
  { label: "Mulish", stack: "var(--fp-mulish)" },
  { label: "Cabin", stack: "var(--fp-cabin)" },
  { label: "Source Sans 3", stack: "var(--fp-source)" },
];

export default function FontPreviewPage() {
  return (
    <div
      className={`${fira.variable} ${mulish.variable} ${cabin.variable} ${sourceSans.variable}`}
      style={{ minHeight: "100svh", background: "#f5f5f7", padding: "24px 16px 60px" }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 800, color: "#151515", margin: "0 0 4px" }}>
        Font preview
      </h1>
      <p style={{ fontSize: 13, color: "#6d6d75", margin: "0 0 24px" }}>
        Open this page on the phone. Tap the font you want for the discover profile card.
      </p>

      {CANDIDATES.map((c) => (
        <section
          key={c.label}
          style={{
            background: "#fff",
            border: "1px solid #e4e4e6",
            borderRadius: 20,
            padding: "20px 18px",
            marginBottom: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            fontFamily: c.stack,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#8a8a8a",
              marginBottom: 10,
            }}
          >
            {c.label}
          </div>

          <h2
            style={{
              fontSize: 32,
              letterSpacing: "-0.8px",
              margin: 0,
              color: "#101217",
              lineHeight: 1.15,
              fontWeight: 700,
            }}
          >
            Amaka, 26
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#666", fontSize: 13, margin: "5px 0 0" }}>
            Lagos, Nigeria
          </div>

          <p style={{ fontSize: 11, lineHeight: 1.45, margin: "12px 0 0", color: "#101217", fontWeight: 600 }}>
            Love live music, suya and Sunday runs by the lagoon. Swipe right if you want the
            whole story.
          </p>

          <p style={{ fontSize: 15, lineHeight: 1.5, margin: "14px 0 0", color: "#3a3a3f" }}>
            The quick brown fox jumps over the lazy dog. Handgloves 0123456789 &amp; ABCDEFGHIJKLM.
          </p>
        </section>
      ))}
    </div>
  );
}
