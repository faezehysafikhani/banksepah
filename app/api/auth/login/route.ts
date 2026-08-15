import { env } from "../../../../db/env";
import {
  ensureAuthSchema,
  hashToken,
  sessionCookie,
  SESSION_TTL_SECONDS,
  verifyPassword,
} from "../../../../db/auth";

type UserRow = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  passwordSalt: string;
  passwordHash: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { username?: string; password?: string };
    const username = payload.username?.trim().toLowerCase() ?? "";
    const password = payload.password ?? "";

    if (!username || !password) {
      return Response.json({ error: "نام کاربری و رمز عبور را وارد کنید." }, { status: 400 });
    }

    const database = await ensureAuthSchema();
    const user = await database
      .prepare(`SELECT id, username, display_name AS displayName, role,
        password_salt AS passwordSalt, password_hash AS passwordHash
        FROM users WHERE username = ? AND is_active = 1 LIMIT 1`)
      .bind(username)
      .first<UserRow>();

    if (!user || !(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
      return Response.json({ error: "نام کاربری یا رمز عبور صحیح نیست." }, { status: 401 });
    }

    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(tokenBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

    await env.DB.batch([
      env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(new Date().toISOString()),
      env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
        .bind(tokenHash, user.id, expiresAt),
    ]);

    return Response.json(
      { user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } },
      { headers: { "Set-Cookie": sessionCookie(token, request) } },
    );
  } catch (error) {
    console.error("Login failed", error);
    return Response.json({ error: "ارتباط با سامانه برقرار نشد. دوباره تلاش کنید." }, { status: 500 });
  }
}
