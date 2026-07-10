import { useState, useEffect, useCallback } from "react";
import { getMpUser, clearMpSession, refreshMpUser } from "@/lib/marketplaceAuth";

// Global state so all components share one user
let _listeners = [];
let _user = getMpUser();

function notify() {
  _listeners.forEach(fn => fn(_user));
}

export function setGlobalMpUser(user) {
  _user = user;
  notify();
}

export function logoutMpUser() {
  clearMpSession();
  _user = null;
  notify();
}

export default function useMpUser() {
  const [user, setUser] = useState(_user);

  useEffect(() => {
    const handler = (u) => setUser(u);
    _listeners.push(handler);
    return () => { _listeners = _listeners.filter(f => f !== handler); };
  }, []);

  const refresh = useCallback(async () => {
    if (!_user?.id) return;
    const fresh = await refreshMpUser(_user.id);
    if (fresh) { setGlobalMpUser(fresh); }
  }, []);

  return { user, refresh, logout: logoutMpUser };
}