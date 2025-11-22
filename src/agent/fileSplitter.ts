import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { FileInfo } from "../common/types"
import path from "path"
import { v4 } from "uuid"

class FileSplitter {
  files: FileInfo[]
  chunks: any = []
  strategies: any = {}

  languageExt: any = {
    ".js": "js",
    ".ts": "js",
    ".py": "python",
    ".md": "markdown",
    ".html": "html",
  }

  chunkSizeConfig = {
    /**
     * .json, .yaml, .yml, .toml, .ini, .cfg, .conf - { chunkSize: 500 - 1000, overlap: 50-10 }
     *
     * .md, .mdx, .txt - { chunkSize: 1000 - 1500, overlap: 100 - 200 }
     *
     * web files(.html, .css, .scss, .sass, .vue, .svelte) - { chunkSize: 1000 - 1500, overlap: 100 - 200 }
     *
     * Query language (.sql, .graphql, .gql) - { chunkSize: 1000 - 1500, overlap: 100 - 200 }
     *
     * default code files - { chunkSize: 1500 - 2000, overlap: 200 - 300 }
     */

    ".md": {
      chunkSize: 1000,
      chunkOverlap: 200,
    },
    ".sql": {},
  }

  constructor(files: FileInfo[]) {
    this.files = files
  }

  getFilesWithChunkingStrategy() {
    return this.chunks
  }

  createStrategies() {
    for (let file of this.files) {
      try {
        const language = this.languageExt[path.extname(file.relativePath)]
        if (!language) continue

        if (!this.strategies[language]) {
          this.strategies[language] =
            RecursiveCharacterTextSplitter.fromLanguage(language, {
              chunkSize: 1500,
              chunkOverlap: 200,
            })
        }

        this.chunks.push({
          id: v4(),
          metadata: {
            filePath: file.path,
            relativePath: file.relativePath,
            language,
          },
          text: file.content,
          lastModified: new Date(),
          embedding: [],
          splitter: this.strategies[language],
        })
      } catch (e: any) {
        console.log("error occured", e)
      }

      return this
    }
  }
}

export default FileSplitter
