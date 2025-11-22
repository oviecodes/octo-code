import { readdir } from "node:fs/promises"

/**
 * readfiles in cwd()
 * chunk files
 * embed chunks
 * store chunks in vectorDB
 */

export class Init {
  config: Record<string, any>
  directories: string[]
  files: string[]
  skipList: string[]

  constructor(config: Record<string, any>) {
    this.config = config
    this.directories = []
    this.files = []
    this.skipList = [".env", "octo.yaml", "octo.yml", "*.json"]
  }

  async readFiles() {
    try {
      this.directories = await readdir(`${this.config.cwd}/src`)
      for (const dir of this.directories) {
        // check file stat
        // if it's a folder, reject
        console.log(`\n${dir}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  chunkFiles() {}

  embedChunks() {}

  store() {}
}
