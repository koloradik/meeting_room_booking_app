import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { useState } from "react";

interface CancelBookingModalProps {
  bookingId: string;
  bookingTitle: string;
  onBookingCancelled: () => void;
}

export default function CancelBookingModal({
  bookingId,
  bookingTitle,
  onBookingCancelled,
}: CancelBookingModalProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancelBooking = async () => {
    setLoading(true);
    setServerError("");

    try {
      const response = await axios.delete(`/api/bookings/${bookingId}`);

      if (response.status === 200) {
        setOpen(false);
        onBookingCancelled();
      }
    } catch (error: any) {
      console.error("Booking cancellation error:", error);
      setServerError(
        error.response?.data?.error ||
          "Failed to cancel this booking. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setServerError("");
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="text-[11px] font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition duration-200"
        >
          Cancel
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] z-50 focus:outline-none">
          <Dialog.Title className="text-lg font-bold text-gray-900 tracking-tight">
            Cancel Reservation?
          </Dialog.Title>

          <Dialog.Description className="text-xs text-gray-500 mt-1 mb-5 leading-relaxed">
            Are you sure you want to cancel the reservation for{" "}
            <span className="font-semibold text-gray-900">
              "{bookingTitle}"
            </span>
            ? This room slot will become instantly available for other
            employees.
          </Dialog.Description>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium text-center">
              {serverError}
            </div>
          )}

          <div className="pt-4 border-t border-gray-50 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition disabled:opacity-50"
              >
                Go Back
              </button>
            </Dialog.Close>

            <button
              type="button"
              onClick={handleCancelBooking}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition duration-200 shadow-md shadow-red-600/5 disabled:opacity-50"
            >
              {loading ? "Cancelling..." : "Cancel Booking"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
