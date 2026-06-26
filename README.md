# 0xAudit — AI Smart Contract Auditor

AI-powered web app that audits Solidity smart contracts for security vulnerabilities using a
**RAG (Retrieval-Augmented Generation)** pipeline. Upload a `.sol` file and get back a structured
security report.

> ⚠️ This is an AI-assisted tool and **not a substitute for a professional audit**.

## How it works

```
frontend/ (React + Vite)  ──POST /api/audit (multipart)──►  backend/ (Express)
                                                                 │
        parseContract  ──►  findVulnerabilityMatches  ──►  generateAuditReport
       (chunk the code)     (Pinecone similarity search)   (Llama 3.3 70B judges)
```

1. **Parse** (`parseContract.js`) — splits the `.sol` file into ~800-char chunks (100 overlap)
   using a Solidity-aware text splitter.
2. **Retrieve** (`auditContract.js`) — embeds each chunk with Google Gemini
   (`gemini-embedding-001`) and runs a similarity search against a Pinecone index of known
   vulnerability patterns. Keeps matches scoring ≥ 0.68.
3. **Generate** (`generateReport.js`) — feeds the significant matches to Llama 3.3 70B (via Groq)
   which decides genuine issues vs. false positives and returns structured JSON.

The vulnerability knowledge base lives in `backend/knowledgeBase.js` (8 curated patterns:
reentrancy, integer overflow/underflow, unchecked external calls, access control, `tx.origin`
auth, unprotected `selfdestruct`, timestamp dependence, gas-limit DoS).

## Tech stack

| Layer        | Tech |
|--------------|------|
| Frontend     | React 19, Vite 8, Axios |
| Backend      | Express 5, Multer |
| Embeddings   | Google Gemini (`gemini-embedding-001`) |
| Vector DB    | Pinecone (namespace: `vulnerability-patterns`) |
| LLM          | Llama 3.3 70B via Groq |
| Orchestration| LangChain |

## Prerequisites

- Node.js 18+
- A [Pinecone](https://www.pinecone.io/) index
- A [Google AI Studio](https://aistudio.google.com/) API key (for embeddings)
- A [Groq](https://groq.com/) API key (for the LLM)

## Setup

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# then edit .env and fill in your keys

# 3. Seed the Pinecone knowledge base (one-time)
npm run seed
```

## Running

```bash
# Backend API (http://localhost:3002)
npm start

# Frontend dev server (in a second terminal)
cd frontend
npm run dev
```

## Smoke test

Runs the full pipeline against `sample-contract.sol` and prints the report (requires a valid
`.env` and a seeded index):

```bash
npm test
```

## Environment variables

See [`.env.example`](./.env.example). Required: `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`,
`GOOGLE_API_KEY`, `GROQ_API_KEY`. Optional: `PORT` (defaults to `3002`).

## Project structure

```
backend/
  server.js                  Express app + /api/audit endpoint
  knowledgeBase.js           Vulnerability patterns (source of truth)
  src/
    db/seedKnowledgeBase.js  One-time Pinecone seeding script
    services/
      parseContract.js       Chunk the uploaded contract
      auditContract.js       Embed + similarity search
      generateReport.js      LLM judge → structured report
frontend/                    React + Vite UI
sample-contract.sol          Example vulnerable contract
test-audit.js                CLI smoke test of the pipeline
```
