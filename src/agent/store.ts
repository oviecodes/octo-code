import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 } from "uuid"
import {
  EmbeddingConfig,
  UserConfig,
  ProcessedFile,
  ChunkDocument,
} from "../common/types"

export default class Store {
  embeddings: EmbeddingConfig
  config: UserConfig
  store: MemoryVectorStore | null = null
  allEmbeddingPrep: ChunkDocument[] = []

  constructor(embeddings: EmbeddingConfig, config: UserConfig) {
    this.embeddings = embeddings
    this.config = config

    return this
  }

  /**
   * set the store based on user settings
   */
  setStore(): this {
    // try pgvector
    // default to inmemoryDB
    const vectorDb = this.config.data?.VECTOR_DB || "inMemory"

    switch (vectorDb.toLowerCase()) {
      case "pgvector":
        // TODO: Implement pgvector
        break
      default:
        // use an in-memory vector store
        this.store = new MemoryVectorStore(this.embeddings.embeddings)
    }

    return this
  }

  async insertChunk(file: ProcessedFile): Promise<void> {
    // loop through, build out structure and insert
    for (let i = 0; i < file.chunks.length; i++) {
      const toEmbed: ChunkDocument = {
        id: v4(),
        text: file.chunks[i],
        metadata: {
          ...file.metadata,
          totalChunks: file.chunks.length,
          chunkIndex: i,
          lastModified:
            file.lastModified instanceof Date
              ? file.lastModified.toISOString()
              : file.lastModified,
        },
      }

      this.allEmbeddingPrep.push(toEmbed)
    }
  }
}
