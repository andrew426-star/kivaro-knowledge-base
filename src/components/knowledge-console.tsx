"use client"

import { useState } from "react"
import { AlertTriangleIcon } from "lucide-react"

import { AnswerPanel, type Answer } from "@/components/answer-panel"
import { AskPanel } from "@/components/ask-panel"
import { RetrievedChunks, type RetrievedChunk } from "@/components/retrieved-chunks"

export function KnowledgeConsole() {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [retrieved, setRetrieved] = useState<RetrievedChunk[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAsk() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to answer the question.")
      setAnswer(data.answer)
      setRetrieved(data.retrieved)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to answer the question.")
      setAnswer(null)
      setRetrieved(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AskPanel value={question} onChange={setQuestion} onAsk={handleAsk} loading={loading} />

      {error && (
        <div className="glow-border flex items-center gap-2 rounded-lg p-3 text-sm text-destructive">
          <AlertTriangleIcon className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {answer && <AnswerPanel answer={answer} />}
      {retrieved && <RetrievedChunks chunks={retrieved} />}
    </div>
  )
}
