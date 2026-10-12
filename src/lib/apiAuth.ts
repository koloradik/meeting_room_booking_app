import type { NextApiRequest, NextApiResponse } from "next";
import { parseCookie } from "cookie";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export interface SessionUser {
  uid: string;
  role: string;
}

export async function requireUser(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<SessionUser | null> {
  const session = parseCookie(req.headers.cookie || "").__session;
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    return { uid: decoded.uid, role: (snap.data()?.role as string) ?? "user" };
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}
