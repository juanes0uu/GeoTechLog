// client1/src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

type User = { id: number; name: string; email: string; role?: string };

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("geotech_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("geotech_token"));

  useEffect(() => {
    if (token) localStorage.setItem("geotech_token", token); else localStorage.removeItem("geotech_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("geotech_user", JSON.stringify(user)); else localStorage.removeItem("geotech_user");
  }, [user]);

  async function login(email: string, password: string) {
    const resp = await apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(resp.token);
    setUser(resp.user);
    return resp;
  }

  async function register(name: string, email: string, password: string, role = "visitante") {
    const resp = await apiFetch<User>("/users", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    const loginResp = await apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(loginResp.token);
    setUser(loginResp.user);
    return loginResp;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return { user, token, login, register, logout };
}
