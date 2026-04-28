"use client";

import { Shield, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "support@sheshield.com";
  return (
    <footer className="pt-16 bg-pink-200 border-t border-pink-200">
        <div className="border border-pink-300"></div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* BRAND */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="text-pink-600 w-6 h-6" />
            <h2 className="text-lg font-bold text-pink-600">SheShield</h2>
          </div>
          <p className="text-gray-600 text-sm">
            A real-time safety platform designed to provide immediate assistance,
            location tracking, and rapid response during emergencies.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Quick Access
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
  <li>
    <Link href="/" className="hover:text-pink-500 cursor-pointer block">
      Dashboard
    </Link>
  </li>

  <li>
    <Link href="/sos-history" className="hover:text-pink-500 cursor-pointer block">
      SOS History
    </Link>
  </li>

  <li>
    <Link href="/trusted-contacts" className="hover:text-pink-500 cursor-pointer block">
      Trusted Contacts
    </Link>
  </li>

  <li>
    <Link href="/about" className="hover:text-pink-500 cursor-pointer block">
      About Us
    </Link>
  </li> 
  <li>
    <Link href="/profile" className="hover:text-pink-500 cursor-pointer block">
      Profile
    </Link>
  </li>
</ul>
        </div>

        {/* CONTACT / SUPPORT */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Support
          </h3>
          <div className="space-y-2 text-sm text-gray-600">

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-pink-500" />
              <span>Emergency: 112</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-pink-500" />
              <span>{email}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pink-500" />
              <span>India</span>
            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-pink-100 text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} SheShield. All rights reserved.
      </div>
    </footer>
  );
}