"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { Phone } from "lucide-react";
import { useInfo } from "@/contexts/InfoContext";

export default function SOSLivePanel() {
  const { user, token } = useUser();
  const { refresh } = useInfo();
  const callingRef = useRef(false);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [justTriggered, setJustTriggered] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const fetchSOS = async () => {
    try {
      const guestId = !token ? localStorage.getItem("guestId") : null;

      const endpoint = token ? "/api/sos/active" : "/api/sos/guest-active";

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}${endpoint}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(guestId && { "x-guest-id": guestId }),
        },
      });

      const data = await res.json();

      if (data.success) {
        setActiveSOS(data.sos); // ALWAYS update (even null)
        setVolunteers(data.sos?.volunteers || []);
        if (data.sos) {
          setJustTriggered(false);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchSOS();
  }, [token]);

  //RECEIVE SOS (VOLUNTEER SIDE)
  useEffect(() => {
    if (!token) return;
    socket.on("sos-alert", (data) => {
      setTimeout(fetchSOS, 300);
      toast.custom(
        (t) => (
          <div className="p-3 bg-white shadow-lg rounded mt-5 ">
            <p className="font-semibold text-red-600">{data.message}</p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  acceptSOS(data.sosId);
                  toast.dismiss(t.id);
                }}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Accept
              </button>

              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-red-400 text-white px-3 py-1 rounded"
              >
                Decline
              </button>
            </div>
          </div>
        ),
        {
          duration: 300000, // 5 minutes
        },
      );
    });

    return () => socket.off("sos-alert");
  }, [token]);

  // immediately fetch after trigger
  useEffect(() => {
    const handleTrigger = async () => {
  setJustTriggered(true);

  let tries = 0;

  const interval = setInterval(async () => {
    tries++;

    const guestId = !token ? localStorage.getItem("guestId") : null;

    const endpoint = token ? "/api/sos/active" : "/api/sos/guest-active";
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}${endpoint}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(guestId && { "x-guest-id": guestId }),
      },
    });

    const data = await res.json();
    if (data.success && data.sos) {
      setActiveSOS(data.sos);
      setVolunteers(data.sos.volunteers || []);
      setJustTriggered(false);

      clearInterval(interval);
    }

    // stop after ~5 sec
    if (tries > 10) {
      clearInterval(interval);
    }

  }, 500); // every 0.5 sec
};

    window.addEventListener("sos-triggered", handleTrigger);

    return () => window.removeEventListener("sos-triggered", handleTrigger);
  }, [token]);
  // ACCEPTED EVENT
  useEffect(() => {
    const handleAccepted = (data) => {
      if (activeSOS?.sosId === data.sosId) {
        setVolunteers((prev) => {
          const exists = prev.some((v) => v._id === data.volunteer._id);
          if (exists) return prev;
          return [...prev, data.volunteer];
        });
        setTimeout(fetchSOS, 300);
      }
    };

    socket.on("sos-accepted", handleAccepted);

    return () => socket.off("sos-accepted", handleAccepted);
  }, [activeSOS]);
  //RESOLVED EVENT
  useEffect(() => {
    socket.on("sos-resolved", (data) => {
      if (activeSOS?.sosId === data.sosId) {
        setActiveSOS(null); //instant clear
        setVolunteers([]);
        setTimeout(fetchSOS, 300);

        setJustTriggered(false);
        toast.success("SOS Resolved ✅");
      }
    });

    return () => socket.off("sos-resolved");
  }, [activeSOS]);

  //ACCEPT SOS
  const acceptSOS = async (sosId) => {
    if (!token) {
      toast.error("Not authenticated yet");
      return;
    }
    if (loadingAccept) return;
    setLoadingAccept(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/sos/accept/${sosId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Accepted SOS 🚨");
        setTimeout(fetchSOS, 300);
        await refresh();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingAccept(false);
    }
  };

  //RESOLVE SOS (USER SIDE)
  const resolveSOS = async () => {
    try {
      const endpoint = token
        ? `/api/sos/resolve/${activeSOS.sosId}`
        : `/api/sos/guest-resolve`;

      const guestId = !token ? localStorage.getItem("guestId") : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}${endpoint}`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(guestId && { "x-guest-id": guestId }),
        },
      });

      const data = await res.json();

      if (data.success) {
        // 🔥 instant UI update
        setActiveSOS(null);
        setVolunteers([]);
        setJustTriggered(false);
        await refresh();
        // small delay for backend sync
        setTimeout(fetchSOS, 300);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setShowResolveModal(false);
    }
  };

  // 📍 OPEN MAP (GOOGLE MAPS)
  const openMap = () => {
    if (!activeSOS?.location) return;

    const { lng, lat } = activeSOS.location;

    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };
  const formatPhone = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    return phone.startsWith("+") ? cleaned : "+" + cleaned;
  };

  const callPeople = (phone) => {
    if (!phone || phone === "Not available") {
      toast.error("Phone number not available");
      return;
    }
    if (callingRef.current) return; // 🚫 prevent spam
    callingRef.current = true;

    window.location.href = `tel:${formatPhone(phone)}`;

    setTimeout(() => {
      callingRef.current = false;
    }, 2000);
  };

  if (!activeSOS && !justTriggered) return null;

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-white shadow-xl rounded-xl p-4 border border-pink-400 z-50">
      <h2 className="font-bold text-red-600">🚨 Emergency Active</h2>

      {/* VOLUNTEER VIEW */}
      {activeSOS?.role === "accepted" && (
        <>
          {/* SENDER INFO */}
          <div className="flex items-center gap-3 mt-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
            <img
              src={activeSOS.senderPic || "/default.png"}
              className="w-10 h-10 rounded-full object-cover"
              alt="sender"
            />

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {activeSOS.senderName}
              </p>
              <p className="text-xs text-gray-500">SOS Sender</p>
            </div>
          </div>

          {/* NAVIGATION */}
          <p className="text-sm mt-3">Navigate to victim:</p>

          <div className="flex justify-between items-center">
            <button
              onClick={openMap}
              className="bg-blue-600 text-white px-3 py-2 mt-2 rounded w-fit"
            >
              Open Map
            </button>

            {activeSOS.econtact && (
              <button
                onClick={() => callPeople(activeSOS.econtact)}
                className="bg-green-500 text-white p-2 rounded-full"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
          </div>
        </>
      )}

      {/* USER VIEW */}
      {(activeSOS?.role === "sender" || justTriggered) && (
        <>
          <p className="text-sm mt-2">Looking for nearby volunteers...</p>

          {volunteers.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Volunteers responding:</p>

              <div className="flex flex-col gap-2 mt-2">
                {volunteers.map((v, i) => (
                  <div key={v._id} className="flex justify-between w-full ">
                    <div className="flex justifiy-center items-center gap-2">
                      <img
                        key={i}
                        src={v.profilePic || "/default.png"}
                        className="w-8 h-8 rounded-full"
                      />
                      <p>{v.name}</p>
                    </div>
                    {/* calll */}
                    <button
                      onClick={() => callPeople(v.econtact)}
                      className="bg-green-500 text-white p-2 rounded-full"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowResolveModal(true)}
            className="bg-green-600 text-white px-3 py-2 mt-4 rounded w-full"
          >
            Resolve
          </button>
        </>
      )}
      {showResolveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl p-5 w-80 shadow-xl">
            <h3 className="text-lg font-semibold text-red-600">
              Resolve Emergency?
            </h3>

            <p className="text-sm mt-2 text-gray-600">
              Are you sure you want to mark this SOS as resolved?
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1 rounded bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={resolveSOS}
                className="px-3 py-1 rounded bg-green-600 text-white active:bg-green-500"
              >
                Yes, Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
