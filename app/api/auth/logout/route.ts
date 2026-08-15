import { env } from "cloudflare:workers";
import {
  clearSessionCookie,
  ensureAuthSchema,
  getSessionToken,
  hashToken,
} from "../../../../db/auth";

export async function POST(request: Request) {
  try {
    const token = getSessionToken(request);
    if (token) {
      await ensureAuthSchema();
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
        .bind(await hashToken(token))
        .run();
    }
  } catch (error) {
    console.error("Logout failed", error);
  }

  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": clearSessionCookie(request) } },
  );
}
