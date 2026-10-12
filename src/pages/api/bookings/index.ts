import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/apiAuth";
import { HttpError, parseRange, assertNoConflict } from "@/lib/bookings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { roomId, title } = req.body ?? {};
    if (typeof roomId !== "string" || !roomId)
      throw new HttpError(400, "roomId is required");
    if (typeof title !== "string" || !title.trim())
      throw new HttpError(400, "title is required");
    const { startTime, endTime } = parseRange(
      req.body.startTime,
      req.body.endTime,
    );

    const roomRef = adminDb.collection("rooms").doc(roomId);
    const bookingRef = adminDb.collection("bookings").doc();
    const userRef = adminDb.collection("users").doc(user.uid);

    const booking = await adminDb.runTransaction(async (tx) => {
      const [room, userSnap] = await Promise.all([
        tx.get(roomRef),
        tx.get(userRef),
      ]);
      if (!room.exists) throw new HttpError(404, "Room not found");

      await assertNoConflict(tx, roomId, startTime, endTime);

      const data = {
        roomId,
        userId: user.uid,
        title: title.trim(),
        startTime,
        endTime,
        memberIds: [user.uid],
      };
      tx.set(bookingRef, data);
      tx.set(bookingRef.collection("members").doc(user.uid), {
        uid: user.uid,
        email: userSnap.data()?.email ?? "",
        role: "admin",
      });
      return { id: bookingRef.id, ...data };
    });

    return res.status(201).json(booking);
  } catch (e) {
    if (e instanceof HttpError)
      return res.status(e.status).json({ error: e.message });
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
}
