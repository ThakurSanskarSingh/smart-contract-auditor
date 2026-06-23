import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateAuditReport(significantMatches, contractSourceCode) {
  const matchesSummary = significantMatches
    .map(
      (m, idx) =>
        `Match ${idx + 1}:\nVulnerability type: ${m.patternMetadata.title}\nSeverity: ${m.patternMetadata.severity}\nSimilarity score: ${m.similarityScore.toFixed(2)}\nMatched code:\n${m.codeChunk}\n`
    )
    .join("\n---\n");

  const systemPrompt = `You are a smart contract security auditor. You will be given potential vulnerability matches found via semantic similarity search against a known vulnerability knowledge base, along with the relevant code chunks.

For each match, evaluate whether it represents a genuine vulnerability in the code. Some matches may be false positives (the code resembles the pattern but isn't actually vulnerable in context) — use your judgment.

Respond ONLY with valid JSON in this exact format, no other text:

{
  "findings": [
    {
      "title": "string - name of the vulnerability",
      "severity": "High" | "Medium" | "Low",
      "isGenuineIssue": true | false,
      "explanation": "string - clear explanation of why this is or isn't a real issue, referencing the specific code",
      "recommendation": "string - how to fix it, only if isGenuineIssue is true, otherwise empty string"
    }
  ],
  "overallRiskLevel": "High" | "Medium" | "Low",
  "summary": "string - 2-3 sentence overall assessment of the contract"
}`;

  const userPrompt = `Here are the potential vulnerability matches found in this contract:\n\n${matchesSummary}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const report = JSON.parse(response.choices[0].message.content);
  return report;
}
