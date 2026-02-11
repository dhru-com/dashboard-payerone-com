"use server"

import { apiFetch } from "./api-client";
import { ApiResponse } from "@/types/auth";
import { getSession } from "./auth-actions";

export interface BrandingData {
  icon: string;
  logo: string;
  brand_colour: string;
  accent_colour: string;
}

export async function getBranding() {
  const result = await apiFetch<ApiResponse<BrandingData>>("branding", {
    cache: 'no-store',
  });
  return result;
}

export async function updateBranding(data: BrandingData) {
  const result = await apiFetch<ApiResponse<unknown>>("branding", {
    method: "PUT",
    body: JSON.stringify({ branding: data }),
  });
  return result;
}

export interface UploadUrlResponse {
  upload_url: string;
  download_url: string;
  file_name: string;
  original_file_name: string;
}

export async function getUploadUrl(fileName: string, fileType: string) {
  try {
    const token = await getSession();

    const gatewayUrl = 'https://apigateway.dhru.com/v1/getuploadurl';
    const queryParams = new URLSearchParams({
      file_name: fileName,
      file_type: fileType
    });

    const response = await fetch(`${gatewayUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get upload URL:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get upload URL"
    };
  }
}
