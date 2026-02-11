import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token") || searchParams.get("t");

  console.log(`[Autho Route] Token received: ${!!token}`);

  if (!token) {
    console.log(`[Autho Route] No token, redirecting to /login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log(`[Autho Route] Setting cookie ${AUTH_CONFIG.storageTokenKeyName} and redirecting to /`);
  
  // Create response
  const response = NextResponse.redirect(new URL("/", request.url));

  const cookieOptions = {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };

  // Check if token size is large and might need chunking
  // Standard limit is 4096 bytes including name and attributes.
  // We'll use a safe limit of 3800 bytes for the value.
  const CHUNK_SIZE = 3800;
  if (token.length > CHUNK_SIZE) {
    const chunks = Math.ceil(token.length / CHUNK_SIZE);
    console.log(`[Autho Route] Token size (${token.length}) exceeds chunk size, splitting into ${chunks} chunks`);
    
    for (let i = 0; i < chunks; i++) {
      const chunk = token.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      response.cookies.set(`${AUTH_CONFIG.chunkPrefix}${i}`, chunk, cookieOptions);
    }
    // Set a marker cookie to know how many chunks to look for
    response.cookies.set(AUTH_CONFIG.chunkCountKeyName, chunks.toString(), cookieOptions);
    // Also clear the main cookie just in case
    response.cookies.delete(AUTH_CONFIG.storageTokenKeyName);
  } else {
    response.cookies.set(AUTH_CONFIG.storageTokenKeyName, token, cookieOptions);
    // Clear any leftover chunks
    response.cookies.delete(AUTH_CONFIG.chunkCountKeyName);
  }

  return response;
}
