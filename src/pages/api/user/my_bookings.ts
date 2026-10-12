import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/apiAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const user = await requireUser(req, res);
  if (!user) return;

  const snap = await adminDb
    .collection("bookings")
    .where("memberIds", "array-contains", user.uid)
    .get();

  const bookings = await Promise.all(
    snap.docs.map(async (doc) => {
      const membersSnap = await doc.ref.collection("members").get();
      const members = membersSnap.docs.map((m) => m.data());
      const me = members.find((m) => m.uid === user.uid);
      return {
        id: doc.id,
        ...doc.data(),
        members,
        myRole: me?.role ?? "user",
      };
    }),
  );

  // сортировка в коде, чтобы не требовать составной индекс
  bookings.sort((a, b) =>
    (a.startTime as string).localeCompare(b.startTime as string),
  );

  return res.status(200).json(bookings);
}
