import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { stringifySetCookie } from "cookie";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PRIVATE_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PRIVATE_FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n",
      ),
    }),
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Missing ID Token" });
    }

    const expiresIn = 60 * 60 * 24 * 7 * 1000;

    const sessionCookie = await getAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    const serializedCookie = stringifySetCookie({
      name: "__session",
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    res.setHeader("Set-Cookie", serializedCookie);
    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(401).json({ error: "Unauthorized access" });
  }
}
