"use server"

import { apiFetch } from "./api-client";
import { ApiResponse } from "@/types/auth";
import { revalidatePath } from "next/cache";
import { ForwardingAddress, ForwardingAddressPayload } from "@/types/forwarding-address";
import { ExpressWalletCustomer } from "@/types/express-wallet-customer";

export async function getForwardingAddresses() {
  try {
    const result = await apiFetch<ApiResponse<Record<string, ForwardingAddress>>>("forwarding_addresses", {
      cache: 'no-store',
    });
    
    if (result && result.status === "success") {
      return Object.values(result.data || {});
    }
  } catch (error) {
    console.error("Failed to fetch forwarding addresses:", error);
  }
  return [];
}

export async function addForwardingAddress(payload: ForwardingAddressPayload) {
  try {
    const result = await apiFetch<ApiResponse<unknown>>("forwarding_addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/express-wallet");
    }

    return result;
  } catch (error) {
    console.error("Failed to add forwarding address:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to add forwarding address",
    };
  }
}

export async function updateForwardingAddress(uuid: string, payload: ForwardingAddressPayload) {
  try {
    const result = await apiFetch<ApiResponse<unknown>>(`forwarding_addresses?uuid=${uuid}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/express-wallet");
    }

    return result;
  } catch (error) {
    console.error("Failed to update forwarding address:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to update forwarding address",
    };
  }
}

export async function deleteForwardingAddress(uuid: string) {
  try {
    const result = await apiFetch<ApiResponse<unknown>>(`forwarding_addresses?uuid=${uuid}`, {
      method: "DELETE",
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/express-wallet");
    }

    return result;
  } catch (error) {
    console.error("Failed to delete forwarding address:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to delete forwarding address",
    };
  }
}

export async function getExpressWalletCustomers(params: {
  page?: number;
  merchant_client_id?: string;
  merchant_client_email?: string;
  merchant_client_name?: string;
  receive_address?: string;
} = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", params.page.toString());
    if (params.merchant_client_id) queryParams.set("merchant_client_id", params.merchant_client_id);
    if (params.merchant_client_email) queryParams.set("merchant_client_email", params.merchant_client_email);
    if (params.merchant_client_name) queryParams.set("merchant_client_name", params.merchant_client_name);
    if (params.receive_address) queryParams.set("receive_address", params.receive_address);

    const result = await apiFetch<ApiResponse<ExpressWalletCustomer[]>>(`express_wallet_customers?${queryParams.toString()}`, {
      cache: 'no-store',
    });

    if (result && result.status === "success") {
      return {
        customers: result.data || [],
        pagination: result.info?.pagination
      };
    }
  } catch (error) {
    console.error("Failed to fetch express wallet customers:", error);
  }
  return {
    customers: [],
    pagination: undefined
  };
}
