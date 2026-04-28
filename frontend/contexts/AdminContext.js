"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { token, user } = useUser();

  const [data, setData] = useState({
  users: [],
  sos: [],
  volunteers: [],
  stats: {
    totalUsers: 0,
    totalSOS: 0,
    activeSOS: 0,
    volunteers: 0,
  },
});

  const [loading, setLoading] = useState(false);

  const fetchAdmin = async () => {
    if (!token || user?.userType !== "admin") return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.log("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, [token]);

  return (
    <AdminContext.Provider value={{ ...data, fetchAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);