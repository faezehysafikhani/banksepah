import { getAuthenticatedUser } from "../../../../../../../db/auth";
import { reviewDocument, type ReviewStatus } from "../../../../../../../db/projects";

const VALID_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

    const { id, docId } = await params;
    const projectId = Number.parseInt(id, 10);
    const documentId = Number.parseInt(docId, 10);
    if (!Number.isFinite(projectId) || !Number.isFinite(documentId)) {
      return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });
    }

    const body = (await request.json()) as { formStatus?: string; contentStatus?: string; note?: string };
    const formStatus = body.formStatus as ReviewStatus;
    const contentStatus = body.contentStatus as ReviewStatus;
    if (!VALID_STATUSES.includes(formStatus) || !VALID_STATUSES.includes(contentStatus)) {
      return Response.json({ error: "وضعیت تأیید نامعتبر است." }, { status: 400 });
    }

    const updated = await reviewDocument(projectId, documentId, formStatus, contentStatus, (body.note ?? "").trim());
    if (!updated) return Response.json({ error: "مستند یافت نشد." }, { status: 404 });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Reviewing document failed", error);
    return Response.json({ error: "ثبت تأییدیه با خطا مواجه شد." }, { status: 500 });
  }
}
