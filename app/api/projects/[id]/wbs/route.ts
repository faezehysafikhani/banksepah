import { getAuthenticatedUser } from "../../../../../db/auth";
import { addWbsItem, type NewWbsItem } from "../../../../../db/projects";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

    const { id } = await params;
    const projectId = Number.parseInt(id, 10);
    if (!Number.isFinite(projectId)) {
      return Response.json({ error: "شناسه پروژه نامعتبر است." }, { status: 400 });
    }

    const body = (await request.json()) as Partial<NewWbsItem>;
    const activity = (body.activity ?? "").trim();
    const subActivity = (body.subActivity ?? "").trim();
    if (!activity && !subActivity) {
      return Response.json({ error: "عنوان فعالیت را وارد کنید." }, { status: 400 });
    }

    const level = [1, 2, 3].includes(Number(body.level)) ? Number(body.level) : 1;
    const parentId = body.parentId ? Number(body.parentId) : null;
    if (level > 1 && !parentId) {
      return Response.json({ error: "برای سطح ۲ و ۳ باید فعالیت والد انتخاب شود." }, { status: 400 });
    }

    const item: NewWbsItem = {
      level,
      parentId,
      activity,
      subActivity,
      weight: (body.weight ?? "").trim(),
      personHours: Number.isFinite(Number(body.personHours)) ? Number(body.personHours) : 0,
      prerequisite: (body.prerequisite ?? "").trim(),
      duration: (body.duration ?? "").trim(),
      startDate: (body.startDate ?? "").trim(),
      endDate: (body.endDate ?? "").trim(),
      partnerUnit: (body.partnerUnit ?? "").trim(),
      deliverable: (body.deliverable ?? "").trim(),
      qualityControl: (body.qualityControl ?? "").trim(),
    };

    const created = await addWbsItem(projectId, item);
    return Response.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("Adding WBS item failed", error);
    return Response.json({ error: "ثبت فعالیت جدید با خطا مواجه شد." }, { status: 500 });
  }
}
