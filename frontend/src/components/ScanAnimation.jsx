import { useState, useEffect } from "react";

const SCAN_STEPS = [
  { id: 1, label: "Parsing contract bytecode...", icon: "⬡", duration: 1200 },
  { id: 2, label: "Embedding code chunks...", icon: "◈", duration: 1400 },
  { id: 3, label: "Retrieving vulnerability patterns...", icon: "⬢", duration: 1600 },
  { id: 4, label: "Running AI security analysis...", icon: "◉", duration: null }, // holds until done
];

export default function ScanAnimation({ isActive }) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (!isActive) {
      setActiveStep(0);
      setCompletedSteps([]);
      return;
    }

    let cancelled = false;
    let stepIdx = 0;

    const runStep = () => {
      if (cancelled) return;
      if (stepIdx >= SCAN_STEPS.length) return;

      setActiveStep(stepIdx);

      const step = SCAN_STEPS[stepIdx];
      if (step.duration) {
        setTimeout(() => {
          if (cancelled) return;
          setCompletedSteps((prev) => [...prev, stepIdx]);
          stepIdx++;
          runStep();
        }, step.duration);
      }
      // Last step stays active until isActive becomes false
    };

    runStep();
    return () => { cancelled = true; };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="scan-animation" aria-live="polite" aria-label="Analysis in progress">
      {/* Orbital visual */}
      <div className="scan-orb-wrapper">
        <div className="scan-orb">
          <div className="scan-orb-core">
            <span className="scan-orb-hex">⬡</span>
          </div>
          <div className="scan-ring scan-ring-outer" />
          <div className="scan-ring scan-ring-inner" />
          {/* Scan sweep line */}
          <div className="scan-sweep" />
        </div>
      </div>

      {/* Step list */}
      <div className="scan-steps">
        <p className="scan-title font-mono">Analyzing Smart Contract</p>
        <div className="scan-step-list">
          {SCAN_STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(idx);
            const isActive_ = activeStep === idx && !isCompleted;
            const isPending = idx > activeStep;

            return (
              <div
                key={step.id}
                className={`scan-step ${isCompleted ? "completed" : ""} ${isActive_ ? "active" : ""} ${isPending ? "pending" : ""}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="scan-step-indicator">
                  {isCompleted ? (
                    <span className="scan-check">✓</span>
                  ) : isActive_ ? (
                    <span className="scan-spinner" />
                  ) : (
                    <span className="scan-dot" />
                  )}
                </div>
                <span className="scan-step-icon">{step.icon}</span>
                <span className="scan-step-label">{step.label}</span>
                {isCompleted && (
                  <span className="scan-done-tag">done</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .scan-animation {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
          padding: 48px 24px;
          animation: fadeIn 0.4s ease both;
        }

        /* Orbital Orb */
        .scan-orb-wrapper {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .scan-orb {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 4s ease-in-out infinite;
        }
        .scan-orb-core {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(247,147,26,0.25) 0%, rgba(3,3,4,0.8) 70%);
          border: 1px solid rgba(247, 147, 26, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          box-shadow: 0 0 30px rgba(247, 147, 26, 0.3), inset 0 0 20px rgba(247, 147, 26, 0.05);
        }
        .scan-orb-hex {
          font-size: 26px;
          color: var(--orange);
          filter: drop-shadow(0 0 8px rgba(247, 147, 26, 0.8));
        }
        .scan-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid transparent;
        }
        .scan-ring-outer {
          width: 120px;
          height: 120px;
          border-color: rgba(247, 147, 26, 0.2);
          border-top-color: rgba(247, 147, 26, 0.7);
          animation: spin-cw 3s linear infinite;
        }
        .scan-ring-inner {
          width: 88px;
          height: 88px;
          border-color: rgba(255, 214, 0, 0.12);
          border-bottom-color: rgba(255, 214, 0, 0.5);
          animation: spin-ccw 4s linear infinite;
        }
        .scan-sweep {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(247, 147, 26, 0.8), transparent);
          animation: scan-sweep 1.8s ease-in-out infinite;
          pointer-events: none;
        }

        /* Steps */
        .scan-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 360px;
        }
        .scan-title {
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 4px;
        }
        .scan-step-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .scan-step {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          transition: all 0.3s ease;
          animation: stepReveal 0.3s ease both;
        }
        .scan-step.pending {
          color: var(--text-dim);
          border-color: transparent;
          background: transparent;
        }
        .scan-step.active {
          color: var(--orange);
          border-color: rgba(247, 147, 26, 0.2);
          background: rgba(247, 147, 26, 0.04);
          box-shadow: 0 0 20px -8px rgba(247, 147, 26, 0.3);
        }
        .scan-step.completed {
          color: var(--text-muted);
          border-color: rgba(148, 163, 184, 0.08);
          background: rgba(148, 163, 184, 0.03);
        }

        /* Step indicator */
        .scan-step-indicator {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .scan-check {
          font-size: 12px;
          color: var(--orange);
          font-weight: 700;
        }
        .scan-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--border-default);
        }
        .scan-spinner {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(247, 147, 26, 0.2);
          border-top-color: var(--orange);
          display: block;
          animation: spin-cw 0.7s linear infinite;
        }
        .scan-step-icon {
          font-size: 14px;
          flex-shrink: 0;
          opacity: 0.6;
        }
        .scan-step-label {
          flex: 1;
          letter-spacing: 0.01em;
        }
        .scan-done-tag {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--orange);
          opacity: 0.6;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
