export interface FetchResult<T> {
  data?: T;
  error?: Error;
}

interface FetchOptions extends RequestInit {
  next?: {
    revalidate?: number;
  };
}

export async function fetchData<T>(
  input: RequestInfo,
  init?: FetchOptions,
): Promise<FetchResult<T>> {
  const options: FetchOptions = {
    ...init,
    next: { revalidate: 60, ...(init?.next ?? {}) },
  };

  try {
    const res = await fetch(input, options);
    if (!res.ok) {
      const text = await res.text();
      return { error: new Error(`${res.status}: ${text}`) };
    }
    return { data: (await res.json()) as T };
  } catch (err) {
    return { error: err as Error };
  }
}
