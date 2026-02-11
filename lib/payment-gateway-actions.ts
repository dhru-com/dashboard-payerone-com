/**
 * @deprecated This file contains legacy Payment Gateway V1 actions.
 * All future development should use V2 actions in /lib/payment-gateway-v2-actions.ts
 */
"use server"

import { apiFetch } from "./api-client";
import { PaymentGatewayResponse, Visibility } from "@/types/payment-gateway";
import { revalidatePath } from "next/cache";

interface BasicApiResult {
  status: string;
  message?: string;
  code?: number;
  [key: string]: unknown;
}

export async function getPaymentGateways() {
  try {
    return await apiFetch<PaymentGatewayResponse>("payment_gateway");
  } catch (error) {
    console.error("Failed to fetch payment gateways:", error);
    return null;
  }
}

type GatewayPayload = { type: string; config: Record<string, unknown>; visibility?: Visibility }

export async function addPaymentGateway(payload: GatewayPayload) {
  try {
    const result = await apiFetch<BasicApiResult>("payment_gateway", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/payment-gateways");
    }

    return result;
  } catch (error) {
    console.error("Failed to add payment gateway:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to add payment gateway",
    };
  }
}

export async function updatePaymentGateway(uuid: string, payload: GatewayPayload) {
  try {
    const result = await apiFetch<BasicApiResult>("payment_gateway", {
      method: "PUT",
      body: JSON.stringify({
        id: uuid,
        ...payload
      }),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/payment-gateways");
    }

    return result;
  } catch (error) {
    console.error("Failed to update payment gateway:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to update payment gateway",
    };
  }
}

export async function deletePaymentGateway(uuid: string) {
  try {
    const result = await apiFetch<BasicApiResult>("payment_gateway", {
      method: "DELETE",
      body: JSON.stringify({ id: uuid }),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/payment-gateways");
    }

    return result;
  } catch (error) {
    console.error("Failed to delete payment gateway:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to delete payment gateway",
    };
  }
}
