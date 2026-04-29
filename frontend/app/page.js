"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import {
  MapPin,
  Wifi,
  Zap,
  Ear,
  Shield,
  Users,
  UserPlus,
  Image as ImageIcon,
  Phone,
  AlertTriangle,
  ShieldAlert,
  HeartHandshake,
  CheckCircle,
  LogIn,
  Hourglass,
  Siren, Radio,ShieldCheck ,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getGuestId } from "@/lib/actions";
import { socket } from "@/lib/socket";
import SOSLivePanel from "@/components/SOSLivePanel";
import MapWrapper from "@/components/MapWrapper";
import { useInfo } from "@/contexts/InfoContext";
import useSuspendedRedirect from "@/hooks/useSuspendedRedirect";
import useAdminRedirect from "@/hooks/useAdminRedirect";
import { sendLocation } from "@/lib/location";

export default function Home() {
  const { user, token } = useUser();
  const { info, refresh, loading } = useInfo();
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  useSuspendedRedirect();
  useAdminRedirect();
  const isSOS = !!info?.activeSOS;

  let mapVolunteers = [];
  let victimLocation = null;
  useEffect(() => {
    if (token) {
      sendLocation(token);
    }
  }, [token]);
  if (isSOS) {
    if (info.activeSOS.role === "sender") {
      // YOU are victim → show volunteers
      mapVolunteers = info.activeSOS.volunteers || [];
    } else if (info.activeSOS.role === "volunteer") {
      // YOU are helper ->show victim
      victimLocation = info.activeSOS.victim?.location;
    }
  }

  // Register user socket
  useEffect(() => {
    if (user) {
      socket.emit("register", user.userId);
    }
  }, [user]);
  useEffect(() => {
    getLocation()
      .then((loc) => setCurrentLocation(loc))
      .catch(() => toast.error("Location permission denied"));
  }, []);
  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => reject("Location permission denied"),
      );
    });
  };

  const handleSOS = async () => {
    if (cooldown > 0) {
      return toast.error(`Wait ${cooldown}s before next SOS`);
    }

    try {
      const location = await getLocation();
      setCurrentLocation(location);
      const endpoint = token ? "/api/sos/trigger" : "/api/sos/guest";

      const guestId = !token ? getGuestId() : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(guestId && { "x-guest-id": guestId }), // IMPORTANT
        },
        body: JSON.stringify({ location }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("SOS sent 🚨");
        //FORCE UI UPDATE IMMEDIATELY
        window.dispatchEvent(new Event("sos-triggered"));
        await refresh();
        setCooldown(token ? 30 : 60);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Location required");
    }
  };

  const now = new Date();

  const isGuest = !info || !info.user;

  // SAFETY SCORE
  let safetyScore = isGuest ? 40 : 50;

  // TRUSTED CONTACTS
  const trustedCount = isGuest ? 0 : info.trustedContacts?.length || 0;

  //PROFILE + TRUST LOGIC (ONLY IF LOGGED IN)
  let validHistory = [];
  let recentSOS = [];
  let monthlySOS = [];

  if (!isGuest) {
    // Trusted contacts scoring
    if (trustedCount === 0) safetyScore -= 10;
    else if (trustedCount < 2) safetyScore += 5;
    else if (trustedCount < 5) safetyScore += 20;
    else safetyScore += 30;

    // Profile completeness
    if (info.user?.name) safetyScore += 3;
    if (info.user?.profilePic) safetyScore += 3;
    if (info.user?.econtact) safetyScore += 4;

    // SAFE DATE FILTERING
    validHistory = info.sosHistory?.filter((s) => s.createdAt) || [];

    //RECENT SOS (7 days)
    recentSOS = validHistory.filter(
      (s) => new Date(s.createdAt) > new Date(now - 7 * 86400000),
    );

    //MONTHLY SOS (30 days)
    monthlySOS = validHistory.filter(
      (s) => new Date(s.createdAt) > new Date(now - 30 * 86400000),
    );

    // SOS PENALTIES
    if (recentSOS.length > 0) {
      safetyScore -= Math.min(recentSOS.length * 5, 20);
    } else if (monthlySOS.length > 2) {
      safetyScore -= 10;
    }

    //ACTIVE SOS (ONLY IF USER IS VICTIM)
    if (info.activeSOS?.role === "sender") {
      safetyScore -= 30;
    }
  }

  //NORMALIZE → THEN CLAMP
  const MAX_SCORE = 95;
  safetyScore = Math.round((safetyScore / MAX_SCORE) * 100);
  safetyScore = Math.max(5, Math.min(100, safetyScore));

  // STATUS
  let status = isGuest ? "Guest Mode" : "Safe";
  let statusColor = isGuest ? "text-gray-500" : "text-green-500";

  if (!isGuest) {
    if (info.activeSOS?.role === "sender") {
      status = "In Danger";
      statusColor = "text-red-500";
    } else if (info.activeSOS?.role === "volunteer") {
      status = "Helping";
      statusColor = "text-blue-500";
    } else if (recentSOS.length > 0) {
      status = "Recent Alert";
      statusColor = "text-yellow-500";
    }
  }

  //LAST ALERT
  let lastAlert = isGuest ? "N/A" : "None";

  if (!isGuest && validHistory.length > 0) {
    const latest = validHistory.reduce((a, b) =>
      new Date(a.createdAt) > new Date(b.createdAt) ? a : b,
    );

    const diffMs = now - new Date(latest.createdAt);
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 60) lastAlert = `${diffMin} min ago`;
    else if (diffHr < 24) lastAlert = `${diffHr} hrs ago`;
    else lastAlert = `${diffDay} days ago`;
  }
  if (loading) {
    return <div className="min-h-screen p-6">Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-rose-100 flex">
      <div className="flex-1 p-6 md:p-10">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-pink-600">
            Your Personal Safety Companion
          </h1>
          <p className="text-gray-600 mt-2">
            Stay alert. Stay protected. You are never alone.
          </p>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Safety Score</p>
            <h2 className="text-xl font-bold text-pink-600">{safetyScore}%</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Trusted Contacts</p>
            <h2 className="text-xl font-bold text-pink-600">{trustedCount}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Status</p>
            <h2 className={`text-xl font-bold ${statusColor}`}>{status}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Last Alert</p>
            <h2 className="text-sm font-semibold text-gray-700">{lastAlert}</h2>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* SOS */}
            <div className="border-2 border-pink-200 rounded-3xl shadow-xl p-5 sm:p-10 flex flex-col items-center justify-center text-center">
              <button
                onClick={handleSOS}
                disabled={cooldown > 0}
                className={`
        relative flex items-center justify-center
        w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80
        rounded-full text-white font-bold text-4xl
        transition active:scale-95
        ${
          cooldown > 0
            ? "bg-gray-400"
            : "bg-gradient-to-br from-pink-500 to-red-600"
        }
      `}
              >
                {/* Glow ring */}
                {cooldown === 0 && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-pink-400 opacity-30"></span>
                )}

                <ShieldAlert className="absolute w-28 h-28 opacity-30" />

                <span className="z-10">
                  {cooldown > 0 ? `${cooldown}s` : "SOS"}
                </span>
              </button>

              <p className="mt-6 text-gray-600 text-sm max-w-xs">
                Tap immediately in case of danger 🚨
              </p>
            </div>

            {/* MAP SECTION */}
            <div className="border-2 border-pink-200 rounded-3xl shadow-xl p-6 ">
              <h2 className="text-lg font-semibold text-pink-600 mb-3 flex items-center gap-2">
                <MapPin className="w-6 h-6" /> <p>Live Location</p>
              </h2>

              <div className="w-full h-[300px] rounded-2xl overflow-hidden">
                <MapWrapper
                  userLocation={currentLocation}
                  isSOS={isSOS}
                  volunteers={mapVolunteers}
                  victimLocation={victimLocation}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/*IMPROVE SAFETY SCORE */}
            <div className="bg-pink-100 rounded-2xl shadow-md p-5">
              <h2 className="text-lg font-semibold text-pink-600 mb-3">
                Improve Your Safety Score
              </h2>

              <div className="grid grid-cols-1 gap-3 text-sm">
                {/*GUEST MODE */}
                {!info?.user && (
                  <div className="bg-white p-3 rounded-lg border border-gray-300 flex items-start gap-2">
                    <LogIn className="w-5 h-5 text-gray-500 mt-0.5" />
                    <p>
                      Increase your safety score by logging in and setting up
                      your profile
                    </p>
                  </div>
                )}

                {/*TRUSTED CONTACTS */}
                {info?.user && trustedCount < 2 && (
                  <div className="bg-white p-3 rounded-lg border border-pink-300 flex items-start gap-2">
                    <Users className="w-5 h-5 text-pink-500 mt-0.5" />
                    <p>Add at least 2 trusted contacts to boost your safety</p>
                  </div>
                )}

                {info?.user && trustedCount >= 2 && trustedCount < 5 && (
                  <div className="bg-white p-3 rounded-lg border border-pink-300 flex items-start gap-2">
                    <UserPlus className="w-5 h-5 text-pink-500 mt-0.5" />
                    <p>Add more contacts (5+) for maximum safety coverage</p>
                  </div>
                )}

                {/*PROFILE */}
                {info?.user && !info?.user?.profilePic && (
                  <div className="bg-white p-3 rounded-lg border border-pink-300 flex items-start gap-2">
                    <ImageIcon className="w-5 h-5 text-pink-500 mt-0.5" />
                    <p>Upload a profile picture for better identification</p>
                  </div>
                )}

                {info?.user && !info?.user?.econtact && (
                  <div className="bg-white p-3 rounded-lg border border-pink-300 flex items-start gap-2">
                    <Phone className="w-5 h-5 text-pink-500 mt-0.5" />
                    <p>Add an emergency contact number</p>
                  </div>
                )}

                {/*RECENT SOS */}
                {info?.user && recentSOS.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-yellow-300 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <p>
                      You had recent alerts , stay cautious and avoid risky
                      areas
                    </p>
                  </div>
                )}

                {/*ACTIVE SOS */}
                {info?.activeSOS?.role === "sender" && (
                  <div className="bg-red-100 p-3 rounded-lg border border-red-300 text-red-600 flex items-start gap-2">
                    <ShieldAlert className="w-5 h-5 mt-0.5" />
                    <p>You are currently in danger , help is on the way</p>
                  </div>
                )}

                {info?.activeSOS?.role === "volunteer" && (
                  <div className="bg-blue-100 p-3 rounded-lg border border-blue-300 text-blue-600 flex items-start gap-2">
                    <HeartHandshake className="w-5 h-5 mt-0.5" />
                    <p>You are helping someone , stay alert and safe</p>
                  </div>
                )}

                {/*PERFECT STATE */}
                {info?.user &&
                  trustedCount >= 5 &&
                  info?.user?.profilePic &&
                  info?.user?.econtact &&
                  recentSOS.length === 0 &&
                  !info?.activeSOS && (
                    <div className="bg-green-100 p-3 rounded-lg border border-green-300 text-green-600 flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 mt-0.5" />
                      <p>Your safety profile is strong. Keep it up</p>
                    </div>
                  )}
              </div>
            </div>

            {/*LOGIN CARD */}
            {!user && (
              <div className="bg-white rounded-2xl shadow-md border border-pink-200 p-5 text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Stay Safe with SheShield
                </h2>
                <p className="text-gray-600 mt-1">
                  Create an account to unlock all features.
                </p>
                <button
                  onClick={() => router.push("/register")}
                  className="mt-3 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
                >
                  Register Now
                </button>
              </div>
            )}

            {/*VOLUNTEER */}
            {user && user.userType === "user" && (
              <div className="bg-white rounded-2xl shadow-md border border-pink-200 p-5 text-center">
                <h2 className="text-lg font-semibold flex justify-center items-center gap-2">
                  <HeartHandshake className="text-pink-500" />
                  Become a Volunteer
                </h2>
                <p className="text-gray-600 mt-1">
                  Help others and make your community safer.
                </p>
                <button
                  onClick={() => router.push("/volunteer")}
                  className="mt-3 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
                >
                  Apply Now
                </button>
              </div>
            )}

            {/*PENDING */}
            {user && user.userType === "volunteer_pending" && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 text-center">
                <h2 className="text-lg flex justify-center items-center font-semibold text-yellow-700">
                  <Hourglass className="w-6 h-6 text-gray-500" /> <p> Under Review</p>
                </h2>
                <p className="text-gray-600 mt-1">
                  Your application is being verified.
                </p>
              </div>
            )}
            {/*SMART SAFETY INSIGHTS  */}
            <div className="bg-pink-100 rounded-3xl shadow-xl p-6">
              <h2 className="text-lg font-semibold text-pink-600 mb-4">
                Smart Safety Insights
              </h2>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex gap-3">
                  <MapPin className="text-pink-500 w-5 h-5 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Before You Move
                    </p>
                    <p>
                      Always check your route and avoid poorly lit or isolated
                      paths. Prefer main roads even if they take slightly
                      longer.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Wifi className="text-pink-500 w-5 h-5 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Stay Connected
                    </p>
                    <p>
                      Keep your location sharing enabled with trusted contacts,
                      especially during late hours or unfamiliar travel.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Zap className="text-pink-500 w-5 h-5 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      In Risk Situations
                    </p>
                    <p>
                      Don't wait for confirmation of danger — trigger SOS early.
                      Fast alerts increase response success significantly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Ear className="text-pink-500 w-5 h-5 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Situational Awareness
                    </p>
                    <p>
                      Avoid distractions like loud music or constant phone usage
                      in public spaces. Awareness is your first layer of safety.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Shield className="text-pink-500 w-5 h-5 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Defensive Readiness
                    </p>
                    <p>
                      Keep your phone easily accessible, not buried in a bag.
                      Seconds matter in emergency situations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 mt-8">
          {/*HOW IT WORKS */}
          <div className="bg-pink-100 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center text-pink-600 mb-3">
              How SheShield Works
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              SheShield provides real-time protection by instantly connecting
              you with trusted contacts and nearby responders using smart
              emergency technology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* STEP 1 */}
              <div className="bg-pink-500 text-white rounded-2xl p-5 shadow-lg">
    <Siren className="w-8 h-8 mb-3" />
    <span className="text-xs bg-white/20 px-2 py-1 rounded">
      One tap activation
    </span>
    <h3 className="text-lg font-bold mt-3">SOS Activation</h3>
    <p className="text-sm mt-2 opacity-90">
      Instantly trigger an emergency alert using the SOS button.
      Your location is captured immediately.
    </p>
  </div>

              {/* STEP 2 */}
              <div className="bg-purple-600 text-white rounded-2xl p-5 shadow-lg">
    <Radio className="w-8 h-8 mb-3" />
    <span className="text-xs bg-white/20 px-2 py-1 rounded">
      Live tracking
    </span>
    <h3 className="text-lg font-bold mt-3">Real-Time Monitoring</h3>
    <p className="text-sm mt-2 opacity-90">
      Your live location and activity are shared with trusted
      contacts for instant awareness.
    </p>
  </div>

              {/* STEP 3 */}
 <div className="bg-gray-600 text-white rounded-2xl p-5 shadow-lg">
    <Zap className="w-8 h-8 mb-3" />
    <span className="text-xs bg-white/20 px-2 py-1 rounded">
      Seconds, not minutes
    </span>
    <h3 className="text-lg font-bold mt-3">Rapid Response</h3>
    <p className="text-sm mt-2 opacity-90">
      Nearby volunteers and responders are alerted instantly with
      precise location data.
    </p>
  </div>

              {/* STEP 4 */}
              <div className="bg-indigo-600 text-white rounded-2xl p-5 shadow-lg">
    <ShieldCheck className="w-8 h-8 mb-3" />
    <span className="text-xs bg-white/20 px-2 py-1 rounded">
      Auto recording
    </span>
    <h3 className="text-lg font-bold mt-3">Complete Protection</h3>
    <p className="text-sm mt-2 opacity-90">
      All events are logged securely, ensuring evidence and
      accountability during emergencies.
    </p>
  </div>
            </div>
          </div>
        </div>
      </div>
      <SOSLivePanel />
    </div>
  );
}
