import Cli from "./src/cli/cli"
import userConfigs from "./src/helpers/userConfigs"

const shell = new Cli(userConfigs.getUserConfigs())

shell.startShell()
