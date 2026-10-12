import { RoomType } from "@/lib/types";
import EditRoomModal from "../modals/room/EditRoomModal";
import { useRouter } from "next/router";
import DeleteRoomModal from "../modals/room/DeleteRoomModal";
import CreateBookingModal from "../modals/booking/CreateBookingModal";

type Props = {
  room: RoomType;
  user_role: "admin" | "user";
};

export default function RoomCard({ room, user_role }: Props) {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };
  return (
    <div
      key={room.id}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-0.5 rounded-md">
            Available
          </span>
          <span className="text-xs text-gray-400 font-mono">ID: {room.id}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
          {room.name}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
          {room.description}
        </p>
      </div>

      <div className="flex gap-2 mt-8 pt-4 border-t border-gray-50">
        {/*<button className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold py-2.5 rounded-xl transition duration-200 shadow-md shadow-red-600/5">
          Book Room
        </button>*/}

        <CreateBookingModal roomName={room.name} roomId={room.id} />

        {user_role === "admin" ? (
          <div className="flex gap-2">
            <EditRoomModal room={room} onRoomUpdated={refreshData} />
            <DeleteRoomModal
              onRoomDeleted={refreshData}
              roomId={room.id}
              roomName={room.name}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
