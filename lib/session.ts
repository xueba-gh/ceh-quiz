import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ceh-session";
export const SESSION_DAYS = 30;

function secret() {
  return process.env.SESSION_SECRET ?? "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Token format: base64url(username).expiresAtMs.signature */
export function createToken(username: string) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const body = `${Buffer.from(username).toString("base64url")}.${expires}`;
  return { token: `${body}.${sign(body)}`, expires: new Date(expires) };
}

export function verifyToken(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [user, expires, signature] = parts;
  if (!safeEqual(signature, sign(`${user}.${expires}`))) return false;
  return Number(expires) > Date.now();
}

export function checkCredentials(username: string, password: string) {
  const expectedUser = process.env.AUTH_USERNAME;
  const expectedPass = process.env.AUTH_PASSWORD;
  if (!expectedUser || !expectedPass || !secret()) return false;
  // Evaluate both so timing doesn't reveal which field was wrong.
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

export function isConfigured() {
  return Boolean(process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD && secret());
}
