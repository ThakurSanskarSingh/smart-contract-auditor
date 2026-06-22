import { parseContract } from "./parseContract.js";
import { findVulnerabilityMatches, filterSignificantMatches } from "./auditContract.js";

const { chunks } = await parseContract("./sample-contract.sol");
const allMatches = await findVulnerabilityMatches(chunks);
const significantMatches = filterSignificantMatches(allMatches);

console.log(`Total matches: ${allMatches.length}`);
console.log(`Significant matches: ${significantMatches.length}`);
significantMatches.forEach((m) => {
  console.log(`\n--- Match: ${m.patternMetadata.title} (score: ${m.similarityScore.toFixed(2)}) ---`);
  console.log(m.codeChunk.substring(0, 100));
});
