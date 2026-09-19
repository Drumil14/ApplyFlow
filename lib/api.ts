/**
 * Thin JSON fetch helper shared by every data hook.
 *
 * Centralizes the two things every request needs: JSON headers on writes, and
 * turning a non-2xx response into a thrown Error carrying the server's message
 * (so TanStack Query's `error` and our toasts show something useful).
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body != null;
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers
    }
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? "Something went wrong. Please try again.");
  }
  return data as T;
}
