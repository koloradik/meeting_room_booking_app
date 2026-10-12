import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/apiAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const user = await requireUser(req, res);
  if (!user) return;
  if (user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });

  const { name, description } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  const ref = adminDb.collection("rooms").doc();
  const room = {
    id: ref.id,
    name: name.trim(),
    description: typeof description === "string" ? description.trim() : "",
  };
  await ref.set(room);
  return res.status(201).json(room);
}
