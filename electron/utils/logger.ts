class Logger {
  private prefix: string = "[Logger]";

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  log(message: string) {
    console.log(`${this.prefix}: ${message}`);
  }

  info(message: string) {
    console.info(`${this.prefix}: ${message}`);
  }

  warn(message: string) {
    console.warn(`${this.prefix}: ${message}`);
  }

  debug(message: string) {
    console.debug(`${this.prefix}: ${message}`);
  }

  error(message: string) {
    console.error(`${this.prefix}: ${message}`);
  }
}

export default Logger;
