import { CohereEmbeddings } from "@langchain/cohere"
import { MistralAIEmbeddings } from "@langchain/mistralai"

export default class EmbedCodebase {
  config: Record<string, any>
  embeddings: any

  constructor(config: Record<string, any>) {
    this.config = config
  }

  getEmbeddings() {
    if (this.config.EMBED_MODEL == "") this.config.EMBED_MODEL = "cohere"

    switch (this.config.EMBED_MODEL.toLowerCase()) {
      case "cohere":
        this.embeddings = new CohereEmbeddings({
          model: "embed-english-v3.0",
        })

      case "mistral":
        this.embeddings = new MistralAIEmbeddings({
          model: "mistral-embed",
        })

      default:
        console.log("NO EMBEDING MODEL")
    }

    return {
      model: this.config.EMBED_MODEL,
      embeddings: this.embeddings,
      API_KEY: this.config.EMBED_API_KEY,
    }
  }
}
