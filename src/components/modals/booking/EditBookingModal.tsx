import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface BookingData {
  id: string;
  roomId: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface EditBookingModalProps {
  booking: BookingData;
  onBookingUpdated: () => void;
}

interface EditBookingFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function EditBookingModal({
  booking,
  onBookingUpdated,
}: EditBookingModalProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const getInitialDateTime = (isoString: string) => {
    const dateObj = new Date(isoString);
    const date = dateObj.toISOString().split("T")[0];
    const time = dateObj.toTimeString().substring(0, 5);
    return { date, time };
  };

  const startInfo = getInitialDateTime(booking.startTime);
  const endInfo = getInitialDateTime(booking.endTime);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<EditBookingFormData>({
    defaultValues: {
      title: booking.title,
      date: startInfo.date,
      startTime: startInfo.time,
      endTime: endInfo.time,
    },
  });

  useEffect(() => {
    if (open) {
      const s = getInitialDateTime(booking.startTime);
      const e = getInitialDateTime(booking.endTime);
      reset({
        title: booking.title,
        date: s.date,
        startTime: s.time,
        endTime: e.time,
      });
    }
  }, [open, booking, reset]);

  const onSubmit: SubmitHandler<EditBookingFormData> = async (data) => {
    setServerError("");

    const startLocal = new Date(`${data.date}T${data.startTime}`);
    const endLocal = new Date(`${data.date}T${data.endTime}`);

    if (startLocal >= endLocal) {
      setServerError("End time must be after start time.");
      return;
    }

    try {
      const payload = {
        roomId: booking.roomId,
        title: data.title,
        startTime: startLocal.toISOString(),
        endTime: endLocal.toISOString(),
      };

      const response = await axios.put(`/api/bookings/${booking.id}`, payload);

      if (response.status === 200) {
        setOpen(false);
        onBookingUpdated();
      }
    } catch (error: any) {
      console.error("Booking update error:", error);
      setServerError(
        error.response?.data?.error ||
          "Failed to update booking. Possible time conflict.",
      );
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
          className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200/60 transition"
        >
          Edit
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] z-50 focus:outline-none">
          <Dialog.Title className="text-lg font-bold text-gray-900 tracking-tight">
            Edit Meeting Parameters
          </Dialog.Title>

          <Dialog.Description className="text-xs text-gray-500 mt-1 mb-6">
            Modify time slots or meeting purpose. System will automatically
            re-verify conflicts.
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
                {...register("title", { required: "Title is required" })}
                className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200"
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
                  className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                  End Time
                </label>
                <input
                  type="time"
                  {...register("endTime", { required: "Required" })}
                  className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none"
                />
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
                disabled={!isDirty || isSubmitting}
                className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition duration-200 shadow-md shadow-red-600/5 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
