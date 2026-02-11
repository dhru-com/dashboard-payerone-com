import "server-only";
import { AUTH_CONFIG } from "@/lib/auth-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * Gets the API base URL.
 * This function should only be called in a server context.
 */
async function getApiBaseUrl() {
  try {
    const cookieStore = await cookies();
    const override = cookieStore.get(AUTH_CONFIG.apiBaseUrlCookieKey)?.value;
    if (override) return override;
  } catch (e) {
    // Not in a server context or cookies not available
  }
  return AUTH_CONFIG.defaultApiBaseUrl;
}

/**
 * Server-side API fetcher that automatically includes the auth token from cookies.
 * MUST only be used in Server Components, Server Actions, or Route Handlers.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  let token = cookieStore.get(AUTH_CONFIG.storageTokenKeyName)?.value;

  // Reconstruct token if chunked
  if (!token) {
    const chunkCount = cookieStore.get(AUTH_CONFIG.chunkCountKeyName)?.value;
    if (chunkCount) {
      const count = parseInt(chunkCount, 10);
      let fullToken = "";
      for (let i = 0; i < count; i++) {
        const chunk = cookieStore.get(`${AUTH_CONFIG.chunkPrefix}${i}`)?.value;
        if (chunk) {
          fullToken += chunk;
        }
      }
      if (fullToken) {
        token = fullToken;
      }
    }
  }

  console.log(`[apiFetch] Requesting: ${endpoint}, Token present: ${!!token}${token ? ` (length: ${token.length})` : ''}`);

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");

  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`[apiFetch] Response from ${endpoint}: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`[apiFetch] 401 Unauthorized for ${endpoint}. Token might be invalid.`);
        redirect("/login?error=unauthorized");
      }

      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      console.error(`[apiFetch] Error for ${endpoint}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data && typeof data === 'object' && 'status' in data && data.status === 'error') {
      const errorObj = data as { message?: string; error?: string; msg?: string; code?: number };
      console.error(`[apiFetch] Logic error for ${endpoint}:`, JSON.stringify(errorObj));

      // Check if the error code indicates unauthorized or forbidden
      if (errorObj.code === 401 || errorObj.code === 403) {
        console.warn(`[apiFetch] ${errorObj.code} Unauthorized/Forbidden in response body for ${endpoint}.`);
        redirect("/login?error=unauthorized");
      }

      throw new Error(errorObj.message || errorObj.error || errorObj.msg || 'API logic error');
    }

    return data as T;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(`[apiFetch] Fetch failed for ${endpoint}:`, error instanceof Error ? error.message : error);
    throw error;
  }
}
