import { getAuthenticatedUser } from "../../../../../../db/auth";
import { deleteWbsItem } from "../../../../../../db/projects";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; wbsId: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

    const { id, wbsId } = await params;
    const projectId = Number.parseInt(id, 10);
    const itemId = Number.parseInt(wbsId, 10);
    if (!Number.isFinite(projectId) || !Number.isFinite(itemId)) {
      return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });
    }

    const removed = await deleteWbsItem(projectId, itemId);
    if (!removed) return Response.json({ error: "فعالیت یافت نشد." }, { status: 404 });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Deleting WBS item failed", error);
    return Response.json({ error: "حذف فعالیت با خطا مواجه شد." }, { status: 500 });
  }
}
