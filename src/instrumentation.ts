export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const { getCorpusEmbeddings } = await import("@/lib/embeddings")
  getCorpusEmbeddings().catch(() => {
    // Swallowed intentionally — this is a best-effort warmup. If it fails,
    // /api/ask will retry the embedding call on the first real request and
    // surface a real error there instead.
  })
}
