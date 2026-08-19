export const API_BASE = process.env.NEXT_PUBLIC_SEPAH_API_URL ?? "http://localhost:5088/api";

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `خطای ارتباط با سرور (${response.status})`);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
