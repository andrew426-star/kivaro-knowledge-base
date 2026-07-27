import { SAMPLE_DOCUMENTS } from "@/lib/sample-documents"

const CHUNK_TARGET_CHARS = 900
const CHUNK_MIN_CHARS = 400
const BOUNDARY_WINDOW = 200

// Bounds the sentence-boundary search to a fixed window around the target
// length. A naive backward-only lastIndexOf(". ") search would misbehave on
// the dense financial tables in the 8-K/10-Q sample documents (almost no
// sentence-ending periods for long stretches) — it can jump back into an
// unrelated earlier sentence and produce one oversized chunk. This falls
// back to the nearest whitespace, then a hard cut, instead.
export function chunkText(text: string, target = CHUNK_TARGET_CHARS): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const idealEnd = Math.min(start + target, text.length)
    if (idealEnd >= text.length) {
      chunks.push(text.slice(start).trim())
      break
    }
    const windowStart = Math.max(start + CHUNK_MIN_CHARS, idealEnd - BOUNDARY_WINDOW)
    const searchSpace = text.slice(windowStart, idealEnd + BOUNDARY_WINDOW)
    const periodIdx = searchSpace.lastIndexOf(". ")
    const whitespaceEnd = text.lastIndexOf(" ", idealEnd)
    const end =
      periodIdx !== -1
        ? windowStart + periodIdx + 1
        : whitespaceEnd > start
          ? whitespaceEnd
          : idealEnd
    chunks.push(text.slice(start, end).trim())
    start = end
  }
  return chunks.filter((c) => c.length > 0)
}

export interface KnowledgeChunk {
  id: string
  documentId: string
  documentLabel: string
  company: string
  docType: string
  sourceUrl: string
  index: number
  text: string
}

export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = SAMPLE_DOCUMENTS.flatMap((doc) =>
  chunkText(doc.text).map((text, index) => ({
    id: `${doc.id}#${index}`,
    documentId: doc.id,
    documentLabel: doc.label,
    company: doc.company,
    docType: doc.docType,
    sourceUrl: doc.source,
    index,
    text,
  }))
)
