import { DatabaseIcon, FileTextIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KNOWLEDGE_CHUNKS } from "@/lib/chunking"
import { SAMPLE_DOCUMENTS } from "@/lib/sample-documents"

export function KnowledgeBasePanel() {
  const chunkCounts = new Map<string, number>()
  for (const chunk of KNOWLEDGE_CHUNKS) {
    chunkCounts.set(chunk.documentId, (chunkCounts.get(chunk.documentId) ?? 0) + 1)
  }

  return (
    <Card className="glow-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <DatabaseIcon className="size-4 text-primary" />
          Knowledge Base Index
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {SAMPLE_DOCUMENTS.length} documents · {KNOWLEDGE_CHUNKS.length} indexed passages
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SAMPLE_DOCUMENTS.map((doc) => (
            <a
              key={doc.id}
              href={doc.source.split(" — ").pop()}
              target="_blank"
              rel="noreferrer"
              className="glow-border-hover flex flex-col gap-1.5 rounded-lg p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <FileTextIcon className="size-3.5 shrink-0 text-primary" />
                  {doc.company}
                </span>
                <Badge variant="outline" className="shrink-0 border-primary/30 text-primary">
                  {chunkCounts.get(doc.id) ?? 0} passages
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{doc.docType}</span>
              <span className="text-xs text-muted-foreground/70">{doc.title}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
