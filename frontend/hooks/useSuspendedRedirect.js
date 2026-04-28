"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInfo } from "@/contexts/InfoContext";

export default function useSuspendedRedirect() {
  const { info, loading } = useInfo();
  const router = useRouter();

  useEffect(() => { 
    if (!loading && info?.user?.isSuspended) {
      router.replace("/suspended"); //better than push
    }
  }, [info, loading, router]);
}