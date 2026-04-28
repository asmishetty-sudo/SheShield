"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

const InfoContext = createContext();

export const InfoProvider = ({ children }) => {
  const { token, user } = useUser();

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInfo = async () => {
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setInfo(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInfo();
    } else {
      setInfo(null);
      setLoading(false);
    }
  }, [user]);

  return (
    <InfoContext.Provider value={{ info, loading, refresh: fetchInfo }}>
      {children}
    </InfoContext.Provider>
  );
};

export const useInfo = () => useContext(InfoContext);