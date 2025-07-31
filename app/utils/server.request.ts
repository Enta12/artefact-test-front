export async function fetchWithAuth<T>(url: string, token: string): Promise<T> {
    const res = await fetch(url, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('API error');
    return res.json() as Promise<T>;
  }