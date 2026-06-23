import { parseContract } from "./backend/src/services/parseContract.js";
import { findVulnerabilityMatches, filterSignificantMatches } from "./backend/src/services/auditContract.js";
import { generateAuditReport } from "./backend/src/services/generateReport.js";

const {fileContent, chunks } = await parseContract("./sample-contract.sol");
const allMatches = await findVulnerabilityMatches(chunks);
const significantMatches = filterSignificantMatches(allMatches);

const report = await generateAuditReport(significantMatches, fileContent);
console.log("Audit Report:", JSON.stringify(report, null, 2));
