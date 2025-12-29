"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {

    localStorage.clear();

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">
        Logging out...
      </h1>
    </div>
  );
}
