import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { FileInfo } from "../common/types"
import path from "path"

class FileSplitter {
  files: FileInfo[]
  chunks: any
  strategies: any

  languageExt: any = {
    ".js": "js",
    ".ts": "ts",
    ".py": "python",
    ".md": "markdown",
    ".html": "html",
  }

  constructor(files: FileInfo[]) {
    this.files = files
  }

  getFilesWithChunkingStrategy(ext: string) {}

  createStrategies() {
    for (let file of this.files) {
      try {
        console.log("about to chunk", file)
        const language = this.languageExt[path.extname(file.path)]
        if (!language) continue

        if (this.strategies[language])
          this.strategies[language] =
            RecursiveCharacterTextSplitter.fromLanguage(language, {
              chunkSize: 1500,
              chunkOverlap: 200,
            })
      } catch (e: any) {
        console.log("error occured", e)
      }
    }
  }
}

export default FileSplitter
