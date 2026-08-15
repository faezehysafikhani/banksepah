import { getAuthenticatedUser } from "../../../../db/auth";
import { getProjectCharter } from "../../../../db/projects";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

    const { id } = await params;
    const projectId = Number.parseInt(id, 10);
    if (!Number.isFinite(projectId)) {
      return Response.json({ error: "شناسه پروژه نامعتبر است." }, { status: 400 });
    }

    const charter = await getProjectCharter(projectId);
    if (!charter) return Response.json({ error: "پروژه یافت نشد." }, { status: 404 });

    return Response.json(charter);
  } catch (error) {
    console.error("Loading project charter failed", error);
    return Response.json({ error: "دریافت منشور پروژه با خطا مواجه شد." }, { status: 500 });
  }
}
