"use client";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Hapus",
  cancelText = "Batal",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-5 text-red-600">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">{description}</p>
        
        <div className="flex items-center justify-center gap-3 w-full mt-2">
          <Button
            variant="outline"
            className="flex-1 font-medium bg-white hover:bg-slate-50"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent font-medium disabled:bg-red-400 disabled:opacity-100"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Memproses..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
