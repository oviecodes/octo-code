import Cli from "./src/cli/cli"
import userConfigs from "./src/helpers/userConfigs"
import { Init } from "./src/helpers/init"

process.on("unhandledRejection", (reason: unknown) => {
  if (reason && typeof reason === "object" && "code" in reason) {
    console.log("\nQuitting OCTO...")
    process.exit(0)
  }
})

process.on("uncaughtException", (error: unknown) => {
  console.log("\nQuitting OCTO...")
  process.exit(0)
})

const config = userConfigs.getUserConfigs()

;(async () => {
  // index codebase
  const initialize = new Init(config)
  await initialize.readFiles()
  await initialize.chunkFiles()
  await initialize.store()

  // start shell
  const shell = new Cli(config)
  await shell.startShell()
})()
