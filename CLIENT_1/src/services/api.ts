// client1/src/services/api.ts
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

type FetchOptions = RequestInit & { query?: Record<string,string|number> };

function buildUrl(path: string, query?: Record<string,string|number>) {
  const url = new URL(path, API_BASE);
  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { query, ...rest } = opts;
  const url = buildUrl(path, query);
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers || {}),
    },
    ...rest,
  });

  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error(`API error ${res.status}: ${txt}`);
  }
  return (await res.json()) as T;
}
export const api = { fetch: apiFetch };
