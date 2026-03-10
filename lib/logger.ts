type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR"

function formatMessage(level: LogLevel, name: string, message: unknown): string {
  const now = new Date()
  const date = now.toISOString().replace("T", " ").slice(0, 23).replace(".", ",")
  const msg = message instanceof Error ? message.stack ?? message.message : String(message)
  return `${date} ${level.padEnd(5)} [${name}] - ${msg}`
}

export interface Logger {
  debug: (message: unknown) => void
  info:  (message: unknown) => void
  warn:  (message: unknown) => void
  error: (message: unknown) => void
}

export function createLogger(name: string): Logger {
  return {
    debug: (message: unknown) => console.debug(formatMessage("DEBUG", name, message)),
    info:  (message: unknown) => console.info(formatMessage("INFO",  name, message)),
    warn:  (message: unknown) => console.warn(formatMessage("WARN",  name, message)),
    error: (message: unknown) => console.error(formatMessage("ERROR", name, message)),
  }
}
