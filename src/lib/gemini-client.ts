import { GoogleGenAI } from "@google/genai"

let client: GoogleGenAI | null = null

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set")
    client = new GoogleGenAI({ apiKey })
  }
  return client
}

// gemini-flash-latest is a live-updating alias (currently Gemini 3.5
// Flash) rather than a dated snapshot — same reasoning as GROQ_MODEL /
// ELEVENLABS_MODEL_ID elsewhere in this codebase: these get superseded on
// their own cadence and shouldn't be hardcoded inline. Configurable via
// env var, defaulted here.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest"

// Verified directly against the live API: text-embedding-004 (the model
// named in the installed @google/genai SDK's own doc-comment examples)
// 404s on embedContent for this API key. gemini-embedding-001 returns a
// real embedding and is what this app uses by default.
export const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001"
