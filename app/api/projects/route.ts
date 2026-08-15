import { getAuthenticatedUser } from "../../../db/auth";
import { listProjects } from "../../../db/projects";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

    const projects = await listProjects();
    return Response.json({ projects });
  } catch (error) {
    console.error("Listing projects failed", error);
    return Response.json({ error: "دریافت فهرست پروژه‌ها با خطا مواجه شد." }, { status: 500 });
  }
}
