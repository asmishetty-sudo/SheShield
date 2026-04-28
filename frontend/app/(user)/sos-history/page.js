"use client";

import { useInfo } from "@/contexts/InfoContext";
import useSuspendedRedirect from "@/hooks/useSuspendedRedirect";
import { ShieldAlert, Users, MapPin, Clock, CheckCircle } from "lucide-react";

export default function SOSHistoryPage() {
  const { info, loading } = useInfo();
useSuspendedRedirect();
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-rose-100 p-6 md:p-10">
        Loading history...
      </div>
    );
  }

  const sentSOS = info?.sentSOS || [];
  const acceptedSOS = info?.acceptedSOS || [];
  const openMap = (coords) => {
    if (!coords) return;

    const [lng, lat] = coords;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-rose-100 p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-pink-600 text-center">
          SOS History
        </h1>
        <p className="text-gray-600 mt-2 text-center">
          Track your alerts and your impact in helping others.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/*SENT SOS */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-pink-600 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Your Alerts
          </h2>

          {sentSOS.length === 0 ? (
            <div className="text-sm text-gray-600 space-y-3">
              <p>You haven't triggered any SOS alerts yet.</p>
              <p>
                If you ever feel unsafe, tap the SOS button to instantly notify
                your trusted contacts and nearby volunteers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentSOS.map((sos, i) => (
                <div key={i} className="border border-pink-300 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {sos.sentAt}
                    </span>

                    {sos.resolvedWithin !== "Not resolved" ? (
                      <span className="text-green-600 text-xs flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Resolved in {sos.resolvedWithin}
                      </span>
                    ) : (
                      <span className="text-red-500 text-xs">Active</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-500" />
                    Volunteers:{" "}
                    {sos.volunteers.length > 0
                      ? sos.volunteers.join(", ")
                      : "None"}
                  </p>

                  {sos.location ? (
                    <p
                      onClick={() => openMap(sos.location)}
                      className="text-xs text-blue-500 flex items-center gap-1 mt-1 cursor-pointer hover:underline"
                    >
                      <MapPin className="w-4 h-4" />
                      View Location
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      Location not available
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/*HELPED SOS */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Helped Alerts
          </h2>

          {acceptedSOS.length === 0 ? (
            <div className="text-sm text-gray-600 space-y-3">
              <p>You haven’t helped anyone yet.</p>
              <p>
                Become a volunteer and assist people in emergency situations.
                Your actions can make a real difference.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {acceptedSOS.map((sos, i) => (
                <div key={i} className="border border-pink-300 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {sos.sentAt}
                    </span>

                    {sos.resolvedWithin !== "Not resolved" ? (
                      <span className="text-green-600 text-xs flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Resolved in {sos.resolvedWithin}
                      </span>
                    ) : (
                      <span className="text-red-500 text-xs">Active</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700">
                    Helped: <span className="font-semibold">{sos.victim}</span>
                  </p>

                  {sos.location ? (
                    <p
                      onClick={() => openMap(sos.location)}
                      className="text-xs text-blue-500 flex items-center gap-1 mt-1 cursor-pointer hover:underline"
                    >
                      <MapPin className="w-4 h-4" />
                      View Location
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      Location not available
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/*EXTRA SECTION (FILLS EMPTY SPACE BEAUTIFULLY) */}
      <div className="mt-10 bg-pink-100 rounded-3xl shadow p-8">
        <h2 className="text-xl font-bold text-pink-600 mb-4 text-center">
          How SOS Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
          <div className="bg-white p-4 rounded-xl">
            <p className="font-semibold mb-1">1. Trigger Alert</p>
            <p>
              Tap the SOS button to instantly send your location to trusted
              contacts.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl">
            <p className="font-semibold mb-1">2. Real-Time Tracking</p>
            <p>
              Your movement is tracked live so responders know exactly where you
              are.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl">
            <p className="font-semibold mb-1">3. Get Help Fast</p>
            <p>
              Nearby volunteers are notified and can reach you quickly in case
              of emergency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
