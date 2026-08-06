"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { FirebaseMissing } from "@/components/ui/FirebaseMissing";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/login");
    }
  }, [user, loading, configured, router]);

  if (!configured) return <FirebaseMissing />;
  if (loading) {
    return (
      <div className="center-screen">
        <p>Loading…</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="center-screen">
        <p>Redirecting to login…</p>
      </div>
    );
  }

  return <>{children}</>;
}
