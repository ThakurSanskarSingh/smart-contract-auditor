import "./config/env.js";
import fs from "fs/promises";
import express from "express";
import multer from "multer";
import cors from "cors";
import { parseContract } from "./src/services/parseContract.js";
import { findVulnerabilityMatches, filterSignificantMatches } from "./src/services/auditContract.js";
import { generateAuditReport } from "./src/services/generateReport.js";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB cap — guards against oversized uploads
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith(".sol")) return cb(null, true);
    cb(new Error("Only Solidity (.sol) files are accepted"));
  },
});

const uploadSingle = upload.single("contract");

app.post("/api/audit", (req, res) => {
  // Run multer manually so size/type rejections return a clean 400
  // instead of bubbling up as an unhandled 500.
  uploadSingle(req, res, (uploadErr) => {
    if (uploadErr) {
      const status = uploadErr instanceof multer.MulterError ? 413 : 400;
      return res.status(status).json({ error: uploadErr.message });
    }
    handleAudit(req, res);
  });
});

async function handleAudit(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No contract file uploaded" });
  }

  const filePath = req.file.path;

  try {
    const { fileContent, chunks } = await parseContract(filePath);

    const allMatches = await findVulnerabilityMatches(chunks);
    const significantMatches = filterSignificantMatches(allMatches);

    const report = await generateAuditReport(significantMatches, fileContent);

    res.json({
      fileName: req.file.originalname,
      totalChunksAnalyzed: chunks.length,
      potentialIssuesFound: significantMatches.length,
      report,
    });
  } catch (error) {
    console.error("Audit error:", error);
    res.status(500).json({ error: "Failed to audit contract" });
  } finally {
    // Always remove the temp upload so it doesn't accumulate on disk.
    await fs.unlink(filePath).catch((err) =>
      console.error("Failed to delete temp upload:", filePath, err.message)
    );
  }
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
