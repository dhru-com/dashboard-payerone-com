"use server"

import { apiFetch } from "./api-client";
import { ApiResponse } from "@/types/auth";
import { revalidatePath } from "next/cache";

export interface MerchantAddressPayload {
  type: string;
  address: string;
  networks: Record<string, string[]>;
  notes?: string;
  is_active?: number | boolean;
}

export async function addMerchantAddress(payload: MerchantAddressPayload) {
  try {
    const result = await apiFetch<ApiResponse<unknown>>("merchant_addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/receiving-wallet-address");
    }

    return result;
  } catch (error) {
    console.error("Failed to add merchant address:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to add merchant address",
    };
  }
}

export async function updateMerchantAddress(uuid: string, payload: MerchantAddressPayload) {
  try {
    const result = await apiFetch<ApiResponse<unknown>>(`merchant_addresses?uuid=${uuid}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/receiving-wallet-address");
    }

    return result;
  } catch (error) {
    console.error("Failed to update merchant address:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to update merchant address",
    };
  }
}

export async function deleteMerchantAddress(uuid: string) {
  try {
    const result = await apiFetch<ApiResponse<unknown>>(`merchant_addresses?uuid=${uuid}`, {
      method: "DELETE",
    });

    if (result && result.status === "success") {
      revalidatePath("/payments/receiving-wallet-address");
    }

    return result;
  } catch (error) {
    console.error("Failed to delete merchant address:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to delete merchant address",
    };
  }
}
