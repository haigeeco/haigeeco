"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Button, Modal } from "./ui";

interface DialogState {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string | null;
  destructive: boolean;
  resolve: (ok: boolean) => void;
}

interface FeedbackApi {
  confirm: (options: {
    title?: string;
    message: string;
    confirmLabel?: string;
    destructive?: boolean;
  }) => Promise<boolean>;
  notify: (options: { title?: string; message: string }) => void;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const dialogRef = useRef<DialogState | null>(null);

  const close = useCallback((ok: boolean) => {
    const current = dialogRef.current;
    dialogRef.current = null;
    setDialog(null);
    current?.resolve(ok);
  }, []);

  const confirm = useCallback<FeedbackApi["confirm"]>(
    (options) =>
      new Promise<boolean>((resolve) => {
        const state: DialogState = {
          title: options.title ?? "Konfirmasi",
          message: options.message,
          confirmLabel: options.confirmLabel ?? "Lanjutkan",
          cancelLabel: "Batal",
          destructive: options.destructive ?? false,
          resolve,
        };
        dialogRef.current = state;
        setDialog(state);
      }),
    []
  );

  const notify = useCallback<FeedbackApi["notify"]>((options) => {
    const state: DialogState = {
      title: options.title ?? "Informasi",
      message: options.message,
      confirmLabel: "Tutup",
      cancelLabel: null,
      destructive: false,
      resolve: () => {},
    };
    dialogRef.current = state;
    setDialog(state);
  }, []);

  return (
    <FeedbackContext.Provider value={{ confirm, notify }}>
      {children}
      <Modal
        open={dialog !== null}
        title={dialog?.title ?? ""}
        onClose={() => close(false)}
        footer={
          dialog ? (
            <>
              {dialog.cancelLabel ? (
                <Button variant="secondary" onClick={() => close(false)}>
                  {dialog.cancelLabel}
                </Button>
              ) : null}
              <Button
                variant={dialog.destructive ? "danger" : "primary"}
                onClick={() => close(true)}
              >
                {dialog.confirmLabel}
              </Button>
            </>
          ) : null
        }
      >
        <p className="whitespace-pre-line text-sm text-slate-600">{dialog?.message}</p>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackApi {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback harus dipakai di dalam FeedbackProvider");
  return context;
}
