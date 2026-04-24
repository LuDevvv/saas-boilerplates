import chalk from "chalk";

export const logger = {
  info: (msg: string) => console.log(chalk.blue("ℹ ") + msg),
  success: (msg: string) => console.log(chalk.green("✔ ") + chalk.bold(msg)),
  warn: (msg: string) => console.log(chalk.yellow("⚠ ") + msg),
  error: (msg: string, err?: any) => {
    console.error(chalk.red("✖ ") + chalk.bold(msg));
    if (err) console.error(err);
  },
  step: (msg: string) => console.log(chalk.cyan("➜ ") + msg),
};
