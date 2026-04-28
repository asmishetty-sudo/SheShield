"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function AdminVolunteersPage() {
  const { volunteers ,fetchAdmin } = useAdmin();
  const { token } = useUser();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [confirmData, setConfirmData] = useState(null);

  //SEARCH FILTER
  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return volunteers.filter((v) => {
      const name = v.userId?.name?.toLowerCase() || "";
      const email = v.userId?.email?.toLowerCase() || "";

      return name.includes(q) || email.includes(q);
    });
  }, [volunteers, search]);

  //GROUPING
  const pending = filtered.filter((v) => v.status === "pending");
  const approved = filtered.filter(
    (v) => v.status === "approved" && v.isVerifiedVolunteer
  );
  const rejected = filtered.filter((v) => v.status === "rejected");

  //ACTION HANDLERS (HOOK UP API LATER)
  const handleAction = async () => {
  if (!confirmData) return;

  try {
    const endpoint =
      confirmData.type === "approve"
        ? `/api/admin/volunteer/${confirmData.volunteer._id}/approve`
        : `/api/admin/volunteer/${confirmData.volunteer._id}/reject`;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}${endpoint}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // make sure you have token
        },
      }
    );

    const data = await res.json();

    if (data.success) {
      //refresh admin data
      await fetchAdmin();
    } else {
      console.error(data.message);
    }
  } catch (err) {
    console.error("Action error:", err);
  } finally {
    setConfirmData(null);
  }
};

  // CARD COMPONENT
  const VolunteerCard = ({ v, type }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center hover:shadow-md transition">
      <div>
        <p className="font-semibold text-gray-800">
          {v.userId?.name || v.name}
        </p>
        <p className="text-sm text-gray-500">{v.userId?.email}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* REVIEW */}
        <button
          onClick={() => router.push(`/admin/${v.userId?._id}`)}
          className="p-2 rounded-lg hover:bg-blue-100"
        >
          <Eye className="text-blue-600 w-4 h-4" />
        </button>

        {/* ONLY PENDING */}
        {type === "pending" && (
          <>
            <button
              onClick={() =>
                setConfirmData({ type: "approve", volunteer: v })
              }
              className="p-2 rounded-lg hover:bg-green-100"
            >
              <CheckCircle className="text-green-600 w-4 h-4" />
            </button>

            <button
              onClick={() =>
                setConfirmData({ type: "reject", volunteer: v })
              }
              className="p-2 rounded-lg hover:bg-red-100"
            >
              <XCircle className="text-red-600 w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Users className="text-indigo-600" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          Manage Volunteers
        </h1>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PENDING */}
        <Section
          title="Pending"
          icon={<Clock className="text-yellow-500" />}
          data={pending}
          type="pending"
          VolunteerCard={VolunteerCard}
        />

        {/*APPROVED */}
        <Section
          title="Approved"
          icon={<CheckCircle className="text-green-500" />}
          data={approved}
          type="approved"
          VolunteerCard={VolunteerCard}
        />

        {/*REJECTED */}
        <Section
          title="Rejected"
          icon={<XCircle className="text-red-500" />}
          data={rejected}
          type="rejected"
          VolunteerCard={VolunteerCard}
        />
      </div>

      {/*CONFIRM MODAL */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center space-y-4">
            <h2 className="text-lg font-semibold">
              Confirm {confirmData.type}
            </h2>

            <p className="text-gray-600 text-sm">
              Are you sure you want to{" "}
              <span className="font-medium">
                {confirmData.type}
              </span>{" "}
              this volunteer?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmData(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleAction}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmData.type === "approve"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🔥 SECTION COMPONENT */
function Section({ title, icon, data, type, VolunteerCard }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-4">
      <div className="flex items-center gap-2 font-semibold text-gray-800">
        {icon} {title} ({data.length})
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No volunteers</p>
      ) : (
        <div className="space-y-3">
          {data.map((v) => (
            <VolunteerCard key={v._id} v={v} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}