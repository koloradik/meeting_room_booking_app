import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/apiAuth";
import { HttpError, loadManageableBooking } from "@/lib/bookings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE")
    return res.status(405).json({ error: "Method not allowed" });

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { ref } = await loadManageableBooking(req.query.id as string, user);
    const targetUid = req.query.uid as string;

    const memberRef = ref.collection("members").doc(targetUid);
    const member = await memberRef.get();
    if (!member.exists) throw new HttpError(404, "Member not found");
    if (member.data()?.role === "admin") {
      throw new HttpError(400, "Cannot remove the booking admin");
    }

    const batch = adminDb.batch();
    batch.delete(memberRef);
    batch.update(ref, { memberIds: FieldValue.arrayRemove(targetUid) });
    await batch.commit();

    return res.status(200).json({ status: "removed" });
  } catch (e) {
    if (e instanceof HttpError)
      return res.status(e.status).json({ error: e.message });
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
}
