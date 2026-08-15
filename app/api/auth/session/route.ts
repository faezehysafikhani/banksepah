import { getAuthenticatedUser } from "../../../../db/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ authenticated: false }, { status: 401 });
    return Response.json({ authenticated: true, user });
  } catch (error) {
    console.error("Session lookup failed", error);
    return Response.json({ authenticated: false }, { status: 401 });
  }
}
