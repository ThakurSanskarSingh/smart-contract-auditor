// Centralised env loader.
// `import "dotenv/config"` resolves .env relative to the current working
// directory, so `node backend/server.js` from the repo root would silently
// miss backend/.env and crash. Loading by absolute path makes env vars
// available no matter where the process is launched from.
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(__dirname, "..", ".env") });
