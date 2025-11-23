import fs from "fs"
import yaml from "js-yaml"
import { UserConfig } from "../common/types"

/**
 * octo.yml - "MODEL_API_KEY", "MODEL", "EMBED_API_KEY", PROCESS
 * agents.md
 */

class UserConfigs {
  configs: UserConfig

  constructor() {
    this.configs = {
      cwd: process.cwd(),
    }
  }

  getUserConfigs(): UserConfig {
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

  readFileSyncWithFallback(userConfigFileOpts: string[]): void {
    for (const file of userConfigFileOpts) {
      try {
        const fileContents = fs.readFileSync(file, "utf8")
        const data = yaml.load(fileContents) as UserConfig["data"]

        this.configs.data = data
      } catch (e: unknown) {
        const error = e as NodeJS.ErrnoException
        if (error.code === "ENOENT") {
          console.log("cannot find config file at", error.path)
          continue
        }
      }
    }
  }

  fetchDefaultConfigs(): UserConfig["data"] {
    return {
      MODEL_API_KEY: "",
      MODEL: "",
      EMBED_API_KEY: "",
      VECTOR_DATABASE_ENDPOINT: "",
    }
  }
}

export default new UserConfigs()
