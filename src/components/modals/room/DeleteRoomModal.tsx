import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteRoomModalProps {
  roomId: string;
  roomName: string;
  onRoomDeleted: () => void;
}

export default function DeleteRoomModal({
  roomId,
  roomName,
  onRoomDeleted,
}: DeleteRoomModalProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setServerError("");

    try {
      const response = await axios.delete(`/api/rooms/${roomId}`);

      if (response.status === 200) {
        setOpen(false);
        onRoomDeleted();
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      setServerError(error.response?.data?.error || "Failed to delete room.");
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
          className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-200 transition duration-200"
          title="Delete Room"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] z-50 focus:outline-none">
          <Dialog.Title className="text-lg font-bold text-gray-900 tracking-tight">
            Delete Workspace?
          </Dialog.Title>

          <Dialog.Description className="text-xs text-gray-500 mt-1 mb-5 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{roomName}"</span>?
            This action is permanent and all data associated with this room will
            be lost.
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
                Cancel
              </button>
            </Dialog.Close>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition duration-200 shadow-md shadow-red-600/5 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
