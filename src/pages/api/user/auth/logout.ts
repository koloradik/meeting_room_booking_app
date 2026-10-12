import type { NextApiRequest, NextApiResponse } from "next";
import { stringifySetCookie } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const serializedCookie = stringifySetCookie({
    name: "__session",
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.setHeader("Set-Cookie", serializedCookie);
  return res.status(200).json({ status: "success" });
}
