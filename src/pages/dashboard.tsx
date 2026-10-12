import AllRooms from "@/components/dashboard/AllRooms";
import DynamicHeader from "@/components/dashboard/DynamicHeader";
import Header from "@/components/dashboard/Header";
import MyBooking from "@/components/dashboard/MyBookings";
import { RoomType, UserType } from "@/lib/types";
import { parseCookie } from "cookie";
import type { GetServerSideProps } from "next";
import { useState } from "react";

interface DashboardProps {
  user: UserType;
  rooms: RoomType[];
}

export default function DashboardPage({ user, rooms }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"rooms" | "bookings">("rooms");
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <DynamicHeader activeTab={activeTab} />

        {activeTab === "rooms" && (
          <AllRooms user_role={user.role} rooms={rooms} />
        )}

        {activeTab === "bookings" && <MyBooking />}
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async ({
  req,
  res,
}) => {
  const { adminAuth, adminDb } = await import("@/lib/firebaseAdmin");

  const toAuth = { redirect: { destination: "/auth", permanent: false } };

  const session = parseCookie(req.headers.cookie || "").__session;
  if (!session) return toAuth;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);

    const [userSnap, roomsSnap] = await Promise.all([
      adminDb.collection("users").doc(decoded.uid).get(),
      adminDb.collection("rooms").get(),
    ]);

    const userDoc = userSnap.data();

    const user: UserType = {
      uid: decoded.uid,
      name: userDoc?.name ?? "",
      email: userDoc?.email ?? decoded.email ?? "",
      role: userDoc?.role ?? "User",
    };

    const rooms: RoomType[] = roomsSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name ?? "",
        description: d.description ?? "",
      };
    });

    return { props: { user, rooms } };
  } catch (error) {
    res.setHeader(
      "Set-Cookie",
      "__session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    );
    return toAuth;
  }
};
