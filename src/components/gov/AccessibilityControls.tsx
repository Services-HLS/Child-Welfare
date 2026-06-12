import { useEffect, useState } from "react";
import { Type, Contrast } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccessibilityControls({ variant = "header" }: { variant?: "header" | "login" }) {
  const [largeText, setLargeText] = useState(() => localStorage.getItem("gov-a11y-large") === "1");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("gov-a11y-contrast") === "1");

  useEffect(() => {
    document.documentElement.classList.toggle("gov-text-lg", largeText);
    document.documentElement.classList.toggle("gov-high-contrast", highContrast);
    localStorage.setItem("gov-a11y-large", largeText ? "1" : "0");
    localStorage.setItem("gov-a11y-contrast", highContrast ? "1" : "0");
  }, [largeText, highContrast]);

  const btn = variant === "header"
    ? "rounded border border-white/20 px-2 py-1 text-[10px] font-semibold text-white/90 hover:bg-white/10"
    : "rounded border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50";

  return (
    <div className="flex items-center gap-1">
      <button type="button" className={cn(btn, largeText && "bg-white/15")} onClick={() => setLargeText((v) => !v)} title="Larger text">
        <Type className="h-3.5 w-3.5 inline mr-0.5" /> A+
      </button>
      <button type="button" className={cn(btn, highContrast && "bg-white/15")} onClick={() => setHighContrast((v) => !v)} title="High contrast">
        <Contrast className="h-3.5 w-3.5 inline mr-0.5" />
      </button>
    </div>
  );
}
