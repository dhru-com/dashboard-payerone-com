"use server"

import { apiFetch } from "./api-client";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ApiResponse } from "@/types/auth";
import { DashboardData, DashboardSummaryData } from "@/types/dashboard";
import { Order } from "@/components/orders-data-table";
import { Transaction } from "@/components/transactions-data-table";

export async function getDashboardData(date?: string, stats?: string[]) {
  try {
    let endpoint = "dashboard";
    const queryParts: string[] = [];

    if (date) {
      queryParts.push(`date=${date}`);
    }

    if (stats && stats.length > 0) {
      // Joining stats with commas, matching the format: stats=net_volume,gross_volume
      const statsValue = stats.join(",");
      queryParts.push(`stats=${statsValue}`);
    }

    if (queryParts.length > 0) {
      endpoint += `?${queryParts.join("&")}`;
    }

    const result = await apiFetch<ApiResponse<DashboardData>>(endpoint, {
      cache: 'no-store',
    });

    if (result && result.status === "success") {
      return result.data;
    }
    return null;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[getDashboardData] Error fetching dashboard data:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getDashboardSummary(date?: string) {
  try {
    let endpoint = "dashboard?module=summary";
    if (date) {
      endpoint += `&date=${date}`;
    }

    const result = await apiFetch<ApiResponse<DashboardSummaryData>>(endpoint, {
      cache: 'no-store',
    });

    if (result && result.status === "success") {
      return result.data;
    }
    return null;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[getDashboardSummary] Error fetching dashboard summary:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getRecentOrders() {
  try {
    const result = await apiFetch<ApiResponse<Order[]>>("orders?limit=10&status=Paid", {
      cache: 'no-store',
    });

    if (result && result.status === "success") {
      return {
        orders: result.data,
        pageCount: result.info?.pagination?.total_pages || 1
      };
    }
    return null;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[getRecentOrders] Error fetching orders:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getRecentTransactions() {
  try {
    const result = await apiFetch<ApiResponse<Transaction[]>>("transactions_v2?limit=10&status=Verified", {
      cache: 'no-store',
    });

    if (result && result.status === "success") {
      return {
        transactions: result.data,
        pageCount: result.info?.pagination?.total_pages || 1
      };
    }
    return null;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[getRecentTransactions] Error fetching transactions:", error instanceof Error ? error.message : error);
    return null;
  }
}
