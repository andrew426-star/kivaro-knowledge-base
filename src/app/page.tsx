import { KnowledgeBasePanel } from "@/components/knowledge-base-panel"
import { KnowledgeConsole } from "@/components/knowledge-console"

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6 sm:px-8">
      <header className="flex flex-col gap-1 py-2">
        <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Internal Knowledge Systems
        </span>
        <h1 className="font-heading text-2xl text-gradient-green sm:text-3xl">
          A Knowledge Base That Knows What It Doesn&apos;t Know
        </h1>
        <p className="text-sm text-muted-foreground">
          Real documents, indexed and embedded, retrieved by semantic search — not a chat box
          guessing. Ask a question and get an answer grounded in exactly what&apos;s indexed, with
          citations back to the source passages, or a clear admission when the knowledge base
          doesn&apos;t cover it.
        </p>
      </header>

      <KnowledgeBasePanel />
      <KnowledgeConsole />
    </div>
  )
}
