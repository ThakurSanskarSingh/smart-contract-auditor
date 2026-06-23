import { useState, useRef } from "react";
import axios from "axios";
import ScanAnimation from "./ScanAnimation";

export default function UploadContract({ onAuditComplete }) {
  const [file, setFile] = useState(null);
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  /* ── File selection ─────────────────────────────────────── */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".sol")) {
      setFile(dropped);
      setError("");
    } else {
      setError("Please drop a valid Solidity (.sol) file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  /* ── Audit trigger ──────────────────────────────────────── */
  const handleAudit = async () => {
    if (!file) { setError("Please select a .sol file first."); return; }

    setAuditing(true);
    setError("");

    const formData = new FormData();
    formData.append("contract", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/audit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onAuditComplete(response.data);
    } catch (err) {
      setError("Audit failed. Please check your connection and try again.");
      console.error(err);
    } finally {
      setAuditing(false);
    }
  };

  /* ── File size formatter ────────────────────────────────── */
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="upload-wrapper animate-fadeInUp">

      {/* Drop zone */}
      <div
        className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""} ${auditing ? "locked" : ""}`}
        onClick={() => !auditing && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Upload Solidity contract file"
        onKeyDown={(e) => e.key === "Enter" && !auditing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".sol"
          onChange={handleFileChange}
          className="file-input-hidden"
          id="contract-file-input"
          aria-label="Select .sol file"
        />

        {/* Scanning state takes over the dropzone */}
        {auditing ? (
          <ScanAnimation isActive={true} />
        ) : file ? (
          /* File selected state */
          <div className="file-selected">
            <div className="file-icon-wrapper">
              <span className="file-icon">◈</span>
            </div>
            <div className="file-info">
              <p className="file-name font-mono">{file.name}</p>
              <p className="file-meta font-mono">
                {formatSize(file.size)} &nbsp;·&nbsp; Solidity Contract
              </p>
            </div>
            <button
              className="file-remove"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              aria-label="Remove file"
              title="Remove file"
            >
              ✕
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="dropzone-empty">
            <div className="dropzone-icon-ring">
              <div className="dropzone-orbit-outer" />
              <div className="dropzone-orbit-inner" />
              <div className="dropzone-icon-core">
                <span className="dropzone-upload-icon">⬡</span>
              </div>
            </div>
            <p className="dropzone-title font-heading">
              Drop your contract here
            </p>
            <p className="dropzone-sub font-mono">
              or click to browse &nbsp;·&nbsp; .sol files only
            </p>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="error-card animate-fadeIn" role="alert">
          <span className="error-icon">⚠</span>
          <span className="error-msg font-mono">{error}</span>
        </div>
      )}

      {/* Audit button */}
      {!auditing && (
        <button
          id="audit-btn"
          className="btn btn-primary audit-btn"
          onClick={handleAudit}
          disabled={!file}
          aria-disabled={!file}
        >
          <span className="btn-icon">⬢</span>
          Run Security Audit
        </button>
      )}

      <style>{`
        .upload-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        /* ── Drop Zone ── */
        .dropzone {
          width: 100%;
          min-height: 280px;
          border-radius: var(--radius-xl);
          border: 1.5px dashed var(--border-default);
          background: rgba(15, 17, 21, 0.5);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .dropzone::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle at 50% 40%, rgba(247, 147, 26, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }
        .dropzone:hover:not(.locked),
        .dropzone.dragging {
          border-color: var(--orange);
          background: rgba(247, 147, 26, 0.04);
          box-shadow: 0 0 40px -10px rgba(247, 147, 26, 0.2), inset 0 0 40px -20px rgba(247, 147, 26, 0.05);
        }
        .dropzone.has-file {
          border-style: solid;
          border-color: rgba(247, 147, 26, 0.3);
          min-height: 100px;
          cursor: default;
        }
        .dropzone.locked {
          cursor: default;
          border-color: rgba(247, 147, 26, 0.2);
        }
        .dropzone:focus-visible {
          outline: 2px solid var(--orange);
          outline-offset: 4px;
        }

        /* ── Hidden input ── */
        .file-input-hidden {
          position: absolute;
          width: 0;
          height: 0;
          opacity: 0;
          pointer-events: none;
        }

        /* ── Empty state visual ── */
        .dropzone-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 20px;
          text-align: center;
        }
        .dropzone-icon-ring {
          position: relative;
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .dropzone-orbit-outer,
        .dropzone-orbit-inner {
          position: absolute;
          border-radius: 50%;
          border: 1px solid transparent;
        }
        .dropzone-orbit-outer {
          width: 90px;
          height: 90px;
          border-color: rgba(247, 147, 26, 0.15);
          border-top-color: rgba(247, 147, 26, 0.45);
          animation: spin-cw 6s linear infinite;
        }
        .dropzone-orbit-inner {
          width: 65px;
          height: 65px;
          border-color: rgba(255, 214, 0, 0.1);
          border-bottom-color: rgba(255, 214, 0, 0.35);
          animation: spin-ccw 8s linear infinite;
        }
        .dropzone-icon-core {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(247,147,26,0.15), rgba(3,3,4,0.6));
          border: 1px solid rgba(247,147,26,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          box-shadow: 0 0 20px rgba(247,147,26,0.2);
        }
        .dropzone-upload-icon {
          font-size: 20px;
          color: var(--orange);
          filter: drop-shadow(0 0 6px rgba(247,147,26,0.7));
        }
        .dropzone-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .dropzone-sub {
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        /* ── File selected state ── */
        .file-selected {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 24px;
          width: 100%;
        }
        .file-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: rgba(247, 147, 26, 0.1);
          border: 1px solid rgba(247, 147, 26, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 16px rgba(247,147,26,0.15);
        }
        .file-icon {
          font-size: 18px;
          color: var(--orange);
        }
        .file-info {
          flex: 1;
          min-width: 0;
          text-align: left;
        }
        .file-name {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .file-meta {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          margin-top: 3px;
        }
        .file-remove {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(148, 163, 184, 0.08);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          font-size: 11px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .file-remove:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        /* ── Error card ── */
        .error-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.25);
          width: 100%;
        }
        .error-icon {
          font-size: 14px;
          color: var(--severity-high);
          flex-shrink: 0;
        }
        .error-msg {
          font-size: 12px;
          color: var(--severity-high);
          letter-spacing: 0.02em;
        }

        /* ── Audit button ── */
        .audit-btn {
          width: 100%;
          max-width: 320px;
          font-size: 13px;
          letter-spacing: 0.08em;
        }
        .btn-icon {
          font-size: 16px;
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.6));
        }
      `}</style>
    </div>
  );
}
