export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      message: "An error occurred",
    }))) as { message?: string };
    throw new Error(error.message || response.statusText);
  }

  return response.json() as Promise<T>;
}