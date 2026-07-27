import { NextResponse } from "next/server"
import { Type } from "@google/genai"

import { GEMINI_MODEL, getGeminiClient } from "@/lib/gemini-client"
import { KNOWLEDGE_CHUNKS } from "@/lib/chunking"
import { embedQuery, getCorpusEmbeddings, rankChunks } from "@/lib/embeddings"

const MAX_QUESTION_CHARS = 400
const TOP_K = 5

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description:
        "Answer grounded only in the provided knowledge base excerpts. If they don't contain enough information, say so explicitly rather than guessing.",
    },
    confidence: {
      type: Type.STRING,
      format: "enum",
      enum: ["high", "medium", "low", "not_found"],
      description: "'not_found' if the retrieved excerpts do not contain information relevant to the question.",
    },
    citations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          chunkId: { type: Type.STRING, description: "Must exactly match one of the provided chunk IDs." },
          relevance: { type: Type.STRING, description: "One short sentence on what this chunk contributed." },
        },
        required: ["chunkId", "relevance"],
      },
      description: "Empty array if confidence is 'not_found'.",
    },
    coverageNote: {
      type: Type.STRING,
      description: "One sentence noting gaps — parts of the question the knowledge base doesn't cover.",
    },
  },
  required: ["answer", "confidence", "citations", "coverageNote"],
}

function buildPrompt(question: string, chunks: { id: string; documentLabel: string; company: string; docType: string; text: string }[]): string {
  const context = chunks
    .map(
      (c) =>
        `--- CHUNK [${c.id}] — ${c.company}, ${c.docType} (${c.documentLabel}) ---\n${c.text}`
    )
    .join("\n\n")

  return `You are answering a question using only the knowledge base excerpts below. Ground your answer strictly in this material — do not use outside knowledge, and do not guess. If the excerpts don't contain enough information to answer, say so explicitly and set confidence to "not_found". Cite every source you draw from by its exact chunk ID. Output plain prose only in the "answer" field — no markdown formatting of any kind (no **bold**, no #headers, no bullet lists or dashes); write it as normal sentences and paragraphs.

QUESTION: ${question}

KNOWLEDGE BASE EXCERPTS:
${context}`
}

export async function POST(request: Request) {
  let question: string
  try {
    const body = await request.json()
    question = typeof body.question === "string" ? body.question.trim() : ""
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!question) {
    return NextResponse.json({ error: "No question provided." }, { status: 422 })
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return NextResponse.json(
      { error: `Question is too long (max ${MAX_QUESTION_CHARS} characters).` },
      { status: 422 }
    )
  }

  try {
    const [corpusEmbeddings, questionEmbedding] = await Promise.all([
      getCorpusEmbeddings(),
      embedQuery(question),
    ])

    const ranked = rankChunks(questionEmbedding, corpusEmbeddings)
    const topChunks = ranked.slice(0, TOP_K)

    const client = getGeminiClient()
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(question, topChunks.map((r) => r.chunk)),
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    })

    const raw = response.text
    if (!raw) throw new Error("Gemini returned an empty response.")
    const parsed = JSON.parse(raw)

    const chunkById = new Map(KNOWLEDGE_CHUNKS.map((c) => [c.id, c]))
    const citations = (parsed.citations as { chunkId: string; relevance: string }[])
      .map((c) => {
        const chunk = chunkById.get(c.chunkId)
        if (!chunk) return null
        return {
          chunkId: chunk.id,
          documentLabel: chunk.documentLabel,
          sourceUrl: chunk.sourceUrl,
          relevance: c.relevance,
          excerpt: chunk.text,
        }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)

    return NextResponse.json({
      answer: {
        answer: parsed.answer,
        confidence: parsed.confidence,
        coverageNote: parsed.coverageNote,
        citations,
      },
      retrieved: ranked.map((r) => ({
        chunkId: r.chunk.id,
        documentLabel: r.chunk.documentLabel,
        company: r.chunk.company,
        docType: r.chunk.docType,
        similarity: r.similarity,
        text: r.chunk.text,
        used: topChunks.some((t) => t.chunk.id === r.chunk.id),
      })),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to answer the question." },
      { status: 502 }
    )
  }
}
