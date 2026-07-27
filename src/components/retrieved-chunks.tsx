"use client"

import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon, SearchCodeIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface RetrievedChunk {
  chunkId: string
  documentLabel: string
  company: string
  docType: string
  similarity: number
  text: string
  used: boolean
}

export function RetrievedChunks({ chunks }: { chunks: RetrievedChunk[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="glow-border">
      <CardHeader
        className="flex cursor-pointer flex-row items-center justify-between"
        onClick={() => setExpanded((v) => !v)}
      >
        <CardTitle className="flex items-center gap-1.5">
          <SearchCodeIcon className="size-4 text-primary" />
          Retrieval — What Was Actually Searched
        </CardTitle>
        {expanded ? <ChevronUpIcon className="size-4 text-muted-foreground" /> : <ChevronDownIcon className="size-4 text-muted-foreground" />}
      </CardHeader>
      {expanded && (
        <CardContent>
          <ul className="flex flex-col gap-2">
            {chunks.map((c) => (
              <li
                key={c.chunkId}
                className={`flex flex-col gap-1 rounded-lg p-2.5 ${c.used ? "glow-border-hover" : "opacity-50"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {c.company} — {c.docType}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {c.used && (
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        used
                      </Badge>
                    )}
                    <span className="font-mono text-xs text-muted-foreground">
                      {(c.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/80">
                  {c.text.length > 160 ? `${c.text.slice(0, 160)}...` : c.text}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  )
}
