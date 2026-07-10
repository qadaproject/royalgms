// Marketplace user auth — stored in localStorage, separate from admin auth
import { base44 } from "@/api/base44Client";

const TOKEN_KEY = "mp_user_token";
const USER_KEY = "mp_user_data";

export function getMpUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

export function getMpToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setMpSession(user, token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearMpSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function genToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Simple hash using Web Crypto (SHA-256 base64, not bcrypt — good enough for this app)
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export async function loginUser(email, password) {
  const users = await base44.entities.MarketplaceUser.filter({ email: email.trim().toLowerCase() });
  if (!users.length) throw new Error("No account found with that email.");
  const user = users[0];
  if (!user.email_verified || !user.is_active) throw new Error("Please verify your email before logging in.");
  const hash = await hashPassword(password);
  if (user.password_hash !== hash) throw new Error("Incorrect password.");
  const token = genToken();
  await base44.entities.MarketplaceUser.update(user.id, { auth_token: token });
  const freshUser = { ...user, auth_token: token };
  setMpSession(freshUser, token);
  return freshUser;
}

export async function loginVendor(email, password) {
  const vendors = await base44.entities.Vendor.filter({ email: email.trim().toLowerCase() });
  if (!vendors.length) throw new Error("No vendor account found with that email.");
  const vendor = vendors[0];
  if (!vendor.email_verified) throw new Error("Please verify your email before logging in.");
  if (vendor.approval_status === "Rejected") throw new Error("Your vendor application was rejected. Contact support.");
  if (vendor.approval_status === "Suspended") throw new Error("Your vendor account has been suspended. Contact support.");
  const hash = await hashPassword(password);
  if (vendor.password_hash !== hash) throw new Error("Incorrect password.");
  return vendor;
}

export async function refreshMpUser(userId) {
  const users = await base44.entities.MarketplaceUser.filter({ id: userId });
  if (users.length) {
    const u = users[0];
    setMpSession(u, u.auth_token);
    return u;
  }
  return null;
}