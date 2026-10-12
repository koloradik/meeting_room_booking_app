import * as Dialog from "@radix-ui/react-dialog";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { useState } from "react";

interface BookingFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface CreateBookingModalProps {
  roomId: string;
  roomName: string;
  onBookingCreated?: () => void;
}

export default function CreateBookingModal({
  roomId,
  roomName,
  onBookingCreated,
}: CreateBookingModalProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookingFormData>();

  const onSubmit: SubmitHandler<BookingFormData> = async (data) => {
    setServerError("");

    const startLocal = new Date(`${data.date}T${data.startTime}`);
    const endLocal = new Date(`${data.date}T${data.endTime}`);

    if (startLocal >= endLocal) {
      setServerError("End time must be strictly after start time.");
      return;
    }

    try {
      const payload = {
        roomId: roomId,
        title: data.title,
        startTime: startLocal.toISOString(),
        endTime: endLocal.toISOString(),
      };

      const response = await axios.post("/api/bookings", payload);

      if (response.status === 200 || response.status === 201) {
        reset();
        setOpen(false);
        if (onBookingCreated) onBookingCreated();
      }
    } catch (error: any) {
      console.error("Failed to create booking:", error);
      setServerError(
        error.response?.data?.error ||
          "This time slot might conflict with an existing booking.",
      );
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) reset();
        setServerError("");
      }}
    >
      <Dialog.Trigger asChild>
        <button className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold py-2.5 rounded-xl transition duration-200 shadow-md shadow-red-600/5">
          Book Room
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] z-50 focus:outline-none">
          <Dialog.Title className="text-lg font-bold text-gray-900 tracking-tight">
            Book "{roomName}"
          </Dialog.Title>

          <Dialog.Description className="text-xs text-gray-500 mt-1 mb-6">
            Enter meeting details and select a clear time slot below.
          </Dialog.Description>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                Meeting Title
              </label>
              <input
                type="text"
                placeholder="Project Sync / Sprint Planning"
                {...register("title", {
                  required: "Meeting title is required",
                })}
                className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200 placeholder-gray-400"
              />
              {errors.title && (
                <span className="text-xs text-red-500 block">
                  {errors.title.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]} // Ограничиваем выбор прошедших дат
                {...register("date", { required: "Date is required" })}
                className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200"
              />
              {errors.date && (
                <span className="text-xs text-red-500 block">
                  {errors.date.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                  Start Time
                </label>
                <input
                  type="time"
                  {...register("startTime", { required: "Required" })}
                  className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200"
                />
                {errors.startTime && (
                  <span className="text-xs text-red-500 block">
                    {errors.startTime.message}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                  End Time
                </label>
                <input
                  type="time"
                  {...register("endTime", { required: "Required" })}
                  className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200"
                />
                {errors.endTime && (
                  <span className="text-xs text-red-500 block">
                    {errors.endTime.message}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition duration-200 disabled:opacity-50"
              >
                {isSubmitting ? "Booking..." : "Create Booking"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
