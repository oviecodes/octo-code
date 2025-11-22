// readfiles in cwd()
// chunk files
// embed chunks
// store chunks in vectorDB

export class init {
  cwd: string
  db: string
  embedAPIKey: string

  constructor(cwd: string, db: string, embedAPIKEY: string) {
    this.cwd = cwd
    this.db = db
    this.embedAPIKey = embedAPIKEY
  }

  readFiles() {}

  chunkFiles() {}

  embedChunks() {}

  store() {}
}
