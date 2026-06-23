import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";
import { parseContract } from "./src/services/parseContract.js";
import { findVulnerabilityMatches, filterSignificantMatches } from "./src/services/auditContract.js";
import { generateAuditReport } from "./src/services/generateReport.js";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/api/audit", upload.single("contract"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No contract file uploaded" });
    }

    const filePath = req.file.path;
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
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
