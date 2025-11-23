import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import {
  FileInfo,
  ProcessedFile,
  LanguageExtension,
  Language,
  ChunkSizeConfig,
} from "../common/types"
import path from "path"

class FileSplitter {
  files: FileInfo[]
  chunks: ProcessedFile[] = []
  strategies: Partial<Record<Language, RecursiveCharacterTextSplitter>> = {}

  languageExt: Record<string, Language> = {
    ".js": "js",
    ".ts": "js",
    ".py": "python",
    ".md": "markdown",
    ".html": "html",
  }

  chunkSizeConfig: Partial<Record<string, ChunkSizeConfig>> = {
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
  }

  constructor(files: FileInfo[]) {
    this.files = files
  }

  getFilesWithChunkingStrategy(): ProcessedFile[] {
    return this.chunks
  }

  createStrategies(): this {
    console.log("files length", this.files.length)
    for (const file of this.files) {
      try {
        const ext = path.extname(file.relativePath) as LanguageExtension
        const language = this.languageExt[ext]
        if (!language) continue

        if (!this.strategies[language]) {
          this.strategies[language] =
            RecursiveCharacterTextSplitter.fromLanguage(language, {
              chunkSize: 1500,
              chunkOverlap: 200,
            })
        }

        this.chunks.push({
          chunks: [],
          metadata: {
            filePath: file.path,
            relativePath: file.relativePath,
            fileExtension: path.extname(file.relativePath),
            language,
          },
          content: file.content,
          lastModified: new Date(),
          splitter: this.strategies[language],
        })
      } catch (e: unknown) {
        const error = e as Error
        console.log("error occured", error)
      }
    }

    return this
  }
}

export default FileSplitter
