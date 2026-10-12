import { BookingType } from "@/lib/types";
import { Calendar, Clock } from "lucide-react";
import { useRouter } from "next/router";
import AddMemberModal from "./modals/booking/AddMemberModal";
import CancelBookingModal from "./modals/booking/CancelBookingModal";
import EditBookingModal from "./modals/booking/EditBookingModal";

type Props = {
  booking: BookingType;
};

export default function BookingCard({ booking }: Props) {
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  const router = useRouter();

  const formattedDate = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = `${startDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} - ${endDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
  return (
    <div
      key={booking.id}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border-l-4 border-l-red-600 flex flex-col justify-between hover:shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:border-gray-200 transition-all duration-200"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formattedDate}</span>
          </div>

          <span
            className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md `}
          >
            <p>Room id:</p>
            {booking.roomId}
          </span>
        </div>

        <h4 className="text-base font-bold text-gray-900 tracking-tight mb-4">
          {booking.title}
        </h4>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <Clock className="w-4 h-4 text-red-500" />
          <span>{formattedTime}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <EditBookingModal
            onBookingUpdated={() => router.reload()}
            booking={booking}
          />
          <CancelBookingModal
            bookingId={booking.id}
            bookingTitle={booking.title}
            onBookingCancelled={() => router.reload()}
          />
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Attendees
          </span>

          <AddMemberModal bookingId={booking.id} bookingTitle={booking.title} />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto py-0.5">
          {booking.members && booking.members.length > 0 ? (
            booking.members.map((member) => {
              return (
                <div
                  key={member.uid}
                  className={`px-2 rounded-full text-sm border border-white font-bold flex items-center justify-center transition-transform ${
                    member.role === "admin"
                      ? "bg-red-50 text-red-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {member.email}
                </div>
              );
            })
          ) : (
            <span className="text-xs text-gray-400 italic">Just you</span>
          )}
        </div>
      </div>
    </div>
  );
}
