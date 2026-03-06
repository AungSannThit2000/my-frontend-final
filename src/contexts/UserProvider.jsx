//UserProvider.jsx
/* eslint-disable react-refresh/only-export-components */

import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

const EMPTY_USER = {
  isLoggedIn: false,
  id: "",
  name: "",
  email: "",
  role: "",
};

export function UserProvider ({children}) {

  const API_URL = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState(() => {
    const sessionText = localStorage.getItem("session");
    if (!sessionText) {
      return EMPTY_USER;
    }
    try {
      const session = JSON.parse(sessionText);
      if (!session?.isLoggedIn) {
        return EMPTY_USER;
      }
      return {
        ...EMPTY_USER,
        ...session,
      };
    } catch {
      return EMPTY_USER;
    }
  });

  const clearLocalSession = () => {
    const newUser = { ...EMPTY_USER };
    setUser(newUser);
    localStorage.setItem("session", JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    //TODO: Implement your login mechanism here.
    try {
      const result = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!result.ok) {
        return false;
      }

      const data = await result.json();
      const loggedInUser = {
        isLoggedIn: true,
        id: data?.user?.id || "",
        name: data?.user?.username || "",
        email: data?.user?.email || email,
        role: data?.user?.role || (email === "admin@test.com" ? "ADMIN" : "USER")
      };
      setUser(loggedInUser);
      localStorage.setItem("session", JSON.stringify(loggedInUser));
      return true;
    } catch {
      return false;
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch {
      // Do nothing. Local session must still be cleared.
    } finally {
      clearLocalSession();
    }
  }

  return (
    <UserContext.Provider value={{user, login, logout}}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser () {
  return useContext(UserContext);
}
