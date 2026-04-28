"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useInfo } from "@/contexts/InfoContext";
import useSuspendedRedirect from "@/hooks/useSuspendedRedirect";

export default function TrustedContacts() {
  const { token } = useUser();
  const { info, refresh ,loading } = useInfo();
useSuspendedRedirect();
  const trusted = info?.trustedContacts || [];
  const [form, setForm] = useState({
  name: "",
  phone: "",
  countryCode: "+91",
  email: "",
});
  useAuthRedirect();
  // Fetch contacts

  // Add contact
  const handleAdd = async () => {
  if (!form.name.trim()) {
    return toast.error("Name is required");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.email && !emailRegex.test(form.email)) {
    return toast.error("Invalid email format");
  }

  // Phone validation (7–12 digits)
  if (form.phone && (form.phone.length < 7 || form.phone.length > 12)) {
    return toast.error("Invalid phone number");
  }

  // Combine into E.164 format
  const fullPhone = form.phone
    ? `${form.countryCode}${form.phone}`
    : "";

  const payload = {
    name: form.name,
    email: form.email,
    phone: fullPhone,
  };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (data.success) {
      toast.success("Contact added");
      setForm({
        name: "",
        phone: "",
        countryCode: "+91",
        email: "",
      });
      await refresh();
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    toast.error("Something went wrong");
  }
};

  //Delete contact
  const handleDelete = async (id) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/update/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    if (data.success) {
      await refresh();
    }
  };
if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-rose-100 p-6 md:p-10">
        Loading history...
      </div>
    );
  }
  return (
    <div className="min-h-screen px-4 bg-pink-50">
      <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/*LEFT SIDE (MAIN) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold text-pink-600 mb-2">
              Trusted Contacts
            </h1>

            <p className="text-gray-600 mb-6 text-sm">
              Add people you trust. They will be notified instantly via email
              when an SOS alert is triggered from your account.
            </p>

            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Name */}
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-pink-400 outline-none"
              />

              {/* Phone with Country Code */}
              <div className="flex border border-gray-300 rounded overflow-hidden focus-within:ring-2 focus-within:ring-pink-400">
                {/* Country Code */}
                <select
                  value={form.countryCode}
                  onChange={(e) =>
                    setForm({ ...form, countryCode: e.target.value })
                  }
                  className="bg-gray-100 px-2 outline-none text-sm"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                </select>

                {/* Phone Number */}
                <input
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, ""), // numbers only
                    })
                  }
                  maxLength={12}
                  className="p-2 w-full outline-none text-sm"
                />
              </div>

              {/* Email */}
              <input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-pink-400 outline-none"
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded mb-6"
            >
              Add Contact
            </button>

            {/*LIST */}
            <div className="space-y-3">
              {trusted.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No trusted contacts added yet.
                </p>
              ) : (
                trusted.map((t) => (
                  <div
                    key={t._id}
                    className="flex justify-between items-center border border-gray-200 p-4 rounded-xl hover:shadow-sm transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{t.name}</p>
                      <p className="text-sm text-gray-500">
                        {t.phone || "No phone"} | {t.email || "No email"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(t._id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/*RIGHT SIDE (INFO PANEL) */}
          <div className="space-y-6">
            {/* HOW IT WORKS */}
            <div className="bg-white p-5 rounded-2xl shadow-md border border-pink-100">
              <h2 className="text-lg font-semibold text-pink-600 mb-2">
                How It Works
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                When you press the SOS button, all your trusted contacts receive
                an immediate email alert with your live location. This allows
                them to quickly understand your situation and take action if
                needed.
              </p>
            </div>

            {/* WHAT THEY RECEIVE */}
            <div className="bg-white p-5 rounded-2xl shadow-md border border-pink-100">
              <h2 className="text-lg font-semibold text-pink-600 mb-2">
                What Contacts Receive
              </h2>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>• Emergency alert notification</li>
                <li>• Your current location (Google Maps link)</li>
                <li>• Time of the SOS trigger</li>
                <li>• Your registered name</li>
              </ul>
            </div>

            {/* BEST PRACTICES */}
            <div className="bg-white p-5 rounded-2xl shadow-md border border-pink-100">
              <h2 className="text-lg font-semibold text-pink-600 mb-2">
                Best Practices
              </h2>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>• Add at least 2–3 trusted contacts</li>
                <li>• Ensure emails are active and accessible</li>
                <li>• Inform them they are your emergency contacts</li>
                <li>• Regularly update outdated contact details</li>
              </ul>
            </div>

            {/* SECURITY NOTE */}
            <div className="bg-pink-50 p-5 rounded-2xl border border-pink-200">
              <h2 className="text-sm font-semibold text-pink-700 mb-1">
                Privacy & Security
              </h2>
              <p className="text-xs text-gray-600">
                Your trusted contacts are securely stored and only used during
                emergency alerts. Your data is never shared outside this system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
