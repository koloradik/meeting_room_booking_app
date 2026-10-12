import type { Transaction } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import type { SessionUser } from "@/lib/apiAuth";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function parseRange(startTime: unknown, endTime: unknown) {
  if (typeof startTime !== "string" || typeof endTime !== "string") {
    throw new HttpError(400, "startTime and endTime are required");
  }
  const s = new Date(startTime);
  const e = new Date(endTime);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    throw new HttpError(400, "Invalid date format");
  }
  if (s >= e) throw new HttpError(400, "startTime must be before endTime");
  return { startTime: s.toISOString(), endTime: e.toISOString() };
}

export async function deleteBookingWithMembers(
  bookingRef: FirebaseFirestore.DocumentReference,
) {
  const members = await bookingRef.collection("members").get();
  const batch = adminDb.batch();
  members.docs.forEach((m) => batch.delete(m.ref));
  batch.delete(bookingRef);
  await batch.commit();
}

export async function assertNoConflict(
  tx: Transaction,
  roomId: string,
  startTime: string,
  endTime: string,
  excludeId?: string,
) {
  const snap = await tx.get(
    adminDb
      .collection("bookings")
      .where("roomId", "==", roomId)
      .where("startTime", "<", endTime),
  );
  const conflict = snap.docs.find(
    (d) => d.id !== excludeId && (d.data().endTime as string) > startTime,
  );
  if (conflict) {
    throw new HttpError(409, "Room is already booked for this time");
  }
}

export async function loadManageableBooking(id: string, user: SessionUser) {
  const ref = adminDb.collection("bookings").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpError(404, "Booking not found");

  const member = await ref.collection("members").doc(user.uid).get();
  const isBookingAdmin = member.data()?.role === "admin";
  if (!isBookingAdmin && user.role !== "admin") {
    throw new HttpError(403, "Forbidden");
  }
  return { ref, data: snap.data()! };
}
