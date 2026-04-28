"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  // Load from cookies on refresh
  useEffect(() => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // LOGIN
  const login = (user, token) => {
    setUser(user);
    setToken(token);

    // store in cookies
    Cookies.set("user", JSON.stringify(user), { expires: 15 });
    Cookies.set("token", token, { expires: 15 });
  };

  //LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);

    Cookies.remove("user");
    Cookies.remove("token");
  };

  return ( 
    <UserContext.Provider value={{ user, token, login, logout, loading  }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);