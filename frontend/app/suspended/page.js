"use client";

import { useEffect } from "react";
import { useInfo } from "@/contexts/InfoContext";
import { useRouter } from "next/navigation";

export default function SuspendedPage() {
  const { info, loading } = useInfo();
  const router = useRouter();

  //Redirect if NOT suspended
  useEffect(() => {
    if (!loading && info?.user && !info.user.isSuspended) {
      router.push("/");
    }
  }, [info, loading, router]);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] bg-red-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg border border-red-200">
        
        {/* ICON */}
        <div className="text-5xl mb-4">🚫</div>

        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Account Suspended
        </h1>

        <p className="text-gray-600 mb-4">
          Your account has been suspended by the admin due to policy violations
          or suspicious activity.
        </p>

        <p className="text-gray-600 mb-6">
          If you believe this is a mistake, you can contact support below.
        </p>

        {/* CONTACT */}
        <a
          href={`mailto:${adminEmail}`}
          className="inline-block bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition"
        >
          Contact Support
        </a>

        {/* EMAIL TEXT */}
        <p className="mt-4 text-sm text-gray-500">
          Or email directly at{" "}
          <span className="font-semibold text-gray-700">
            {adminEmail}
          </span>
        </p>
      </div>
    </div>
  );
}