import { getAuthenticatedUser } from "../../../../../db/auth";
import { addDocument, listDocuments } from "../../../../../db/projects";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

  const { id } = await params;
  const projectId = Number.parseInt(id, 10);
  if (!Number.isFinite(projectId)) return Response.json({ error: "شناسه پروژه نامعتبر است." }, { status: 400 });

  const url = new URL(request.url);
  const wbsIdParam = url.searchParams.get("wbsId");
  const documents = await listDocuments(projectId, wbsIdParam ? Number.parseInt(wbsIdParam, 10) : undefined);
  return Response.json({ documents });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

    const { id } = await params;
    const projectId = Number.parseInt(id, 10);
    if (!Number.isFinite(projectId)) return Response.json({ error: "شناسه پروژه نامعتبر است." }, { status: 400 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "فایلی انتخاب نشده است." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "حجم فایل نباید بیشتر از ۸ مگابایت باشد." }, { status: 400 });
    }

    const wbsIdRaw = formData.get("wbsId");
    const wbsId = wbsIdRaw ? Number.parseInt(String(wbsIdRaw), 10) : null;
    const note = String(formData.get("note") ?? "");

    const buffer = await file.arrayBuffer();
    const created = await addDocument(projectId, wbsId, file.name, file.type || "application/octet-stream", buffer, note);
    return Response.json({ document: created }, { status: 201 });
  } catch (error) {
    console.error("Uploading document failed", error);
    return Response.json({ error: "بارگذاری مستند با خطا مواجه شد." }, { status: 500 });
  }
}
