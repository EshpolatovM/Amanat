import { authService } from "./auth.service.js";
import { ok, created } from "../../utils/response.js";
import { tokenService } from "../../lib/jwt.js";
import { env } from "../../config/env.js";

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    // Frontend (vercel.app) va backend (alohida domen) turli saytlarda bo'lsa,
    // cross-site so'rovlarda cookie yuborilishi uchun SameSite=None kerak —
    // u esa faqat Secure (HTTPS) bilan ishlaydi. Lokal dev'da "lax" qoladi.
    secure: env.isProduction || env.cookieSecure,
    sameSite: env.isProduction ? "none" : "lax",
    maxAge,
    path: "/",
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, cookieOptions(tokenService.accessTokenMaxAgeMs()));
  res.cookie("refreshToken", refreshToken, cookieOptions(tokenService.refreshTokenMaxAgeMs()));
}

// Brauzer cookie'ni o'chirishi uchun atributlar (path/secure/sameSite) u
// qo'yilgandagisi bilan bir xil bo'lishi kerak — maxAge'dan tashqari.
function clearAuthCookies(res) {
  const { maxAge: _maxAge, ...options } = cookieOptions(0);
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
}

export async function registerParent(req, res) {
  const result = await authService.registerParent(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  created(res, result);
}

export async function loginParent(req, res) {
  const result = await authService.loginParent(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  ok(res, result);
}

export async function loginChild(req, res) {
  const result = await authService.loginChild(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  ok(res, result);
}

export async function refresh(req, res) {
  const result = await authService.refreshSession(req.cookies?.refreshToken);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  ok(res, result);
}

export async function logout(req, res) {
  await authService.logout(req.cookies?.refreshToken);
  clearAuthCookies(res);
  ok(res, { message: "Tizimdan chiqildi" });
}

export async function me(req, res) {
  const user = await authService.getMe(req.user);
  ok(res, user);
}
