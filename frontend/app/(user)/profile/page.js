"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  Edit,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  Pen,
} from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { useInfo } from "@/contexts/InfoContext";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import useSuspendedRedirect from "@/hooks/useSuspendedRedirect";

export default function ProfilePage() {
  const { token, logout } = useUser();
  const { info, refresh } = useInfo();
  useAuthRedirect();
  const [showPasswordBox, setShowPasswordBox] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user, volunteer } = info || {};
  const [editMode, setEditMode] = useState(false);
  const [editPic, setEditPic] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [name, setName] = useState(user?.name || "");
  const [address, setAddress] = useState(volunteer?.address || "");
  const [profilePic, setProfilePic] = useState(user?.profilePic || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  useSuspendedRedirect();
  useEffect(() => {
    if (info) {
      setName(info.user.name);
      setProfilePic(info.user.profilePic || "");
      if (info.volunteer) {
        setAddress(info.volunteer.address || "");
      }
    }
  }, [info]);

  const isVolunteer = user?.userType === "volunteer";
  const isPending = user?.userType === "volunteer_pending";
  //IMAGE UPLOAD
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/update/profile-pic`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (data.success) {
        setProfilePic(data.imageUrl);
        toast.success("Profile updated");
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  // UPDATE NAME
  const handleUsername = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/update/name`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Name updated");
        setEditMode(false);
        refresh();
      }
    } catch {
      toast.error("Failed to update name");
    }
  };

  //  UPDATE ADDRESS (VOLUNTEER ONLY)
  const handleAddress = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/update/address`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ address }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Address updated");
        await refresh();
      }
    } catch {
      toast.error("Failed to update address");
    }
  };

  if (!info || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-rose-100 p-6 md:p-10">
        Loading profile...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-rose-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* PROFILE PIC */}
          <div className="relative group">
            <img
              src={profilePic || "/default.png"}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-pink-300"
            />
            {!editPic && (
              <div
                onClick={() => setEditPic(true)}
                className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full cursor-pointer shadow-md hover:scale-105 transition"
              >
                <Edit className="text-white w-4 h-4" />
              </div>
            )}
            {editPic && (
              <label className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full cursor-pointer shadow-md hover:scale-105 transition">
                <Camera className="text-white w-4 h-4" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/*INFO */}
          <div className="flex-1 text-center md:text-left">
  {editMode ? (
    <div className="flex items-center gap-3 justify-center md:justify-start">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="text-2xl font-bold px-3 py-1 rounded-lg border border-pink-300 
        focus:outline-none focus:ring-2 focus:ring-pink-400 transition w-48 md:w-auto"
      />

      {/* SAVE */}
      <button
        onClick={handleUsername}
        className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
      >
        <CheckCircle className="w-5 h-5" />
      </button>

      {/* CANCEL */}
      <button
        onClick={() => {
          setEditMode(false);
          setName(user?.name);
        }}
        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
      >
        ✕
      </button>
    </div>
  ) : (
    <div className="text-2xl font-bold text-gray-800 flex items-center justify-center md:justify-start group">
      <span>{user?.name}</span>

      <button
        onClick={() => setEditMode(true)}
        className="ml-2 opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-pink-100"
      >
        <Pen className="w-4 h-4 text-pink-500" />
      </button>
    </div>
  )}


            <p className="text-gray-500 text-sm">{user?.email}</p>

            {/* ROLE */}
            <div className="mt-2 flex justify-center md:justify-start gap-2">
              {isVolunteer && (
                <span className="flex items-center gap-1 text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" />
                  Volunteer
                </span>
              )}

              {isPending && (
                <span className="flex items-center gap-1 text-sm bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                  <ShieldAlert className="w-4 h-4" />
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/*DETAILS */}
        <div className="mt-8 space-y-8">
          {/*USER INFO CARD */}
          <div className="bg-pink-100 rounded-xl p-5 border border-pink-200 shadow-sm">
            <h2 className="text-pink-600 font-semibold mb-4">
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-gray-800 font-medium">{user?.email}</p>
              </div>

              <div>
                <p className="text-gray-500">Phone / Emergency Contact</p>
                <p className="text-gray-800 font-medium">
                  {user?.econtact || "Not set"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Last SOS</p>
                <p className="text-gray-800 font-medium">
                  {user?.lastSOS
                    ? new Date(user.lastSOS).toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "No SOS sent"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Member Since</p>
                <p className="text-gray-800 font-medium">
                  {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {/* TRUSTED CONTACTS */}
            <div className="mt-6">
              <p className="text-gray-500 mb-2">Trusted Contacts</p>

              {user?.trusted?.length > 0 ? (
                <div className="space-y-2">
                  {user.trusted.map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-pink-100 rounded-lg px-3 py-2 flex items-center justify-between hover:shadow-sm transition"
                    >
                      {/* LEFT */}
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-800 leading-tight">
                          {t.name}
                        </p>
                        <p className="text-xs text-gray-500">{t.phone}</p>
                      </div>

                      {/* RIGHT */}
                      <div className="text-xs text-gray-400 text-right">
                        {t.email}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  No trusted contacts added
                </p>
              )}
            </div>
          </div>

          {/*VOLUNTEER CARD */}
          {(isVolunteer || isPending) && (
            <div className="bg-pink-100 rounded-xl p-5 border border-pink-200 shadow-sm">
              <h2 className="text-pink-600 font-semibold mb-4">
                Volunteer Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium capitalize text-gray-800">
                    {user?.userType?.replace("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Verification</p>
                  <p className="font-medium text-gray-800">
                    {volunteer?.isVerifiedVolunteer
                      ? "Verified"
                      : "Not Verified"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">
                    {volunteer?.phone || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Age / Gender</p>
                  <p className="font-medium text-gray-800">
                    {volunteer?.age || "-"} / {volunteer?.gender || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Skills</p>
                  <p className="font-medium text-gray-800">
                    {volunteer?.skills || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Address</p>

                  {!isEditingAddress ? (
                    <div className="flex items-center gap-2 group">
                      <p className="font-medium text-gray-800">
                        {volunteer?.address || "Not set"}
                      </p>

                      {isVolunteer && (
                        <button
                          onClick={() => setIsEditingAddress(true)}
                          className="opacity-0 group-hover:opacity-100 text-pink-500"
                        >
                          <Pen className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="border p-2 rounded w-full"
                      />

                      <button
                        onClick={async () => {
                          await handleAddress();
                          setIsEditingAddress(false);
                        }}
                        className="bg-green-500 text-white px-3 rounded"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setAddress(volunteer?.address || "");
                          setIsEditingAddress(false);
                        }}
                        className="bg-gray-300 px-3 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-pink-300 pt-6 flex flex-col gap-3">
          {!showPasswordBox ? (
            <button
              onClick={() => setShowPasswordBox(true)}
              className="w-full max-w-3xs px-4 bg-pink-50 py-2 rounded-lg"
            >
              Change Password
            </button>
          ) : (
            <div className="w-full max-w-md space-y-2">
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border p-2 rounded border-pink-300 bg-white"
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border p-2 rounded border-pink-300 bg-white"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border p-2 rounded border-pink-300 bg-white"
              />

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/change-password`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            oldPassword,
                            newPassword,
                            confirmPassword,
                          }),
                        },
                      );

                      const data = await res.json();

                      if (res.ok) {
                        toast.success(data.message);
                        setShowPasswordBox(false);
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      } else {
                        toast.error(data.message);
                      }
                    } catch {
                      toast.error("Something went wrong");
                    }
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>

                <button
                  onClick={() => setShowPasswordBox(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* DELETE ACCOUNT */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full max-w-3xs px-4 bg-red-600 text-white py-2 rounded-lg"
          >
            Delete Account
          </button>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-pink-200">
            <h2 className="text-xl font-bold text-red-600">Delete Account</h2>

            <p className="text-gray-600 mt-2">
              This action is irreversible. Your account and all data will be
              permanently deleted.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/delete-account`,
                      {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    );

                    const data = await res.json();

                    if (res.ok) {
                      toast.success(data.message);
                      logout();
                    } else {
                      toast.error(data.message);
                    }
                  } catch (err) {
                    toast.error("Something went wrong");
                    console.log("Error :", err.message);
                  } finally {
                    setShowDeleteModal(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
