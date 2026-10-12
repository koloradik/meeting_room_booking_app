import * as Dialog from "@radix-ui/react-dialog";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";

interface RoomFormData {
  name: string;
  description: string;
}

interface CreateRoomModalProps {
  onRoomCreated?: () => void;
}

export default function CreateRoomModal({
  onRoomCreated,
}: CreateRoomModalProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RoomFormData>();

  const onSubmit: SubmitHandler<RoomFormData> = async (data) => {
    setServerError("");
    try {
      const response = await axios.post("/api/rooms", data);

      if (response.status === 200 || response.status === 201) {
        reset();
        router.reload();
        setOpen(false);
        if (onRoomCreated) onRoomCreated();
      }
    } catch (error: any) {
      console.error("Failed to create room:", error);
      setServerError(
        error.response?.data?.error ||
          "Something went wrong. Please try again.",
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
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition duration-200 shadow-md shadow-red-600/10">
          <Plus className="w-4 h-4" />
          <span>Create Room</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] z-50 focus:outline-none">
          <Dialog.Title className="text-lg font-bold text-gray-900 tracking-tight">
            Create Meeting Room
          </Dialog.Title>

          <Dialog.Description className="mt-1 text-xs text-gray-500 mb-6">
            Fill in the details below to add a new workspace to the platform.
          </Dialog.Description>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                Room Name
              </label>
              <input
                type="text"
                placeholder="Conference Room Alpha"
                {...register("name", { required: "Room name is required" })}
                className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200 placeholder-gray-400"
              />
              {errors.name && (
                <span className="text-xs text-red-500 block">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                Description
              </label>
              <textarea
                placeholder="Located on the 2nd floor, equipped with a 4K display and whiteboard..."
                rows={3}
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                })}
                className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200 placeholder-gray-400 resize-none"
              />
              {errors.description && (
                <span className="text-xs text-red-500 block">
                  {errors.description.message}
                </span>
              )}
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
                {isSubmitting ? "Creating..." : "Create Room"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
