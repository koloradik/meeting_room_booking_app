import { auth } from "@/lib/firebase";
import { UserType } from "@/lib/types";
import axios from "axios";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import CreateRoomModal from "../modals/room/CreateRoomModal";

type Props = {
  setActiveTab: Dispatch<SetStateAction<"rooms" | "bookings">>;
  activeTab: "rooms" | "bookings";

  user: UserType;
};

export default function Header({ setActiveTab, activeTab, user }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      await axios.post("/api/user/auth/logout");

      router.replace("/auth");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("rooms")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === "rooms"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All Rooms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === "bookings"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            My Bookings
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          {user.role === "admin" && <CreateRoomModal />}
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-gray-500 hover:text-red-600 transition duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
