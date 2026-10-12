import { RoomType } from "@/lib/types";
import RoomCard from "./RoomCard";

type Props = {
  rooms: RoomType[];
  user_role: "admin" | "user";
};

export default function AllRooms({ rooms, user_role }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room: RoomType) => (
        <RoomCard key={room.id} room={room} user_role={user_role} />
      ))}
    </div>
  );
}
