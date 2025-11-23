export interface FileInfo {
  path: string
  relativePath: string
  content: string
}

export interface ChunkMetadata {
  filePath: string
  relativePath: string
  fileExtension: string
  language: string
  totalChunks: number
  chunkIndex: number
  lastModified: string | Date
}

export interface ChunkDocument {
  id: string
  text: string
  metadata: ChunkMetadata
}

export interface ProcessedFile {
  chunks: string[]
  metadata: Omit<ChunkMetadata, "totalChunks" | "chunkIndex" | "lastModified">
  content: string
  lastModified: Date
  splitter: any // RecursiveCharacterTextSplitter
}

export interface UserConfig {
  cwd: string
  data?: {
    MODEL_API_KEY?: string
    MODEL?: string
    EMBED_MODEL?: string
    EMBED_API_KEY?: string
    VECTOR_DATABASE_ENDPOINT?: string
    VECTOR_DB?: string
    skip_patterns?: string[]
    include_extensions?: string[]
  }
}

export interface EmbeddingConfig {
  model: string
  embeddings: any // CohereEmbeddings | MistralAIEmbeddings
  API_KEY: string
}

export interface ChunkSizeConfig {
  chunkSize: number
  chunkOverlap: number
}

export type LanguageExtension = ".js" | ".ts" | ".py" | ".md" | ".html"
export type Language = "js" | "python" | "markdown" | "html"
