import { CohereEmbeddings } from "@langchain/cohere"
import { MistralAIEmbeddings } from "@langchain/mistralai"
import { config } from "dotenv"

config()

export default class EmbedCodebase {
  config: Record<string, any>
  embeddings: any = {}

  api_key_map: any = {
    cohere: "COHERE_API_KEY",
    mistral: "MISTRAL_API_KEY",
  }

  constructor(config: Record<string, any>) {
    this.config = config
  }

  getEmbeddings() {
    try {
      if (!this.config.EMBED_MODEL) this.config.EMBED_MODEL = "cohere"

      // set relevant API_KEY
      process.env[this.api_key_map[this.config.EMBED_MODEL]] =
        this.config.EMBED_API_KEY

      switch (this.config.EMBED_MODEL.toLowerCase()) {
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
      }

      return {
        model: this.config.EMBED_MODEL,
        embeddings: this.embeddings,
        API_KEY: this.config.EMBED_API_KEY,
      }
    } catch (e) {
      console.log(e)
    }
  }
}
