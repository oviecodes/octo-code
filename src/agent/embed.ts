import { CohereEmbeddings } from "@langchain/cohere"
import { MistralAIEmbeddings } from "@langchain/mistralai"
import { config } from "dotenv"
import { UserConfig, EmbeddingConfig } from "../common/types"

config()

export default class EmbedCodebase {
  config: UserConfig
  embeddings: CohereEmbeddings | MistralAIEmbeddings | null = null

  api_key_map: Record<string, string> = {
    cohere: "COHERE_API_KEY",
    mistral: "MISTRAL_API_KEY",
  }

  constructor(config: UserConfig) {
    this.config = config
  }

  getEmbeddings(): EmbeddingConfig | undefined {
    try {
      const embedModel = this.config.data?.EMBED_MODEL || "cohere"
      const embedApiKey = this.config.data?.EMBED_API_KEY || "anytypeKey"

      // set relevant API_KEY
      const envKey = this.api_key_map[embedModel]
      process.env[envKey] = embedApiKey

      switch (embedModel.toLowerCase()) {
        case "cohere":
          this.embeddings = new CohereEmbeddings({
            model: "embed-english-v3.0",
          })
          break

        case "mistral":
          this.embeddings = new MistralAIEmbeddings({
            model: "mistral-embed",
          })
          break

        default:
          console.log("NO EMBEDING MODEL")
          return undefined
      }

      return {
        model: embedModel,
        embeddings: this.embeddings,
        API_KEY: embedApiKey,
      }
    } catch (e: unknown) {
      const error = e as Error
      console.log(error)
      return undefined
    }
  }
}
