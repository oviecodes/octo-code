import fs from "fs"
import yaml from "js-yaml"
/**
 * octo.yml - "MODEL_API_KEY", "MODEL", "EMBED_API_KEY", PROCESS
 * agents.md
 */

class UserConfigs {
  cwd: string
  configs: Record<string, any> | null

  constructor() {
    this.cwd = process.cwd()
    this.configs = null
  }

  getUserConfigs() {
    this.readFileSyncWithFallback(["octo.yml", "octo.yaml"])
    if (this.configs == null) {
      console.log("falling back to default config")
      return this.fetchDefaultConfigs()
    }

    return this.configs
  }

  readFileSyncWithFallback(userConfigFileOpts: string[]) {
    for (let file of userConfigFileOpts) {
      try {
        const fileContents = fs.readFileSync(file, "utf8")
        const data: any = yaml.load(fileContents)

        this.configs = data
      } catch (e: any) {
        if (e.code === "ENOENT") {
          console.log("cannot find config file at", e.path)
          continue
        }
      }
    }
  }

  fetchDefaultConfigs() {
    return {
      MODEL_API_KEY: "",
      MODEL: "",
      EMBED_API_KEY: "",
      VECTOR_DATABASE_ENDPOINT: "",
    }
  }
}

export default new UserConfigs()
