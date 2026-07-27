import { GEMINI_EMBEDDING_MODEL, getGeminiClient } from "@/lib/gemini-client"
import { KNOWLEDGE_CHUNKS, type KnowledgeChunk } from "@/lib/chunking"

export interface EmbeddedChunk {
  chunk: KnowledgeChunk
  values: number[]
}

async function embedCorpus(): Promise<EmbeddedChunk[]> {
  const client = getGeminiClient()
  const response = await client.models.embedContent({
    model: GEMINI_EMBEDDING_MODEL,
    contents: KNOWLEDGE_CHUNKS.map((c) => c.text),
    config: { taskType: "RETRIEVAL_DOCUMENT" },
  })

  const embeddings = response.embeddings
  if (!embeddings || embeddings.length !== KNOWLEDGE_CHUNKS.length) {
    throw new Error("Gemini returned an unexpected number of chunk embeddings.")
  }

  return KNOWLEDGE_CHUNKS.map((chunk, i) => {
    const values = embeddings[i].values
    if (!values) throw new Error(`Missing embedding values for chunk ${chunk.id}.`)
    return { chunk, values }
  })
}

// Cache the in-flight promise, not the resolved value — otherwise
// concurrent requests during a cold start each kick off their own
// redundant embedCorpus() call. Reset to null on rejection so a
// transient API failure doesn't permanently wedge the server.
let corpusEmbeddingsPromise: Promise<EmbeddedChunk[]> | null = null

export function getCorpusEmbeddings(): Promise<EmbeddedChunk[]> {
  if (!corpusEmbeddingsPromise) {
    corpusEmbeddingsPromise = embedCorpus().catch((err) => {
      corpusEmbeddingsPromise = null
      throw err
    })
  }
  return corpusEmbeddingsPromise
}

export async function embedQuery(question: string): Promise<number[]> {
  const client = getGeminiClient()
  const response = await client.models.embedContent({
    model: GEMINI_EMBEDDING_MODEL,
    contents: [question],
    config: { taskType: "RETRIEVAL_QUERY" },
  })
  const values = response.embeddings?.[0]?.values
  if (!values) throw new Error("Gemini returned an empty embedding for the question.")
  return values
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export interface RankedChunk {
  chunk: KnowledgeChunk
  similarity: number
}

export function rankChunks(questionEmbedding: number[], corpus: EmbeddedChunk[]): RankedChunk[] {
  return corpus
    .map((entry) => ({ chunk: entry.chunk, similarity: cosineSimilarity(questionEmbedding, entry.values) }))
    .sort((a, b) => b.similarity - a.similarity)
}
