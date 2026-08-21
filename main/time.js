/** ISO-8601 with milliseconds in UTC — the format every timestamp column holds. */
export function nowIso8601() {
  return new Date().toISOString()
}

/** `20250821-134500` in local time, used to name export files. */
export function localTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  )
}

export function exportFileName(date = new Date()) {
  return `ac-json-storage-${localTimestamp(date)}.json`
}
