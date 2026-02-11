"use client"

import { useEffect } from "react";
import { AUTH_CONFIG } from "@/lib/auth-config";

export default function LoginPage() {
  useEffect(() => {
    const origin = window.location.origin;
    const qs = new URLSearchParams({
      client_id: AUTH_CONFIG.clientId,
      response_type: "redirect",
      redirect_uri: `${origin}/autho/`,
    });
    window.location.href = `${AUTH_CONFIG.ssoUrl}?${qs.toString()}`;
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting to SSO...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you to the login provider.</p>
      </div>
    </div>
  );
}
