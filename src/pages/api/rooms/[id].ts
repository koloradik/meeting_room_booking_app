import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/apiAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireUser(req, res);
  if (!user) return;
  if (user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });

  const id = req.query.id as string;
  const ref = adminDb.collection("rooms").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: "Room not found" });

  if (req.method === "PUT") {
    const { name, description } = req.body ?? {};
    const update: Record<string, string> = {};
    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof description === "string")
      update.description = description.trim();
    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    await ref.update(update);
    return res.status(200).json({ ...snap.data(), ...update });
  }

  const bookings = await adminDb
    .collection("bookings")
    .where("roomId", "==", id)
    .get();
  for (const d of bookings.docs) await adminDb.recursiveDelete(d.ref);
  await adminDb.recursiveDelete(ref);

  return res.status(200).json({ status: "deleted" });
}
