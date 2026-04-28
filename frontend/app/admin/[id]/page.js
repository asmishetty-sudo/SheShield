"use client";

import { useParams, useRouter } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";
import { useMemo } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  User,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function AdminUserDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { users, sos, volunteers, loading } = useAdmin();

  // Find user
  const user = useMemo(() => {
    return users.find((u) => u._id === id);
  }, [users, id]);

  // SOS SENT
  const sentSOS = useMemo(() => {
    return sos.filter((s) => s.userId?._id === id);
  }, [sos, id]);

  // SOS ACCEPTED (VOLUNTEER)
  const acceptedSOS = useMemo(() => {
    return sos.filter((s) => s.acceptedBy?.some((v) => v._id === id));
  }, [sos, id]);

  //  VOLUNTEER APPLICATION
  const volunteerData = useMemo(() => {
    return volunteers.find((v) => v.userId?._id === id);
  }, [volunteers, id]);

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-red-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen">
      {/*BACK */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-pink-600"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/*USER CARD */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User /> {user.name}
          </h1>

          <p className="flex items-center gap-2 text-gray-600">
            <Mail size={16} /> {user.email}
          </p>

          {user.econtact && (
            <p className="flex items-center gap-2 text-gray-600">
              <Phone size={16} /> {user.econtact}
            </p>
          )}

          <p className="text-sm text-gray-500">
            Joined: {new Date(user.createdAt).toLocaleString()}
          </p>

          <p className="text-sm">
            Role:{" "}
            <span className="font-medium text-purple-600">{user.userType}</span>
          </p>

          <p
            className={`text-sm font-medium ${
              user.isSuspended ? "text-red-500" : "text-green-600"
            }`}
          >
            {user.isSuspended ? "Suspended" : "Active"}
          </p>
        </div>
      </div>
{/* VOLUNTEER DETAILS */}
      {volunteerData && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-600">
            <Shield /> Volunteer Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Name:</strong> {volunteerData.name}
            </p>
            <p>
              <strong>Phone:</strong> {volunteerData.phone}
            </p>
            <p>
              <strong>Age:</strong> {volunteerData.age}
            </p>
            <p>
              <strong>Gender:</strong> {volunteerData.gender}
            </p>
            <p>
              <strong>Status:</strong> {volunteerData.status}
            </p>
            <p>
              <strong>Skills:</strong> {volunteerData.skills}
            </p>
            <p>
              <strong>Address:</strong> {volunteerData.address}
            </p>
            <p>
              <strong>{volunteerData.idType}:</strong> {volunteerData.idNumber}
            </p>
            <p>
              <strong>Document:</strong>{" "}
              {volunteerData.document ? (
                <a
                  href={volunteerData.document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Document
                </a>
              ) : (
                "Not uploaded"
              )}
            </p>
          </div>
        </div>
      )}
      {/*SOS SENT */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-pink-600">
          <AlertTriangle /> SOS Sent ({sentSOS.length})
        </h2>

        {sentSOS.length === 0 ? (
          <p className="text-gray-500">No SOS sent</p>
        ) : (
          <div className="space-y-3">
            {sentSOS.map((s) => {
              const formattedDate = new Date(s.createdAt).toLocaleString([], {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <div
                  key={s._id}
                  className="border border-pink-200 rounded-lg p-3 flex flex-col md:flex-row md:justify-between md:items-center text-sm gap-1"
                >
                  {/* LEFT */}
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      SOS ID: {s._id.toUpperCase()}
                    </span>
                    <span className="text-gray-600">Status: {s.status}</span>
                  </div>

                  {/* RIGHT */}
                  <span className="text-gray-500">{formattedDate}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACCEPTED SOS (ONLY IF VOLUNTEER) */}
      {(user.userType === "volunteer" ||
        user.userType === "volunteer_pending") && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-600">
            <CheckCircle /> SOS Accepted ({acceptedSOS.length})
          </h2>

          {acceptedSOS.length === 0 ? (
            <p className="text-gray-500">No SOS accepted</p>
          ) : (
            <div className="space-y-3">
              {acceptedSOS.map((s) => {
                const formattedDate = new Date(s.createdAt).toLocaleString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
                return (
                  <div
                    key={s._id}
                    className="border border-pink-200 rounded-lg p-3 flex flex-col md:flex-row md:justify-between md:items-center text-sm gap-1"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        SOS ID: {s._id.toUpperCase()}
                      </span>
                      <span className="text-gray-600">Status: {s.status}</span>
                    </div>
                    <span>{formattedDate}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      
    </div>
  );
}
