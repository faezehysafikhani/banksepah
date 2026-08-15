import { getAuthenticatedUser } from "../../../../../../../db/auth";
import { getWbsProgressLogs, recordWbsProgress } from "../../../../../../../db/projects";

export async function GET(request: Request, { params }: { params: Promise<{ id: string; wbsId: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

  const { wbsId } = await params;
  const id = Number.parseInt(wbsId, 10);
  if (!Number.isFinite(id)) return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });

  const logs = await getWbsProgressLogs(id);
  return Response.json({ logs });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string; wbsId: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

    const { wbsId } = await params;
    const id = Number.parseInt(wbsId, 10);
    if (!Number.isFinite(id)) return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });

    const body = (await request.json()) as { progress?: number; note?: string };
    if (body.progress === undefined || body.progress === null || Number.isNaN(Number(body.progress))) {
      return Response.json({ error: "درصد پیشرفت را وارد کنید." }, { status: 400 });
    }

    const result = await recordWbsProgress(id, Number(body.progress), (body.note ?? "").trim());
    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Recording WBS progress failed", error);
    return Response.json({ error: "ثبت پیشرفت با خطا مواجه شد." }, { status: 500 });
  }
}
