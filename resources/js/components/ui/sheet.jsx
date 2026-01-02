import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const SheetContext = createContext(null);

export function Sheet({ open: openProp, onOpenChange, children }) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;

  const setOpen = (v) => {
    if (onOpenChange) onOpenChange(v);
    else setOpenState(v);
  };

  const value = useMemo(() => ({ open, setOpen }), [open]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = original);
  }, [open]);

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children }) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("SheetTrigger must be used within Sheet");
  return React.cloneElement(children, {
    onClick: (e) => {
      children.props?.onClick?.(e);
      ctx.setOpen(true);
    },
  });
}

export function SheetClose({ children }) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("SheetClose must be used within Sheet");
  return React.cloneElement(children, {
    onClick: (e) => {
      children.props?.onClick?.(e);
      ctx.setOpen(false);
    },
  });
}

export function SheetContent({ className, children }) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("SheetContent must be used within Sheet");
  const { open, setOpen } = ctx;

  return (
    <>
{open && (
  <div
    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
    onClick={() => setOpen(false)}
  />
)}


<div
  className={cn(
    "fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out",
    open ? "translate-x-0" : "translate-x-full pointer-events-none",
    className
  )}
  role="dialog"
  aria-modal="true"
>

        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="text-sm font-semibold text-slate-900">Your Cart</div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
