import { BookingType } from "@/lib/types";
import axios from "axios";
import { useEffect, useState } from "react";
import BookingCard from "../BookingCard";

export default function MyBooking() {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyBookings() {
      try {
        const response = await axios.get("/api/user/my_bookings");
        if (response.data && Array.isArray(response.data)) {
          setBookings(response.data);
        }
      } catch (error) {
        console.error("Failed to load my bookings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyBookings();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-48 bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)]"
          />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-8">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-gray-400 text-lg">📅</span>
        </div>
        <p className="text-sm font-medium text-gray-900">
          No upcoming bookings
        </p>
        <p className="text-xs text-gray-400 mt-1">
          You haven't reserved any rooms for today.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookings.map((booking) => {
        return <BookingCard booking={booking} key={booking.id} />;
      })}
    </div>
  );
}
