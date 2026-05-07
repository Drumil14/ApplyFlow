export function serializeDates<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
