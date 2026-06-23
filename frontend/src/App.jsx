import { useState } from "react";
import UploadContract from "./components/UploadContract";
import ReportDisplay from "./components/ReportDisplay";
import "./App.css";

export default function App() {
  const [auditResult, setAuditResult] = useState(null);

  const handleReset = () => setAuditResult(null);

  return (
    <div className="app-shell">

      {/* ── Fixed background: grid pattern + ambient glow blobs ── */}
      <div className="app-bg bg-grid-pattern" aria-hidden="true">
        {/* Orange blob — top right */}
        <div
          className="glow-blob glow-blob-orange"
          style={{ width: 500, height: 500, top: "-10%", right: "-10%" }}
        />
        {/* Gold blob — bottom left */}
        <div
          className="glow-blob glow-blob-gold"
          style={{ width: 400, height: 400, bottom: "-8%", left: "-8%" }}
        />
        {/* Orange blob — center */}
        <div
          className="glow-blob glow-blob-orange"
          style={{ width: 300, height: 300, top: "40%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.04 }}
        />
      </div>

      {/* ── App content ── */}
      <div className="app-content">

        {/* ── Header ── */}
        <header className="header" role="banner">
          <div className="header-logo" role="img" aria-label="0xAudit logo">
            <div className="logo-icon" aria-hidden="true">⬡</div>
            <span className="logo-text">
              <span>0x</span>Audit
            </span>
          </div>

          <div className="header-badge" aria-label="AI-powered, live">
            <span className="header-live-dot" aria-hidden="true" />
            AI-Powered · Web3 Security
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="main" role="main" id="main-content">

          {!auditResult ? (
            /* ── Upload / Idle state ── */
            <>
              <section className="hero-section">
                <div className="hero-tag" aria-label="Smart Contract Security Scanner">
                  <span className="hero-tag-dot" aria-hidden="true" />
                  Smart Contract Security Scanner
                </div>

                <h1 className="hero-title">
                  Audit Your{" "}
                  <span className="text-gradient">Solidity</span>
                  {" "}Contracts
                </h1>

                <p className="hero-subtitle">
                  Upload a <span className="font-mono text-orange">.sol</span> file and our AI engine will parse, embed, and
                  cross-reference your code against a curated vulnerability knowledge base — delivering a structured
                  security report in seconds.
                </p>
              </section>

              <UploadContract onAuditComplete={setAuditResult} />

              {/* Feature chips */}
              <div className="feature-chips animate-fadeInUp delay-3" role="list" aria-label="Features">
                {[
                  { icon: "◈", label: "Vector RAG" },
                  { icon: "⬢", label: "LLaMA 3.3 70B" },
                  { icon: "◉", label: "Pinecone" },
                  { icon: "⬡", label: "Gemini Embeddings" },
                ].map((f) => (
                  <div className="feature-chip font-mono" key={f.label} role="listitem">
                    <span className="feature-chip-icon" aria-hidden="true">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* ── Results state ── */
            <ReportDisplay auditResult={auditResult} onReset={handleReset} />
          )}

        </main>

        {/* ── Footer ── */}
        <footer className="footer" role="contentinfo">
          <p className="footer-text">
            0xAudit · AI-Assisted Smart Contract Security · Not a substitute for professional audit
          </p>
        </footer>
      </div>

      {/* ── Feature chip styles (scoped here to keep App.css clean) ── */}
      <style>{`
        .feature-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 32px;
        }
        .feature-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: var(--radius-full);
          font-size: 11px;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          background: rgba(15, 17, 21, 0.6);
          border: 1px solid var(--border-subtle);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .feature-chip:hover {
          border-color: rgba(247, 147, 26, 0.25);
          color: var(--orange);
          background: rgba(247, 147, 26, 0.04);
        }
        .feature-chip-icon {
          font-size: 13px;
          color: var(--orange);
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
