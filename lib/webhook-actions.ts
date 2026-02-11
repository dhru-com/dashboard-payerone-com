"use server"

import { apiFetch } from "./api-client";
import { ApiResponse } from "@/types/auth";
import {
  Webhook,
  WebhookResponse,
  CreateWebhookPayload,
  UpdateWebhookPayload,
  TestWebhookResponse
} from "@/types/webhook";
import { revalidatePath } from "next/cache";

const WEBHOOKS_ENDPOINT = "webhooks";

export async function getWebhooks() {
  try {
    const result = await apiFetch<ApiResponse<WebhookResponse>>(WEBHOOKS_ENDPOINT, {
      cache: 'no-store',
    });

    if (result && result.status === "success" && result.data) {
      // The API returns an object with UUIDs as keys
      return Object.values(result.data);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch webhooks:", error);
    return [];
  }
}

export async function createWebhook(payload: CreateWebhookPayload) {
  try {
    const result = await apiFetch<ApiResponse<Webhook>>(WEBHOOKS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result && result.status === "success") {
      revalidatePath("/developer/webhooks");
      return { success: true, data: result.data };
    }
    return { success: false, message: result?.message || "Failed to create webhook" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

export async function updateWebhook(uuid: string, payload: UpdateWebhookPayload) {
  try {
    const result = await apiFetch<ApiResponse<Webhook>>(`${WEBHOOKS_ENDPOINT}?uuid=${uuid}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (result && result.status === "success") {
      revalidatePath("/developer/webhooks");
      return { success: true, data: result.data };
    }
    return { success: false, message: result?.message || "Failed to update webhook" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

export async function deleteWebhook(uuid: string) {
  try {
    const result = await apiFetch<ApiResponse<unknown>>(`${WEBHOOKS_ENDPOINT}?uuid=${uuid}`, {
      method: "DELETE",
    });

    if (result && result.status === "success") {
      revalidatePath("/developer/webhooks");
      return { success: true };
    }
    return { success: false, message: result?.message || "Failed to delete webhook" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

export async function testWebhook(uuid: string) {
  try {
    const result = await apiFetch<ApiResponse<TestWebhookResponse>>(`${WEBHOOKS_ENDPOINT}?action=test&uuid=${uuid}`, {
      method: "GET",
    });

    if (result && result.status === "success") {
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result?.message || "Failed to test webhook" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}
