import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});

const KNOWLEDGE_BASE_NAMESPACE = "vulnerability-patterns";

export async function findVulnerabilityMatches(codeChunks) {
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: KNOWLEDGE_BASE_NAMESPACE,
  });

  const allMatches = [];

  // perform similarity search for each code chunk and collect matches, including similarity scores that tells how relevant the matched pattern is to the code chunk. A higher score indicates a closer match. need a score threshold to filter out less relevant matches. For example, only consider matches with a similarity score above 0.7 as relevant.

  // loop through each code chunk as each code needs to be checked against the knowledge base for potential vulnerabilities. For each code chunk, perform a similarity search in the vector store to find the most relevant vulnerability patterns. The search returns a list of documents along with their similarity scores, which indicate how closely each pattern matches the code chunk. Store these matches in an array for further analysis or reporting.


  for (const chunk of codeChunks) {
    const results = await vectorStore.similaritySearchWithScore(chunk, 2);

    for (const [doc, score] of results) {
      allMatches.push({
        codeChunk: chunk,
        matchedPattern: doc.pageContent,
        patternMetadata: doc.metadata,
        similarityScore: score,
      });
    }
  }
  console.log("\n--- ALL matches (unfiltered) ---");
allMatches.forEach((m) => {
  console.log(`${m.patternMetadata.title}: ${m.similarityScore.toFixed(2)}`);
  console.log(m.codeChunk.substring(0, 80));
  console.log("---");
});

  return allMatches;
}


//filter the matches based on a similarity score threshold to only include significant matches
export function filterSignificantMatches(matches, threshold = 0.68) {
  return matches.filter((match) => match.similarityScore >= threshold);
}
