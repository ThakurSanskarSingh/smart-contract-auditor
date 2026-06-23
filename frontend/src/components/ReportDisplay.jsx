function ReportDisplay({ auditResult }) {
  const { report, fileName, totalChunksAnalyzed } = auditResult;

  const severityColor = {
    High: "#d32f2f",
    Medium: "#f57c00",
    Low: "#fbc02d",
  };

  return (
    <div>
      <h2>Audit Report: {fileName}</h2>
      <p>
        Overall Risk: <strong style={{ color: severityColor[report.overallRiskLevel] }}>{report.overallRiskLevel}</strong>
      </p>
      <p>{report.summary}</p>
      <p style={{ fontSize: "0.85em", color: "#666" }}>
        Analyzed {totalChunksAnalyzed} code chunks
      </p>

      <h3>Findings</h3>
      {report.findings
        .filter((f) => f.isGenuineIssue)
        .map((finding, idx) => (
          <div
            key={idx}
            style={{
              border: `1px solid ${severityColor[finding.severity]}`,
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px",
            }}
          >
            <h4 style={{ color: severityColor[finding.severity] }}>
              {finding.title} — {finding.severity}
            </h4>
            <p>{finding.explanation}</p>
            <p>
              <strong>Fix:</strong> {finding.recommendation}
            </p>
          </div>
        ))}
    </div>
  );
}

export default ReportDisplay;
