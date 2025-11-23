import { readdir, stat, readFile } from "node:fs/promises"
import path, { join, relative, extname } from "node:path"
import ignore from "ignore"
import { defaultSkipPatterns, supportedExtensions } from "./constants"
import FileSplitter from "../agent/fileSplitter"
import {
  FileInfo,
  UserConfig,
  EmbeddingConfig,
  ProcessedFile,
} from "../common/types"
import EmbedCodebase from "../agent/embed"
import Store from "../agent/store"
import { writeFile } from "node:fs/promises"

/**
 * readfiles in cwd()
 * chunk files
 * embed chunks
 * store chunks in vectorDB
 */

export class Init {
  config: UserConfig
  files: FileInfo[]
  gitignore: ignore.Ignore | null
  defaultSkipPatterns: string[]
  maxFileSize: number // in bytes (default 1MB)
  processedFiles: ProcessedFile[] | undefined
  embeddings: EmbeddingConfig | undefined
  vectorStore: Store | undefined

  constructor(config: UserConfig) {
    this.config = config
    this.files = []
    this.gitignore = null
    this.maxFileSize = 1024 * 1024 // 1MB default
    this.defaultSkipPatterns = defaultSkipPatterns
  }

  /**
   * Load and parse .gitignore files
   */
  async loadGitignore(): Promise<void> {
    const gitignorePath = join(this.config.cwd, ".gitignore")

    try {
      const gitignoreContent = await readFile(gitignorePath, "utf-8")
      this.gitignore = ignore().add(gitignoreContent)
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException
      if (error.code !== "ENOENT") {
        console.warn(`Warning: Could not read .gitignore: ${error.message}`)
      }
      // If no .gitignore, create empty ignore instance
      this.gitignore = ignore()
    }
  }

  /**
   * Check if a file should be skipped based on patterns and .gitignore
   */
  shouldSkipFile(relativePath: string, isDirectory: boolean = false): boolean {
    // Check against default skip patterns
    for (const pattern of this.defaultSkipPatterns) {
      // Simple glob matching for common patterns
      if (pattern.includes("*")) {
        const regex = new RegExp(
          "^" + pattern.replace(/\*/g, ".*").replace(/\./g, "\\.") + "$"
        )
        if (
          regex.test(relativePath) ||
          regex.test(relativePath.split("/").pop() || "")
        ) {
          return true
        }
      } else {
        // Exact match or directory match
        if (
          relativePath === pattern ||
          relativePath.startsWith(pattern + "/") ||
          relativePath.endsWith("/" + pattern) ||
          relativePath.includes("/" + pattern + "/")
        ) {
          return true
        }
      }
    }

    // Check against .gitignore
    if (this.gitignore) {
      if (this.gitignore.ignores(relativePath)) {
        return true
      }
    }

    // Check user-defined skip patterns from config
    const userSkipPatterns = this.config.data?.skip_patterns || []
    for (const pattern of userSkipPatterns) {
      if (
        relativePath.includes(pattern) ||
        relativePath.match(new RegExp(pattern))
      ) {
        return true
      }
    }

    return false
  }

  /**
   * Check if file extension should be included
   */
  shouldIncludeExtension(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase()

    // Get user-defined extensions from config, or use defaults
    const includeExtensions =
      this.config.data?.include_extensions || supportedExtensions

    // If no extensions specified, include all text files
    if (includeExtensions.length === 0) {
      return true
    }

    return includeExtensions.includes(ext)
  }

  /**
   * Recursively read all files in the codebase
   */
  async readFiles(): Promise<FileInfo[]> {
    await this.loadGitignore()
    this.files = []

    const rootPath = this.config.cwd
    await this.walkDirectory(rootPath, rootPath)

    console.log(`\nFound ${this.files.length} files to process`)
    return this.files
  }

  /**
   * Recursively walk directory and collect files
   */
  private async walkDirectory(
    dirPath: string,
    rootPath: string
  ): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name)
        const relativePath = relative(rootPath, fullPath)

        // Skip if matches our patterns
        if (this.shouldSkipFile(relativePath, entry.isDirectory())) {
          continue
        }

        if (entry.isDirectory()) {
          // Recursively process subdirectories
          await this.walkDirectory(fullPath, rootPath)
        } else if (entry.isFile()) {
          // Check file extension
          if (!this.shouldIncludeExtension(relativePath)) {
            continue
          }

          // Check file size
          try {
            const stats = await stat(fullPath)
            if (stats.size > this.maxFileSize) {
              console.warn(
                `Skipping large file: ${relativePath} (${(
                  stats.size / 1024
                ).toFixed(2)}KB)`
              )
              continue
            }

            // Read file content
            try {
              const content = await readFile(fullPath, "utf-8")
              this.files.push({
                path: fullPath,
                relativePath: relativePath,
                content: content,
              })
            } catch (readErr: unknown) {
              // Skip binary files or files that can't be read as UTF-8
              const error = readErr as NodeJS.ErrnoException
              if (error.code === "EISDIR" || error.code === "EACCES") {
                continue
              }
              console.warn(
                `Could not read file ${relativePath}: ${error.message}`
              )
            }
          } catch (statErr: unknown) {
            console.warn(`Could not stat file ${relativePath}`)
            continue
          }
        }
      }
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException
      if (error.code !== "EACCES" && error.code !== "ENOENT") {
        console.error(`Error reading directory ${dirPath}: ${error.message}`)
      }
    }
  }

  /**
   * Chunk files in codebase
   */
  async chunkFiles(): Promise<void> {
    this.processedFiles = new FileSplitter(this.files)
      .createStrategies()
      ?.getFilesWithChunkingStrategy()
  }

  /**
   * Create chunk embeddings
   */
  setEmbeddings(): void {
    this.embeddings = new EmbedCodebase(this.config).getEmbeddings()
  }

  /**
   * Store embeddings
   */
  async store(): Promise<void> {
    try {
      this.setEmbeddings()
      if (!this.embeddings) {
        throw new Error("Failed to initialize embeddings")
      }
      this.vectorStore = new Store(this.embeddings, this.config)
      this.vectorStore.setStore()

      if (!this.processedFiles) {
        throw new Error("No processed files available")
      }

      for (const file of this.processedFiles) {
        file.chunks = await file.splitter.splitText(file.content)
        await this.vectorStore.insertChunk(file)
      }

      await writeFile(
        path.join(process.cwd(), "output.json"),
        JSON.stringify(this.vectorStore.allEmbeddingPrep, null, 2)
      )
    } catch (e: unknown) {
      const error = e as Error
      console.log("splitting error", error)
    }
  }
}
