import { requireUser } from "@/lib/apiAuth";
import {
  assertNoConflict,
  deleteBookingWithMembers,
  HttpError,
  loadManageableBooking,
  parseRange,
} from "@/lib/bookings";
import { adminDb } from "@/lib/firebaseAdmin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const id = req.query.id as string;
  const ref = adminDb.collection("bookings").doc(id);

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new HttpError(404, "Booking not found");

      const current = snap.data()!;
      if (current.userId !== user.uid && user.role !== "admin") {
        throw new HttpError(403, "Forbidden");
      }

      if (req.method === "DELETE") {
        try {
          const { ref } = await loadManageableBooking(id, user);
          await deleteBookingWithMembers(ref);
          return res.status(200).json({ status: "deleted" });
        } catch (e) {
          if (e instanceof HttpError)
            return res.status(e.status).json({ error: e.message });
          console.error(e);
          return res.status(500).json({ error: "Internal error" });
        }
      }

      const body = req.body ?? {};
      const roomId =
        typeof body.roomId === "string" && body.roomId
          ? body.roomId
          : current.roomId;
      const title =
        typeof body.title === "string" && body.title.trim()
          ? body.title.trim()
          : current.title;
      const { startTime, endTime } = parseRange(
        body.startTime ?? current.startTime,
        body.endTime ?? current.endTime,
      );

      if (roomId !== current.roomId) {
        const room = await tx.get(adminDb.collection("rooms").doc(roomId));
        if (!room.exists) throw new HttpError(404, "Room not found");
      }

      await assertNoConflict(tx, roomId, startTime, endTime, id);

      const update = { roomId, title, startTime, endTime };
      tx.update(ref, update);
      return { id, userId: current.userId, ...update };
    });

    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof HttpError)
      return res.status(e.status).json({ error: e.message });
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
}
