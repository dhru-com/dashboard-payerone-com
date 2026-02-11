"use server"

import { apiFetch } from "./api-client";
import { ApiResponse } from "@/types/auth";
import { SubscriptionResponse, InvoiceRequest, InvoicePreviewData, InvoicePurchaseData, InvoiceV2, InvoiceDetailsV2 } from "@/types/subscription";

export async function getSubscriptionData() {
  try {
    const result = await apiFetch<ApiResponse<SubscriptionResponse>>("packages_v2", {
      cache: 'no-store',
    });
    if (result && result.status === "success") {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return null;
  }
}

export async function purchaseSubscription(planId: string, period: 'monthly' | 'annually') {
  try {
    const result = await apiFetch<ApiResponse<InvoicePurchaseData>>("invoices_v2", {
      method: "POST",
      body: JSON.stringify({
        preview: false,
        order_type: "SUBSCRIPTION",
        product_id: planId,
        billing_cycle: period,
        auto_renew: true
      }),
    });
    return result;
  } catch (error) {
    console.error("Error purchasing subscription:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to purchase subscription",
      code: 500,
      data: null
    } as ApiResponse<unknown>;
  }
}

export async function createInvoice(params: InvoiceRequest) {
  try {
    const result = await apiFetch<ApiResponse<InvoicePreviewData | InvoicePurchaseData>>("invoices_v2", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return result;
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to process request",
      code: 500,
      data: null
    } as ApiResponse<unknown>;
  }
}

export async function updateSubscription(data: { auto_renew: boolean }) {
  try {
    const result = await apiFetch<ApiResponse<unknown>>("subscription_v2", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error("Error updating subscription:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to update subscription",
      code: 500,
      data: null
    } as ApiResponse<unknown>;
  }
}

export async function getInvoices() {
  try {
    const result = await apiFetch<ApiResponse<InvoiceV2[]>>("invoices_v2", {
      cache: 'no-store',
    });
    if (result && result.status === "success") {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

export async function getInvoiceDetails(uuid: string) {
  try {
    const result = await apiFetch<ApiResponse<InvoiceDetailsV2>>(`invoices_v2?uuid=${uuid}`, {
      cache: 'no-store',
    });
    return result;
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to fetch invoice details",
      code: 500,
      data: null
    } as unknown as ApiResponse<InvoiceDetailsV2>;
  }
}
