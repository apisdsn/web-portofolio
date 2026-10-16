'use client';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  formData?: FormData;
}

/** Calls the Spring Boot API through the same origin, with the session cookie and CSRF header. */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'X-Requested-With': 'portfolio-admin' };
  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    headers,
    body,
    credentials: 'same-origin',
    cache: 'no-store',
  });

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    window.location.href = '/admin/login';
    throw new ApiError('Session expired', 401);
  }

  if (!res.ok) {
    let data: { detail?: string; error?: string; errors?: Record<string, string> } = {};
    try {
      data = await res.json();
    } catch {
      // Non-JSON error body
    }
    throw new ApiError(data.detail || data.error || `Request failed (${res.status})`, res.status, data.errors);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
