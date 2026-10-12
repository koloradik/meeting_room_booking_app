import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/apiAuth";
import { HttpError, loadManageableBooking } from "@/lib/bookings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { ref } = await loadManageableBooking(req.query.id as string, user);

    const email =
      typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!email) throw new HttpError(400, "email is required");

    const found = await adminDb
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (found.empty) throw new HttpError(404, "User with this email not found");

    const uid = found.docs[0].id;
    const memberRef = ref.collection("members").doc(uid);
    if ((await memberRef.get()).exists)
      throw new HttpError(409, "Already a member");

    const member = { uid, email, role: "user" };
    const batch = adminDb.batch();
    batch.set(memberRef, member);
    batch.update(ref, { memberIds: FieldValue.arrayUnion(uid) });
    await batch.commit();

    return res.status(201).json(member);
  } catch (e) {
    if (e instanceof HttpError)
      return res.status(e.status).json({ error: e.message });
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
}
