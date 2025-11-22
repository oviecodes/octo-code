import { prompt } from "enquirer"
import EventEmitter from "events"

export default class Cli extends EventEmitter {
  config: Record<string, any>

  constructor(config: any) {
    super()
    this.config = config
  }

  async startShell() {
    console.log("OCTO shell. Type 'exit' to quit.\n")

    let shouldExit = false

    while (!shouldExit) {
      try {
        const { command } = await prompt<{ command: string }>({
          type: "input",
          name: "command",
          message: "prompt: ",
        })

        if (shouldExit) {
          console.log("\nQuitting OCTO...")
          process.exit(0)
        }

        const input = command.trim()

        if (input === "exit") {
          console.log("\nQuitting OCTO...")
          process.exit(0)
        }

        console.log(`You entered: ${input}`)
      } catch (err: any) {
        shouldExit = true
        if (shouldExit) {
          console.log("\nQuitting OCTO...")
          process.exit(0)
        }
        throw err
      }
    }
  }
}
