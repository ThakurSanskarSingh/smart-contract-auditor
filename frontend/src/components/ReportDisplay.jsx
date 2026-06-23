import { useState } from "react";

/* ── Severity config ──────────────────────────────────────── */
const SEVERITY_CONFIG = {
  High: {
    badgeClass: "badge badge-high",
    verdictClass: "verdict-high",
    icon: "◉",
    glowColor: "rgba(239, 68, 68, 0.5)",
    label: "HIGH RISK",
    showPing: true,
    verdictIcon: "🔴",
  },
  Medium: {
    badgeClass: "badge badge-medium",
    verdictClass: "verdict-medium",
    icon: "◈",
    glowColor: "rgba(247, 147, 26, 0.5)",
    label: "MEDIUM RISK",
    showPing: false,
    verdictIcon: "🟡",
  },
  Low: {
    badgeClass: "badge badge-low",
    verdictClass: "verdict-low",
    icon: "⬡",
    glowColor: "rgba(255, 214, 0, 0.4)",
    label: "LOW RISK",
    showPing: false,
    verdictIcon: "🟢",
  },
};

/* ── FindingCard ─────────────────────────────────────────── */
function FindingCard({ finding, index }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.Low;
  const isGenuine = finding.isGenuineIssue;

  return (
    <div
      className={`finding-card ${isGenuine ? "genuine" : "false-positive"}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Corner accents (only on genuine issues) */}
      {isGenuine && (
        <>
          <span className="corner-tl" style={{ borderColor: sev.glowColor }} />
          <span className="corner-br" style={{ borderColor: sev.glowColor }} />
        </>
      )}

      {/* Card header */}
      <div className="finding-header">
        <div className="finding-title-row">
          {isGenuine && finding.severity === "High" && (
            <div className="badge-ping-dot" style={{ color: "var(--severity-high)" }} />
          )}
          <span className={sev.badgeClass}>
            {sev.icon} {finding.severity}
          </span>
          <h3 className="finding-title font-heading">{finding.title}</h3>
        </div>
        {!isGenuine && (
          <span className="badge badge-info">False Positive</span>
        )}
      </div>

      {/* Explanation */}
      <p className="finding-explanation">{finding.explanation}</p>

      {/* Recommendation (genuine only) */}
      {isGenuine && finding.recommendation && (
        <div className="finding-rec">
          <button
            className="rec-toggle font-mono"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            id={`finding-rec-toggle-${index}`}
          >
            <span className="rec-chevron">{expanded ? "▾" : "▸"}</span>
            Remediation
          </button>
          {expanded && (
            <p className="rec-body animate-fadeIn">{finding.recommendation}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main ReportDisplay ──────────────────────────────────── */
export default function ReportDisplay({ auditResult, onReset }) {
  const { report, fileName, totalChunksAnalyzed, potentialIssuesFound } = auditResult;
  const risk = report.overallRiskLevel;
  const riskConfig = SEVERITY_CONFIG[risk] || SEVERITY_CONFIG.Low;

  const genuineFindings = report.findings.filter((f) => f.isGenuineIssue);
  const falsePositives = report.findings.filter((f) => !f.isGenuineIssue);

  return (
    <div className="report-wrapper animate-fadeIn">

      {/* ── 1. Hero Verdict Banner ── */}
      <section
        className={`verdict-banner ${riskConfig.verdictClass}`}
        aria-label="Overall risk level"
      >
        {/* Background glow blob */}
        <div
          className="verdict-bg-glow"
          style={{ background: riskConfig.glowColor }}
        />

        {/* Orbital rings behind verdict */}
        <div className="verdict-orb-bg">
          <div className="verdict-ring verdict-ring-1" style={{ borderTopColor: riskConfig.glowColor }} />
          <div className="verdict-ring verdict-ring-2" style={{ borderBottomColor: riskConfig.glowColor }} />
          <div className="verdict-ring verdict-ring-3" style={{ borderLeftColor: riskConfig.glowColor }} />
        </div>

        <div className="verdict-content">
          <p className="verdict-scan-label font-mono">Security Scan Complete</p>

          <div className="verdict-main" aria-live="assertive">
            <span className="verdict-emoji">{riskConfig.verdictIcon}</span>
            <h1 className={`verdict-level font-heading ${risk === "High" ? "text-gradient-danger" : risk === "Medium" ? "text-gradient" : ""}`}>
              {riskConfig.label}
            </h1>
          </div>

          <p className="verdict-summary">{report.summary}</p>

          <div className="verdict-file font-mono">
            <span className="verdict-file-icon">◈</span>
            {fileName}
          </div>
        </div>
      </section>

      {/* ── 2. Stats Row ── */}
      <section className="stats-row animate-fadeInUp delay-2" aria-label="Scan statistics">
        <div className="stat-chip">
          <span className="stat-chip-value">{totalChunksAnalyzed}</span>
          <span className="stat-chip-label">Chunks Analyzed</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-value">{potentialIssuesFound}</span>
          <span className="stat-chip-label">Patterns Matched</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-value">{genuineFindings.length}</span>
          <span className="stat-chip-label">Vulnerabilities</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-value">{falsePositives.length}</span>
          <span className="stat-chip-label">False Positives</span>
        </div>
      </section>

      {/* ── 3. Findings ── */}
      {genuineFindings.length > 0 && (
        <section className="findings-section animate-fadeInUp delay-3" aria-label="Security findings">
          <div className="section-header">
            <h2 className="section-title font-heading">
              Vulnerabilities Found
            </h2>
            <span className="section-count font-mono">{genuineFindings.length}</span>
          </div>
          <div className="findings-list">
            {genuineFindings.map((finding, idx) => (
              <FindingCard key={idx} finding={finding} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* No genuine issues */}
      {genuineFindings.length === 0 && (
        <section className="clean-section animate-fadeInUp delay-3">
          <div className="clean-card glass-card">
            <span className="clean-icon">✓</span>
            <h2 className="clean-title font-heading">No Critical Vulnerabilities</h2>
            <p className="clean-sub text-muted">
              The AI audit found no genuine security issues in this contract.
            </p>
          </div>
        </section>
      )}

      {/* False positives (collapsed section) */}
      {falsePositives.length > 0 && (
        <section className="findings-section animate-fadeInUp delay-4" aria-label="False positives">
          <div className="section-header">
            <h2 className="section-title font-heading text-muted" style={{ fontSize: "16px" }}>
              False Positives
            </h2>
            <span className="section-count font-mono" style={{ opacity: 0.5 }}>{falsePositives.length}</span>
          </div>
          <div className="findings-list">
            {falsePositives.map((finding, idx) => (
              <FindingCard key={idx} finding={finding} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Disclaimer ── */}
      <div className="disclaimer animate-fadeInUp delay-5">
        <span className="disclaimer-icon">ℹ</span>
        <p className="disclaimer-text">
          This is an AI-assisted analysis for educational purposes, not a substitute for a professional security audit.
          Always verify findings manually and consult certified smart contract auditors before deploying to mainnet.
        </p>
      </div>

      {/* ── 5. Reset button ── */}
      <button
        id="audit-another-btn"
        className="btn btn-outline reset-btn animate-fadeInUp delay-5"
        onClick={onReset}
      >
        ⬡ &nbsp;Audit Another Contract
      </button>

      <style>{`
        .report-wrapper {
          display: flex;
          flex-direction: column;
          gap: 28px;
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
        }

        /* ── Verdict Banner ── */
        .verdict-banner {
          position: relative;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-subtle);
          padding: 52px 40px 44px;
          text-align: center;
          overflow: hidden;
          background: var(--bg-surface);
          animation: scaleIn 0.5s ease both;
        }
        .verdict-high { border-color: rgba(239, 68, 68, 0.3); }
        .verdict-medium { border-color: rgba(247, 147, 26, 0.3); }
        .verdict-low { border-color: rgba(255, 214, 0, 0.25); }

        .verdict-bg-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.1;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        /* Orbital rings behind verdict */
        .verdict-orb-bg {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .verdict-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid transparent;
        }
        .verdict-ring-1 {
          width: 260px;
          height: 260px;
          border-color: rgba(148,163,184,0.06);
          animation: spin-cw 12s linear infinite;
        }
        .verdict-ring-2 {
          width: 200px;
          height: 200px;
          border-color: rgba(148,163,184,0.05);
          animation: spin-ccw 18s linear infinite;
        }
        .verdict-ring-3 {
          width: 150px;
          height: 150px;
          border-color: rgba(148,163,184,0.04);
          animation: spin-cw 24s linear infinite;
        }

        .verdict-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .verdict-scan-label {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .verdict-main {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .verdict-emoji {
          font-size: 48px;
          filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));
          line-height: 1;
        }
        .verdict-level {
          font-size: clamp(36px, 8vw, 72px);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.03em;
        }
        /* Default (Low) color if not gradient */
        .verdict-low .verdict-level { color: var(--gold); }

        .verdict-summary {
          font-size: 15px;
          color: var(--text-muted);
          max-width: 500px;
          line-height: 1.65;
        }

        .verdict-file {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-dim);
          letter-spacing: 0.04em;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-subtle);
        }
        .verdict-file-icon {
          color: var(--orange);
          font-size: 14px;
        }

        /* ── Stats Row ── */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 600px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── Section header ── */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .section-count {
          font-size: 12px;
          letter-spacing: 0.08em;
          color: var(--orange);
          background: rgba(247,147,26,0.08);
          border: 1px solid rgba(247,147,26,0.2);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        /* ── Findings List ── */
        .findings-section {}
        .findings-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── Finding Card ── */
        .finding-card {
          position: relative;
          padding: 20px 22px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          transition: all 0.3s ease;
          animation: fadeInUp 0.4s ease both;
          overflow: hidden;
        }
        .finding-card.genuine:hover {
          transform: translateY(-2px);
          box-shadow: var(--glow-card);
          border-color: var(--border-default);
        }
        .finding-card.false-positive {
          opacity: 0.55;
          background: rgba(15,17,21,0.3);
        }

        /* Corner accent borders */
        .corner-tl,
        .corner-br {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: currentColor;
          opacity: 0.6;
          pointer-events: none;
        }
        .corner-tl {
          top: 8px;
          left: 8px;
          border-top: 1.5px solid;
          border-left: 1.5px solid;
          border-radius: 4px 0 0 0;
        }
        .corner-br {
          bottom: 8px;
          right: 8px;
          border-bottom: 1.5px solid;
          border-right: 1.5px solid;
          border-radius: 0 0 4px 0;
        }

        .finding-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .finding-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          flex: 1;
        }
        .finding-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        .finding-explanation {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.65;
        }

        /* Recommendation toggle */
        .finding-rec {
          margin-top: 14px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 12px;
        }
        .rec-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--orange);
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 4px 0;
          transition: opacity 0.2s;
        }
        .rec-toggle:hover { opacity: 0.75; }
        .rec-chevron { font-size: 10px; }
        .rec-body {
          margin-top: 10px;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.65;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          background: rgba(247,147,26,0.04);
          border: 1px solid rgba(247,147,26,0.1);
        }

        /* ── Clean (no issues) ── */
        .clean-section {}
        .clean-card {
          padding: 48px 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          border-color: rgba(255, 214, 0, 0.15);
        }
        .clean-icon {
          font-size: 36px;
          color: var(--gold);
          filter: drop-shadow(0 0 12px rgba(255,214,0,0.5));
        }
        .clean-title {
          font-size: 22px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .clean-sub {
          font-size: 14px;
          color: var(--text-muted);
        }

        /* ── Reset button ── */
        .reset-btn {
          align-self: center;
          min-width: 240px;
          font-size: 12px;
          letter-spacing: 0.06em;
        }
      `}</style>
    </div>
  );
}
