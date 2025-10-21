export function formatTimestampShort(timestamp: string): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleString("en-US", options);
}

export function formatTimestampLong(timestamp: string): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleString("en-US", options);
}
