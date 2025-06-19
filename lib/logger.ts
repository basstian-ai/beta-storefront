export function logDebug(...args: unknown[]) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(...args);
  }
}

export function logError(...args: unknown[]) {
  console.error(...args);
}

