/** In-flight job deduplication per user (practice generation, etc.) */
const inFlight = new Map<string, Promise<unknown>>();

export function getInFlight<T>(key: string): Promise<T> | undefined {
  return inFlight.get(key) as Promise<T> | undefined;
}

export function setInFlight<T>(key: string, job: Promise<T>): Promise<T> {
  inFlight.set(key, job);
  job.finally(() => inFlight.delete(key));
  return job;
}

export function hasInFlight(key: string): boolean {
  return inFlight.has(key);
}
