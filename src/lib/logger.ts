import { randomUUID } from 'crypto'

export type LogLevel = 'info' | 'warn' | 'error'

export function createRouteLogger(route: string) {
  const reqId = randomUUID()
  const base = { route, reqId, ts: new Date().toISOString() }

  function log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const payload = { level, message, ...base, ...(meta || {}) }
    const line = JSON.stringify(payload)
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.info(line)
  }

  return {
    reqId,
    info: (message: string, meta?: Record<string, any>) => log('info', message, meta),
    warn: (message: string, meta?: Record<string, any>) => log('warn', message, meta),
    error: (message: string, meta?: Record<string, any>) => log('error', message, meta),
  }
}

