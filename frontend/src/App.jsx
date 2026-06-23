import { useState } from "react";
import UploadContract from "./components/UploadContract";
import ReportDisplay from "./components/ReportDisplay";

function App() {
  const [auditResult, setAuditResult] = useState(null);

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Smart Contract Auditor AI</h1>

      {!auditResult ? (
        <UploadContract onAuditComplete={setAuditResult} />
      ) : (
        <div>
          <ReportDisplay auditResult={auditResult} />
          <button onClick={() => setAuditResult(null)}>Audit another contract</button>
        </div>
      )}
    </div>
  );
}

export default App;
