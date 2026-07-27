import { LinkIcon, MessageSquareTextIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface Citation {
  chunkId: string
  documentLabel: string
  sourceUrl: string
  relevance: string
  excerpt: string
}

export interface Answer {
  answer: string
  confidence: "high" | "medium" | "low" | "not_found"
  coverageNote: string
  citations: Citation[]
}

const CONFIDENCE_STYLES: Record<Answer["confidence"], string> = {
  high: "border-primary/30 text-primary",
  medium: "border-accent/40 text-accent",
  low: "border-accent/40 text-accent",
  not_found: "border-destructive/40 text-destructive",
}

const CONFIDENCE_LABELS: Record<Answer["confidence"], string> = {
  high: "high confidence",
  medium: "medium confidence",
  low: "low confidence",
  not_found: "not found in knowledge base",
}

export function AnswerPanel({ answer }: { answer: Answer }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="glow-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-1.5">
            <MessageSquareTextIcon className="size-4 text-primary" />
            Answer
          </CardTitle>
          <Badge variant="outline" className={CONFIDENCE_STYLES[answer.confidence]}>
            {CONFIDENCE_LABELS[answer.confidence]}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-foreground">{answer.answer}</p>
          {answer.coverageNote && (
            <p className="text-xs text-muted-foreground">{answer.coverageNote}</p>
          )}
        </CardContent>
      </Card>

      {answer.citations.length > 0 && (
        <Card className="glow-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <LinkIcon className="size-4 text-primary" />
              Citations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {answer.citations.map((c) => (
                <li key={c.chunkId} className="glow-border-hover flex flex-col gap-1 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{c.documentLabel}</span>
                    <a
                      href={c.sourceUrl.split(" — ").pop()}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-xs text-primary hover:underline"
                    >
                      source
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.relevance}</p>
                  <p className="rounded bg-secondary/40 p-2 text-xs text-muted-foreground/80 italic">
                    &ldquo;{c.excerpt.length > 220 ? `${c.excerpt.slice(0, 220)}...` : c.excerpt}&rdquo;
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
