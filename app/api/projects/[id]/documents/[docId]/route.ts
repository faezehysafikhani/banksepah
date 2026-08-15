import { getAuthenticatedUser } from "../../../../../../db/auth";
import { deleteDocument, getDocumentFile } from "../../../../../../db/projects";

export async function GET(request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

  const { id, docId } = await params;
  const projectId = Number.parseInt(id, 10);
  const documentId = Number.parseInt(docId, 10);
  if (!Number.isFinite(projectId) || !Number.isFinite(documentId)) {
    return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });
  }

  const file = await getDocumentFile(projectId, documentId);
  if (!file) return Response.json({ error: "مستند یافت نشد." }, { status: 404 });

  return new Response(file.fileData, {
    headers: {
      "Content-Type": file.fileType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    },
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: "ابتدا وارد سامانه شوید." }, { status: 401 });

  const { id, docId } = await params;
  const projectId = Number.parseInt(id, 10);
  const documentId = Number.parseInt(docId, 10);
  if (!Number.isFinite(projectId) || !Number.isFinite(documentId)) {
    return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });
  }

  const removed = await deleteDocument(projectId, documentId);
  if (!removed) return Response.json({ error: "مستند یافت نشد." }, { status: 404 });
  return Response.json({ ok: true });
}
