import * as Dialog from "@radix-ui/react-dialog";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";

interface RoomData {
  id: string;
  name: string;
  description: string;
}

interface EditRoomModalProps {
  room: RoomData;
  onRoomUpdated: () => void;
}

interface EditRoomFormData {
  name: string;
  description: string;
}

export default function EditRoomModal({
  room,
  onRoomUpdated,
}: EditRoomModalProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<EditRoomFormData>({
    defaultValues: {
      name: room.name,
      description: room.description,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: room.name,
        description: room.description,
      });
    }
  }, [open, room, reset]);

  const onSubmit: SubmitHandler<EditRoomFormData> = async (data) => {
    setServerError("");
    try {
      const response = await axios.put(`/api/rooms/${room.id}`, data);

      if (response.status === 200) {
        setOpen(false);
        onRoomUpdated();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      setServerError(error.response?.data?.error || "Failed to update room.");
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
          className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition duration-200"
          title="Edit Room"
        >
          <Settings className="w-4 h-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] z-50 focus:outline-none">
          <Dialog.Title className="text-lg font-bold text-gray-900 tracking-tight">
            Room Settings
          </Dialog.Title>

          <Dialog.Description className="text-xs text-gray-500 mb-6">
            Modify the room details below. Changes will apply immediately.
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
                {...register("name", { required: "Room name is required" })}
                className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200"
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
                rows={3}
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Must be at least 10 characters",
                  },
                })}
                className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200 resize-none"
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
                disabled={!isDirty || isSubmitting}
                className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition duration-200 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
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
