type Props = {
  activeTab: "rooms" | "bookings";
};

export default function DynamicHeader({ activeTab }: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">
        {activeTab === "rooms"
          ? "Available Meeting Rooms"
          : "Your Bookings Schedule"}
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        {activeTab === "rooms"
          ? "Select a workspace below to book or manage team permissions."
          : "Review, edit, or cancel your upcoming room reservations."}
      </p>
    </div>
  );
}
