"use client";
 
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";
import { Search, Eye, Trash2, UserX, Users, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";

export default function AdminUsersPage() {
  const { users, fetchAdmin, loading } = useAdmin();
  const { token } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [confirmData, setConfirmData] = useState(null);
  //Filter users (exclude admins + search)
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.userType === "admin") return false;

      const query = search.toLowerCase();

      return (
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const handleSuspend = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/users/${id}/suspend`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success(data.message); // replace with toast later
      fetchAdmin();
    } catch (err) {
      toast.error("Something went wrong");
      console.log("Error :", err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("User deleted");
      fetchAdmin();
    } catch (err) {
      toast.error("Something went wrong");
      console.log("Error :", err.message);
    }
  };

function shortTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];

  for (let i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count > 0) {
      return `${count}${i.label} ago`;
    }
  }
  return "just now";
}


  if (loading) {
    return (
      <div className="p-6 md:p-10 space-y-6 min-h-screen">Loading .....</div>
    );
  }
  return (
    <div className="p-6 md:p-10 space-y-6 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Users className="text-purple-600" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
          Manage Users
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
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">User Type</th>
              <th className="p-4">Last Active</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  className="border-t border-gray-300 hover:bg-gray-50 transition"
                >
                  {/* USER */}
                  <td className="p-4 font-medium">{u.name}</td>

                  {/* EMAIL */}
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4 text-gray-600">{u.userType}</td>
                  <td className="p-4 text-gray-600 text-xs"> {u.lastActive ? shortTimeAgo(u.lastActive) : "N/A"}</td>
                  {/* STATUS */}
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        u.isSuspended
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {u.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 flex justify-center gap-3">
                    {/* VIEW */}
                    <div className="relative group">
                      <button
                        onClick={() => router.push(`/admin/${u._id}`)}
                        className="p-2 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Eye size={18} className="text-blue-600" />
                      </button>
                      <span
                        className="absolute -top-8 left-1/2 -translate-x-1/2 
      whitespace-nowrap text-xs bg-gray-800 text-white px-2 py-1 rounded 
      opacity-0 group-hover:opacity-100 transition pointer-events-none"
                      >
                        View
                      </span>
                    </div>

                    {/* SUSPEND / ACTIVATE */}
                    <div className="relative group">
                      <button
                        onClick={() =>
                          setConfirmData({ type: "suspend", user: u })
                        }
                        className="p-2 rounded-lg hover:bg-yellow-100 transition"
                      >
                        {u.isSuspended ? (
                          <UserCheck size={18} className="text-green-600" />
                        ) : (
                          <UserX size={18} className="text-yellow-600" />
                        )}
                      </button>
                      <span
                        className="absolute -top-8 left-1/2 -translate-x-1/2 
      whitespace-nowrap text-xs bg-gray-800 text-white px-2 py-1 rounded 
      opacity-0 group-hover:opacity-100 transition pointer-events-none"
                      >
                        {u.isSuspended ? "Activate" : "Suspend"}
                      </span>
                    </div>

                    {/* DELETE */}
                    <div className="relative group">
                      <button
                        onClick={() =>
                          setConfirmData({ type: "delete", user: u })
                        }
                        className="p-2 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                      <span
                        className="absolute -top-8 left-1/2 -translate-x-1/2 
      whitespace-nowrap text-xs bg-gray-800 text-white px-2 py-1 rounded 
      opacity-0 group-hover:opacity-100 transition pointer-events-none"
                      >
                        Delete
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {confirmData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 animate-fadeIn">
            {/* TITLE */}
            <h2 className="text-xl font-bold mb-2">
              {confirmData.type === "delete"
                ? "Delete User"
                : confirmData.user.isSuspended
                  ? "Activate User"
                  : "Suspend User"}
            </h2>

            {/* MESSAGE */}
            <p className="text-gray-600 mb-6">
              {confirmData.type === "delete"
                ? "This action is permanent. Are you sure you want to delete this user?"
                : confirmData.user.isSuspended
                  ? "This user will regain access to the platform."
                  : "This user will be blocked from using the platform."}
            </p>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmData(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (confirmData.type === "delete") {
                    await handleDelete(confirmData.user._id);
                  } else {
                    await handleSuspend(confirmData.user._id);
                  }
                  setConfirmData(null);
                }}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmData.type === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
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
