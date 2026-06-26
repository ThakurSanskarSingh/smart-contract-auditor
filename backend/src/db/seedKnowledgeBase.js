import "../../config/env.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { formatPatternsForEmbedding } from "../../knowledgeBase.js";

// this script seeds the Pinecone index with the vulnerability patterns for later retrieval and use in the RAG chatbot. 
// performs the following steps:
// 1. Formats the vulnerability patterns for embedding using the formatPatternsForEmbedding function.
// 2. Creates a Pinecone client and connects to the specified index.
// 3. Generates embeddings for each formatted pattern using Google Generative AI Embeddings.
// 4. Stores the embeddings in the Pinecone index under a specific namespace.

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});

const KNOWLEDGE_BASE_NAMESPACE = "vulnerability-patterns";

async function seedKnowledgeBase() {
  const formattedPatterns = formatPatternsForEmbedding();

  const documents = formattedPatterns.map((pattern) => ({
    pageContent: pattern.text,
    metadata: pattern.metadata,
  }));

  // Deterministic IDs (the pattern id) make re-seeding idempotent: a second run
  // upserts the same vectors instead of inserting duplicates with random IDs.
  const ids = formattedPatterns.map((pattern) => pattern.metadata.id);

  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: KNOWLEDGE_BASE_NAMESPACE,
  });

  await store.addDocuments(documents, { ids });

  console.log(
    `Seeded ${documents.length} vulnerability patterns into Pinecone index "${process.env.PINECONE_INDEX_NAME}" under namespace "${KNOWLEDGE_BASE_NAMESPACE}".`
  );
}

seedKnowledgeBase().catch((error) => {
  console.error("Error seeding knowledge base:", error);
});
