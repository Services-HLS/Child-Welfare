import { createContext, useContext, useState, ReactNode } from "react";

type TransparencyCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const Ctx = createContext<TransparencyCtx | null>(null);

export function TransparencyProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, setOpen, toggle: () => setOpen((o) => !o) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTransparency() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTransparency requires TransparencyProvider");
  return c;
}
