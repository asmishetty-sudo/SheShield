"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { useMemo, useState } from "react";
import { Search, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";

export default function AdminSOSPage() {
  const { sos } = useAdmin();

  const [search, setSearch] = useState("");
  const [selectedSOS, setSelectedSOS] = useState(null);

  //FILTER + SORT
  const filteredSOS = useMemo(() => {
    let list = sos.filter((s) =>
      s._id.toLowerCase().includes(search.toLowerCase()),
    );

    //PRIORITY SORT
    const priority = {
      escalated: 1,
      active: 2,
      accepted: 3,
      resolved: 4,
    };

    return list.sort((a, b) => priority[a.status] - priority[b.status]);
  }, [sos, search]);

  //TIME FORMAT
  const getResolvedTime = (created, resolved) => {
    if (!resolved) return "";

    const diff = new Date(resolved) - new Date(created);

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 60) return `${mins} mins`;
    if (hrs < 24) return `${hrs} hrs`;
    return `${days} days`;
  };

  // STATUS COLORS
  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return "bg-blue-100 text-blue-600";
      case "active":
        return "bg-red-100 text-red-600";
      case "escalated":
        return "bg-yellow-100 text-yellow-600";
      case "resolved":
        return "bg-green-100 text-green-600";
    }
  };
  const getBorderStyle = (status) => {
    if (status === "resolved") return "border-green-400";
    if (status === "accepted") return "border-yellow-400";
    return "border-red-400"; // active + escalated
  };

  return (
    <div className="p-6 md:p-10 space-y-6 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-red-500" />
        <h1 className="text-2xl font-bold text-red-600">
          SOS Monitoring Panel
        </h1>
      </div>
 
      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by SOS ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-red-300 focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredSOS.map((s) => (
          <div
            key={s._id}
            onClick={() => setSelectedSOS(s)}
            className={`bg-white rounded-xl shadow-md border-2 ${getBorderStyle(
              s.status,
            )} hover:shadow-lg cursor-pointer p-4 transition`}
          >
            <div className="flex justify-between items-start">
              {/* ID */}
              <p className="text-xs text-gray-500 mb-1">
                SOS ID:{" "}
                <span className="font-semibold">{s._id.toUpperCase()}</span>
              </p>

              {/* STATUS */}
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(
                  s.status,
                )}`}
              >
                {s.status.toUpperCase()}
              </span>
            </div>
            {/* USER */}
            <div className="mt-3 text-sm">
              <p className="font-medium">Sender: {s.userId?.name || "Guest"}</p>
              <p className="text-gray-500">{s.userId?.email}</p>
            </div>

            {/* VOLUNTEERS */}
            <div className="mt-2 text-xs text-gray-600">
              <p className="flex items-center gap-1">
                <Users size={14} /> Volunteers: {s.acceptedBy?.length || 0}
              </p>
            </div>

            {/* RESOLVED TIME */}
            {s.status === "resolved" && (
              <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                <CheckCircle size={14} />
                Resolved in {getResolvedTime(s.createdAt, s.resolvedAt)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {selectedSOS && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-xl font-bold text-red-600 mb-4">SOS Details</h2>

            {/* BASIC */}
            <p className="text-sm mb-2">
              <b>ID:</b> {selectedSOS._id.toUpperCase()}
            </p>

            <p className="text-sm mb-2">
              <b>Status:</b> {selectedSOS.status}
            </p>

            <p className="text-sm mb-2">
              <b>Created:</b>{" "}
              {new Date(selectedSOS.createdAt).toLocaleString([], {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short",
              })}
            </p>

            {/* SENDER */}
            <div className="mt-3">
              <h3 className="font-semibold">Sender</h3>
              <p>{selectedSOS.userId?.name || "Guest"}</p>
              <p className="text-gray-500 text-sm">
                {selectedSOS.userId?.email}
              </p>
              <p className="text-gray-500 text-sm">
                {selectedSOS.userId?.econtact}
              </p>
            </div>

            {/* RECEIVERS */}
            <div className="mt-3">
              <h3 className="font-semibold">Responders</h3>
              {selectedSOS.acceptedBy?.length === 0 ? (
                <p className="text-gray-500 text-sm">No responders yet</p>
              ) : (
                selectedSOS.acceptedBy.map((v) => (
                  <div key={v._id} className="text-sm border-b border-red-300 py-1">
                    <p>{v.name}</p>
                    <p className="text-gray-500">{v.email}</p>
                  </div>
                ))
              )}
            </div>

            {/* CLOSE */}
            <button
              onClick={() => setSelectedSOS(null)}
              className="mt-5 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
