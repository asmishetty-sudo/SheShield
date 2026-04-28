"use client";

import { useUser } from "@/contexts/UserContext";
import useSuspendedRedirect from "@/hooks/useSuspendedRedirect";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function VolunteerApplyPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    skills: "",
    idType: "",
    idNumber: "",
  });
  const { token,user,login } = useUser();
 const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  useSuspendedRedirect();
useEffect(() => {
  if (!token) {
    router.push("/");
    return;
  }

  if (user?.userType !== "user") {
    router.push("/");
  }
}, [token, user, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });

      if (file) {
        data.append("document", file);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/volunteer/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}` ,
        },
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to submit");
      }

      setForm({
        name: "",
        phone: "",
        age: "",
        gender: "",
        address: "",
        skills: "",
        idType: "",
        idNumber: "",
      });
      toast.success(result.message);
      login( result.user,result.token);
      router.push("/");
      setFile(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Volunteer Application
        </h1>

        

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME */}
          <input
            name="name" 
            placeholder="Full Name"
            onChange={handleChange}
            value={form.name}
            className="input"
            required
          />

          {/* PHONE */}
          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            value={form.phone}
            className="input"
            required
          />

          {/* AGE */}
          <input
            name="age"
            placeholder="Age"
            type="number"
            onChange={handleChange}
            value={form.age}
            className="input"
            required
          />

          {/* GENDER (RADIO) */}
          <div>
            <p className="font-medium mb-2">Gender</p>
            <div className="flex gap-4">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* ADDRESS */}
          <textarea
            name="address"
            placeholder="Full Address"
            onChange={handleChange}
            value={form.address}
            className="input"
          />

          {/* SKILLS */}
          <textarea
            name="skills"
            placeholder="Skills (CPR, First Aid, etc.)"
            onChange={handleChange}
            value={form.skills}
            className="input"
          />
          {/* ID TYPE (RADIO) */}
          <div>
            <p className="font-medium mb-2">ID Type</p>
            <div className="flex gap-4 flex-wrap">
              {["Aadhaar", "Passport", "Driving License", "Other"].map((id) => (
                <label key={id} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="idType"
                    value={id}
                    checked={form.idType === id}
                    onChange={handleChange}
                  />
                  {id}
                </label>
              ))}
            </div>
          </div>

          {/* ID NUMBER */}
          <input
            name="idNumber"
            placeholder="ID Number"
            onChange={handleChange}
            value={form.idNumber}
            className="input"
          />

          {/* FILE UPLOAD (PROFESSIONAL STYLE) */}
          <div>
            <p className="font-medium mb-2">Upload ID Proof</p>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-6 cursor-pointer hover:bg-gray-50">
              <p className="text-gray-600">
                {file ? file.name : "Click to upload file or drag & drop"}
              </p>

              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Apply as Volunteer"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}