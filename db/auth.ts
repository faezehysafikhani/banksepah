import { env } from "./env";

// Seeded admin login: username "admin", password "Admin@123".
const ADMIN_SALT = "560153f3829af1fa9d69c9dab548e03a";
const ADMIN_HASH = "31927aa8e1a293f8122401206f81d27a8b3bfe6b3d512e2617a6b29346458481";
const PBKDF2_ITERATIONS = 120_000;

export const SESSION_COOKIE = "sepah_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export type AuthUser = {
  id: number;
  username: string;
  displayName: string;
  role: string;
};

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

async function pbkdf2(password: string, saltHex: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const result = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: hexToBytes(saltHex),
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(result));
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

export async function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actualHash = await pbkdf2(password, salt);
  if (actualHash.length !== expectedHash.length) return false;
  let difference = 0;
  for (let index = 0; index < actualHash.length; index += 1) {
    difference |= actualHash.charCodeAt(index) ^ expectedHash.charCodeAt(index);
  }
  return difference === 0;
}

export function getSessionToken(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const entry = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return entry ? decodeURIComponent(entry.slice(SESSION_COOKIE.length + 1)) : null;
}

export function sessionCookie(token: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`;
}

export async function ensureAuthSchema() {
  const database = env.DB;
  if (!database) throw new Error("D1 binding DB is unavailable");

  await database.batch([
    database.prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    database.prepare("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)"),
    database.prepare("CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)"),
  ]);

  await database
    .prepare(`INSERT OR IGNORE INTO users
      (username, display_name, role, password_salt, password_hash, is_active)
      VALUES (?, ?, ?, ?, ?, 1)`)
    .bind("admin", "مدیر سامانه", "admin", ADMIN_SALT, ADMIN_HASH)
    .run();

  return database;
}

export async function getAuthenticatedUser(request: Request): Promise<AuthUser | null> {
  const token = getSessionToken(request);
  if (!token) return null;

  const database = await ensureAuthSchema();
  const tokenHash = await hashToken(token);
  const user = await database
    .prepare(`SELECT u.id, u.username, u.display_name AS displayName, u.role
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ? AND u.is_active = 1
      LIMIT 1`)
    .bind(tokenHash, new Date().toISOString())
    .first<AuthUser>();
  return user ?? null;
}
