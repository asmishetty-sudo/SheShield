"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, LogIn, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Image from "next/image";
import Link from "next/link";
import { useInfo } from "@/contexts/InfoContext";

export default function Navbar() {
  const { user, logout } = useUser();
  const { info } = useInfo();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  let profileImg =
    info?.user.profilePic && info.user.profilePic.trim() !== ""
      ? info.user.profilePic
      : "/default.png";

  const isAdmin = user?.userType === "admin";
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md shadow-md border-b border-pink-200 fixed top-0 left-0 z-100">
      <div className="px-4 py-3 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-pink-500 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="SheShield Logo"
              width={40}
              height={40}
              className="object-cover w-10 h-10"
              priority
            />
          </div>

          <span className="font-bold text-xl md:text-2xl text-pink-600">
            SheShield
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="flex items-center gap-1 sm:gap-3 md:gap-6">
          {user && !isAdmin && (
            <button
              onClick={() => router.push("/trusted-contacts")}
              className="text-gray-700 hover:text-pink-600 font-medium transition hidden md:block"
            >
              Trusted Contacts
            </button>
          )}
          {!isAdmin && (
            <button
              onClick={() => router.push("/about")}
              className="text-gray-700 hover:text-pink-600 font-medium transition hidden md:block"
            >
              About Us
            </button>
          )}
          {user && !isAdmin && (
            <button
              onClick={() => router.push("/sos-history")}
              className="text-gray-700 hover:text-pink-600 font-medium transition hidden md:block"
            >
              SOS History
            </button>
          )}
          {user && isAdmin && (
            <>
              <button
                onClick={() => router.push("/admin/users")}
                className="text-gray-700 hover:text-pink-600 hover:scale-105 font-medium transition hidden md:block"
              >
                Manage Users
              </button>

              <button
                onClick={() => router.push("/admin/volunteers")}
                className="text-gray-700 hover:text-pink-600 hover:scale-105 font-medium transition hidden md:block"
              >
                Manage Volunteers
              </button>

              <button
                onClick={() => router.push("/admin/sos")}
                className="text-gray-700 hover:text-pink-600 hover:scale-105 font-medium transition hidden md:block"
              >
                Manage SOS
              </button>
            </>
          )}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {!isAdmin && (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:opacity-80 transition"
                >
                  {/* PROFILE IMAGE */}
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-400">
                    <Image
                      src={profileImg}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="object-cover h-8 w-8"
                    />
                  </div>

                  {/* NAME (hidden on small screens) */}
                  <span className="font-medium hidden md:block">
                    {user.name}
                  </span>
                </Link>
              )}
              {isAdmin && (
                <Link  href="/admin" className="font-medium hidden md:block">
                    {user.name}
                  </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-1 rounded-lg text-sm"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          )}
          <div className="md:hidden relative" ref={menuRef}>
            {/* BUTTON */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1 sm:p-2 rounded-full hover:bg-pink-100 transition"
            >
              <MoreVertical className="text-pink-600 w-5 h-5" />
            </button>

            {/* DROPDOWN */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-pink-200 rounded-xl shadow-xl overflow-hidden animate-fadeIn z-50">
                {user && !isAdmin && (
                  <button
                    onClick={() => {
                      router.push("/trusted-contacts");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-pink-50 transition"
                  >
                    Trusted Contacts
                  </button>
                )}
                {!isAdmin && (
                  <button
                    onClick={() => {
                      router.push("/about");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-pink-50 transition"
                  >
                    About Us
                  </button>
                )}

                {user && !isAdmin && (
                  <button
                    onClick={() => {
                      router.push("/sos-history");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-pink-50 transition"
                  >
                    SOS History
                  </button>
                )}
                {user && isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        router.push("/admin/users");
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-pink-50 transition"
                    >
                      Manage Users
                    </button>

                    <button
                      onClick={() => {
                        router.push("/admin/volunteers");
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-pink-50 transition"
                    >
                      Manage Volunteers
                    </button>

                    <button
                      onClick={() => {
                        router.push("/admin/sos");
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-pink-50 transition"
                    >
                      Manage SOS
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
