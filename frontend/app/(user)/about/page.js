"use client";

import { Shield, Users, Bell, MapPin, Lock, HeartHandshake } from "lucide-react";
import Image from "next/image";

export default function page() {
  return (
    <div className="min-h-screen pt-12 px-4 bg-gradient-to-br from-pink-50 via-white to-rose-100">

      <div className="max-w-6xl mx-auto space-y-10">

        {/*  HERO */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-pink-600">
            About SheShield
          </h1>
          <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
            SheShield is a real-time personal safety platform designed to
            provide immediate assistance during emergencies by connecting users,
            trusted contacts, and nearby volunteers.
          </p>
        </div>

        {/*CORE IDEA */}
        <div className="bg-white rounded-3xl shadow-lg p-8 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-pink-600 mb-3">
              Why SheShield Exists
            </h2>
            <p className="text-gray-600 leading-relaxed">
              In critical moments, even a few seconds of delay can make a huge
              difference. SheShield was built to eliminate that delay by
              providing a single-tap emergency system that instantly alerts the
              right people with accurate location data.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-pink-500 flex items-center justify-center">
                        <Image
                          src="/Logo.png"
                          alt="SheShield Logo"
                          width={144}
                          height={144}
                          className="object-cover w-36 h-36"
                          priority
                        />
                      </div>
          </div>
        </div>

        {/*  FEATURES GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <Bell className="text-pink-500 mb-3" />
            <h3 className="font-semibold text-lg">Instant SOS Alerts</h3>
            <p className="text-sm text-gray-600 mt-2">
              Send emergency alerts instantly with a single tap. No delays, no
              complicated steps.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <MapPin className="text-pink-500 mb-3" />
            <h3 className="font-semibold text-lg">Live Location Sharing</h3>
            <p className="text-sm text-gray-600 mt-2">
              Your exact location is shared in real-time, ensuring responders
              can find you quickly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <Users className="text-pink-500 mb-3" />
            <h3 className="font-semibold text-lg">Trusted Contacts</h3>
            <p className="text-sm text-gray-600 mt-2">
              Notify your selected contacts via email so they are aware and can
              act immediately.
            </p>
          </div>

        </div>

        {/*HOW IT WORKS */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-pink-600 mb-6 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6 text-center">

            <div>
              <div className="text-pink-600 font-bold text-2xl mb-2">1</div>
              <p className="text-sm text-gray-600">
                User presses the SOS button
              </p>
            </div>

            <div>
              <div className="text-pink-600 font-bold text-2xl mb-2">2</div>
              <p className="text-sm text-gray-600">
                Location is captured instantly
              </p>
            </div>

            <div>
              <div className="text-pink-600 font-bold text-2xl mb-2">3</div>
              <p className="text-sm text-gray-600">
                Trusted contacts receive alerts
              </p>
            </div>

            <div>
              <div className="text-pink-600 font-bold text-2xl mb-2">4</div>
              <p className="text-sm text-gray-600">
                Volunteers nearby can respond
              </p>
            </div>

          </div>
        </div>

        {/*SECURITY */}
        <div className="bg-white rounded-3xl shadow-lg p-8 grid md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <Lock className="w-20 h-20 text-pink-500" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-pink-600 mb-3">
              Privacy & Security
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your safety data is handled securely. Personal information and
              location data are only shared during emergency situations and only
              with the people you trust. We prioritize minimal data exposure and
              maximum protection.
            </p>
          </div>
        </div>

        {/* COMMUNITY */}
        <div className="bg-pink-50 border border-pink-200 rounded-3xl p-8 text-center">
          <HeartHandshake className="mx-auto text-pink-500 mb-3" />
          <h2 className="text-xl font-semibold text-pink-700">
            Building a Safer Community
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto text-sm">
            SheShield is not just an app , it's a community-driven safety
            network. Volunteers and users work together to create a faster,
            more responsive emergency support system.
          </p>
        </div>

        {/* FOOTER NOTE */}
        <div className="text-center text-gray-500 text-xs pb-10">
          SheShield - Real-time safety when it matters most.
        </div>

      </div>
    </div>
  );
}
