import Cli from "./src/cli/cli"
import userConfigs from "./src/helpers/userConfigs"

process.on("unhandledRejection", (reason: any) => {
  if (reason && typeof reason === "object" && "code" in reason) {
    if (reason.code === "ERR_USE_AFTER_CLOSE") {
      console.log("\nShutting down gracefully...")
      console.log("Goodbye!")
      process.exit(0)
    }
  }
})

process.on("uncaughtException", (error: any) => {
  if (error?.code === "ERR_USE_AFTER_CLOSE") {
    console.log("\nShutting down gracefully...")
    console.log("Goodbye!")
    process.exit(0)
  }
})

const shell = new Cli(userConfigs.getUserConfigs())
shell.startShell()
