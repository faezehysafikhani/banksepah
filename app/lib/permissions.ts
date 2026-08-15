/** Plain "user" accounts are read-only; "admin" (and any other elevated role) can edit/review. */
export function canManage(role: string) {
  return role !== "user";
}
