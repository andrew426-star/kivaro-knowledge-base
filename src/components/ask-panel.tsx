"use client"

import { Loader2Icon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const EXAMPLE_QUESTIONS = [
  "What does Tesla say about tariff and trade policy risk?",
  "How do Tesla's and NVIDIA's supply chain risks compare?",
  "What was NVIDIA's Data Center revenue growth last quarter?",
  "What is Tesla's dividend policy?",
]

interface AskPanelProps {
  value: string
  onChange: (value: string) => void
  onAsk: () => void
  loading: boolean
}

export function AskPanel({ value, onChange, onAsk, loading }: AskPanelProps) {
  return (
    <Card className="glow-border">
      <CardHeader>
        <CardTitle>Ask the Knowledge Base</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ask a question grounded in the indexed documents..."
          disabled={loading}
          className="h-20 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60"
        />
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onChange(q)}
              disabled={loading}
              className="glow-border-hover rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-end">
          <Button type="button" onClick={onAsk} disabled={loading || !value.trim()}>
            {loading ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
            {loading ? "Searching..." : "Ask"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
