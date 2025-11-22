import { prompt } from "enquirer"
import EventEmitter from "events"

export default class Cli extends EventEmitter {
  config: Record<string, any>

  constructor(config: any) {
    super()
    this.config = config
  }

  async startShell() {
    console.log("octo-code shell. Type 'exit' to quit.\n")
    console.log(this.config)

    let shouldExit = false

    while (!shouldExit) {
      try {
        const { command } = await prompt<{ command: string }>({
          type: "input",
          name: "command",
          message: "prompt: ",
        })

        if (shouldExit) {
          console.log("Goodbye!")
          process.exit(0)
        }

        const input = command.trim()

        if (input === "exit") {
          console.log("Goodbye!")
          process.exit(0)
        }

        console.log(`You entered: ${input}`)
      } catch (err: any) {
        if (err?.code === "ERR_USE_AFTER_CLOSE" || shouldExit) {
          console.log("\nShutting down gracefully...")
          console.log("Goodbye!")
          process.exit(0)
        }
        throw err
      }
    }
  }
}
