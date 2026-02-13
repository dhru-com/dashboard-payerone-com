"use server"

import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { apiFetch } from "./api-client";
import { ApiResponse, LoginInitResponse, MerchantApiKeyData, User, NotificationPreferences } from "@/types/auth";
import { cache } from "react";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_CONFIG.storageTokenKeyName);

  // Clear any chunked tokens
  const chunkCount = cookieStore.get(AUTH_CONFIG.chunkCountKeyName)?.value;
  if (chunkCount) {
    const count = parseInt(chunkCount, 10);
    for (let i = 0; i < count; i++) {
      cookieStore.delete(`${AUTH_CONFIG.chunkPrefix}${i}`);
    }
    cookieStore.delete(AUTH_CONFIG.chunkCountKeyName);
  }

  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.storageTokenKeyName)?.value;
  if (token) return token;

  // Check for chunked token
  const chunkCount = cookieStore.get(AUTH_CONFIG.chunkCountKeyName)?.value;
  if (chunkCount) {
    const count = parseInt(chunkCount, 10);
    let fullToken = "";
    for (let i = 0; i < count; i++) {
      const chunk = cookieStore.get(`${AUTH_CONFIG.chunkPrefix}${i}`)?.value;
      if (!chunk) return null; // Missing chunk
      fullToken += chunk;
    }
    return fullToken;
  }

  return null;
}

export async function getUserProfile() {
  const data = await getLoginInitData();
  return data?.profile || null;
}

export const getLoginInitData = cache(async () => {
  try {
    const result = await apiFetch<ApiResponse<LoginInitResponse>>(AUTH_CONFIG.meEndpoint, {
      cache: 'no-store',
    });
    if (result && result.status === "success") {
      return result.data;
    }
    console.warn(`[getLoginInitData] API returned non-success status: ${result?.status}`);
    return null;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof Error && (error.message.includes('Dynamic server usage') || error.message.includes('Network error'))) {
      throw error;
    }
    console.error("[getLoginInitData] Error fetching login init data:", error instanceof Error ? error.message : error);
    return null;
  }
});

export async function checkTelegramConnection() {
  try {
    const result = await apiFetch<ApiResponse<{ telegram_connected: boolean }>>("profile", {
      cache: 'no-store',
    });
    if (result && result.status === "success") {
      return result.data.telegram_connected === true;
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      throw error;
    }
    console.error("Failed to check telegram connection:", error);
  }
  return false;
}

export async function setApiBaseUrl(url: string | null) {
  const cookieStore = await cookies();
  if (!url) {
    cookieStore.delete(AUTH_CONFIG.apiBaseUrlCookieKey);
  } else {
    cookieStore.set(AUTH_CONFIG.apiBaseUrlCookieKey, url, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }
}

export async function getApiBaseUrlOverride() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_CONFIG.apiBaseUrlCookieKey)?.value || null;
}

export async function getMerchantApiKey(sandbox: boolean = false) {
  const endpoint = sandbox ? "merchant?sandbox=true" : "merchant";
  const result = await apiFetch<ApiResponse<MerchantApiKeyData>>(endpoint, {
    cache: 'no-store',
  });
  if (result && result.status === "success") {
    return result.data;
  }
  return null;
}

export async function disconnectTelegram() {
  const result = await apiFetch<ApiResponse<unknown>>("profile?disconnect_telegram=true", {
    method: "PUT",
  });
  return result;
}

export async function getNotificationPreferences() {
  const result = await apiFetch<ApiResponse<NotificationPreferences>>("notification_preferences", {
    cache: 'no-store',
  });
  return result;
}

export async function updateNotificationPreferences(preferences: unknown) {
  const result = await apiFetch<ApiResponse<NotificationPreferences>>("notification_preferences", {
    method: "PUT",
    body: JSON.stringify({ preferences }),
  });
  return result;
}

export async function updateProfile(profileData: Partial<User>) {
  const result = await apiFetch<ApiResponse<User>>("profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
  return result;
}
