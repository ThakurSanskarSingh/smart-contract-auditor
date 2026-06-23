import { useState } from "react";
import axios from "axios";

function UploadContract({ onAuditComplete }) {
  const [file, setFile] = useState(null);
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleAudit = async () => {
    if (!file) {
      setError("Please select a .sol file first");
      return;
    }

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
      setError("Audit failed. Please try again.");
      console.error(err);
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".sol" onChange={handleFileChange} />
      <button onClick={handleAudit} disabled={auditing || !file}>
        {auditing ? "Analyzing contract..." : "Audit Contract"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default UploadContract;
