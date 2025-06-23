export interface FetchResult<T> {
  data?: T;
  error?: Error;
}

export async function fetchJSON<T>(input: RequestInfo, init?: RequestInit): Promise<FetchResult<T>> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      const text = await res.text();
      return { error: new Error(`${res.status}: ${text}`) };
    }
    return { data: (await res.json()) as T };
  } catch (err) {
    return { error: err as Error };
  }
}
