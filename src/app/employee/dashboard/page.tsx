"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await api.post("/auth/logout");
    router.push("/employee/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">
          Dashboard — coming soon
        </h1>
        <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
          Logout
        </Button>
      </div>
    </div>
  );
}
