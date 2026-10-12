import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface AddMemberFormData {
  email: string;
  role: "admin" | "user";
}

interface AddMemberModalProps {
  bookingId: string;
  bookingTitle: string;
  onMemberAdded?: () => void;
}

export default function AddMemberModal({
  bookingId,
  bookingTitle,
  onMemberAdded,
}: AddMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddMemberFormData>({
    defaultValues: {
      role: "user",
    },
  });

  const onSubmit: SubmitHandler<AddMemberFormData> = async (data) => {
    setServerError("");
    setServerSuccess("");

    try {
      const response = await axios.post(`/api/bookings/${bookingId}/members`, {
        email: data.email,
        role: data.role,
      });

      if (response.status === 200 || response.status === 201) {
        setServerSuccess("Employee successfully invited to this meeting!");
        reset();

        setTimeout(() => {
          setOpen(false);
          setServerSuccess("");
          if (onMemberAdded) onMemberAdded();
        }, 800);
      }
    } catch (error: any) {
      console.error("Add member error:", error);
      setServerError(
        error.response?.data?.error ||
          "Failed to invite user. Make sure the email is correct.",
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
        setServerSuccess("");
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-500 transition"
        >
          <Plus className="w-3 h-3" />
          <span>Add user</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] z-50 focus:outline-none">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="w-5 h-5 text-red-500" />
            <Dialog.Title className="text-lg font-bold text-gray-900 tracking-tight">
              Invite Attendee
            </Dialog.Title>
          </div>

          <Dialog.Description className="text-xs text-gray-500 mb-6">
            Add a colleague to{" "}
            <span className="font-semibold text-gray-900">
              "{bookingTitle}"
            </span>{" "}
            by entering their registered email address.
          </Dialog.Description>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium text-center">
              {serverError}
            </div>
          )}
          {serverSuccess && (
            <div className="mb-4 rounded-xl bg-green-50 border border-green-100 p-3 text-xs text-green-600 font-medium text-center">
              {serverSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                Colleague's Email
              </label>
              <input
                type="email"
                placeholder="co-worker@company.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200 placeholder-gray-400"
              />
              {errors.email && (
                <span className="text-xs text-red-500 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                Room Access Role
              </label>
              <select
                {...register("role", { required: true })}
                className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="user">User (View and attend only)</option>
                <option value="admin">Admin (Full management rights)</option>
              </select>
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
                {isSubmitting ? "Inviting..." : "Add to Meeting"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
