"use server"

import { apiFetch } from "./api-client";
import { PaymentGatewayV2Response, Router, GatewayInventoryItem } from "@/types/payment-gateway-v2";
import { revalidatePath } from "next/cache";

const ENDPOINT = "payment_gateways_v2";

export async function getPaymentGatewaysV2(module?: "inventory" | "routers") {
  try {
    const endpoint = module ? `${ENDPOINT}?module=${module}` : ENDPOINT;
    return await apiFetch<PaymentGatewayV2Response>(endpoint);
  } catch (error) {
    console.error(`Failed to fetch payment gateways V2 (${module || 'all'}):`, error);
    return null;
  }
}

export async function addGateway(payload: {
  uuid?: string;
  type: string;
  config: Record<string, unknown>;
  limits: {
    daily_amount_limit?: number;
    daily_order_limit?: number;
    monthly_amount_limit?: number;
  };
}) {
  try {
    const isUpdate = !!payload.uuid;
    const result = await apiFetch<{ status: string; message?: string }>(ENDPOINT, {
      method: isUpdate ? "PUT" : "POST",
      body: JSON.stringify(
        isUpdate
          ? {
              id: payload.uuid,
              update_type: "gateway",
              config: payload.config,
              limits: payload.limits,
            }
          : {
              action: "add_gateway",
              type: payload.type,
              config: payload.config,
              limits: payload.limits,
            }
      ),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/payment-gateways-v2");
    }

    return result;
  } catch (error) {
    console.error("Failed to add/update gateway:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to add/update gateway",
    };
  }
}

export async function addRouter(payload: Omit<Router, 'uuid'> & { uuid?: string }) {
  try {
    const isUpdate = !!payload.uuid;
    const { uuid, ...routerData } = payload;
    const result = await apiFetch<{ status: string; message?: string }>(ENDPOINT, {
      method: isUpdate ? "PUT" : "POST",
      body: JSON.stringify(
        isUpdate
          ? {
              id: uuid,
              update_type: "router",
              router: routerData,
            }
          : {
              action: "add_router",
              router: routerData,
            }
      ),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/payment-gateways-v2");
    }

    return result;
  } catch (error) {
    console.error("Failed to add/update router:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to add/update router",
    };
  }
}

export async function getCheckoutSimulator(token: string, amount: number, at: number) {
  try {
    const url = `checkout/v1/orders_v2?token=${token}&amount=${amount}&at=${at}`;
    return await apiFetch<Record<string, unknown>>(url);
  } catch (error) {
    console.error("Failed to fetch checkout simulator:", error);
    return null;
  }
}

export async function deleteGatewayV2(id: string) {
  try {
    const result = await apiFetch<{ status: string; message?: string }>(ENDPOINT, {
      method: "DELETE",
      body: JSON.stringify({
        delete_type: "gateway",
        id,
      }),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/payment-gateways-v2");
    }

    return result;
  } catch (error) {
    console.error("Failed to delete gateway:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to delete gateway",
    };
  }
}

export async function deleteRouterV2(id: string) {
  try {
    const result = await apiFetch<{ status: string; message?: string }>(ENDPOINT, {
      method: "DELETE",
      body: JSON.stringify({
        delete_type: "router",
        id,
      }),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/payment-gateways-v2");
    }

    return result;
  } catch (error) {
    console.error("Failed to delete router:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to delete router",
    };
  }
}
