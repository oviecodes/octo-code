import fs from "fs"
import yaml from "js-yaml"
/**
 * octo.yml - "MODEL_API_KEY", "MODEL", "EMBED_API_KEY", PROCESS
 * agents.md
 */

class UserConfigs {
  configs: Record<string, any>

  constructor() {
    this.configs = {}
    this.configs.cwd = process.cwd()
  }

  getUserConfigs() {
    this.readFileSyncWithFallback(["octo.yml", "octo.yaml"])

    // Ensure cwd is always set
    if (!this.configs.cwd) {
      this.configs.cwd = process.cwd()
    }

    // If no data was loaded, use defaults
    if (!this.configs.data) {
      console.log("falling back to default config")
      this.configs.data = this.fetchDefaultConfigs()
    }

    return this.configs
  }

  readFileSyncWithFallback(userConfigFileOpts: string[]) {
    for (let file of userConfigFileOpts) {
      try {
        const fileContents = fs.readFileSync(file, "utf8")
        const data: any = yaml.load(fileContents)

        this.configs.data = data
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
