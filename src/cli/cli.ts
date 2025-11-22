import { prompt } from "enquirer"

export default class Cli {
  config: Record<string, any>

  constructor(config: any) {
    this.config = config
  }

  async startShell() {
    console.log("Codag shell. Type 'exit' to quit.\n")
    console.log(this.config)

    while (true) {
      try {
        const { command } = await prompt<{ command: string }>({
          type: "input",
          name: "command",
          message: "prompt: ",
        })

        const input = command.trim()

        if (input === "exit") {
          console.log("Goodbye!")
          process.exit(0)
        }

        // Instead of echo, you can put command parsing
        console.log(`You entered: ${input}`)
      } catch (err) {
        console.log("Shell exited.")
        process.exit(0)
      }
    }
  }
}
