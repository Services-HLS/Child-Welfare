import { useApp } from "@/context/AppContext";
import { Lang } from "@/types/platform";
import { cn } from "@/lib/utils";

const langs: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "te", label: "తెలుగు", short: "తె" },
  { id: "hi", label: "हिन्दी", short: "हि" },
];

export function LangToggle({ variant = "default" }: { variant?: "default" | "gov" | "light" }) {
  const { lang, setLang } = useApp();
  const isGov = variant === "gov";
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 p-0.5",
        isGov && "border border-white/20 bg-white/5",
        isLight && "border border-slate-300 bg-white rounded-sm",
        !isGov && !isLight && "rounded-full border border-white/10 bg-white/5"
      )}
      role="group"
      aria-label="Language"
    >
      {langs.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => setLang(l.id)}
          title={l.label}
          className={cn(
            "px-2 py-0.5 text-[10px] font-semibold transition-colors",
            (isGov || isLight) ? "rounded-sm" : "rounded-full",
            lang === l.id
              ? "bg-[#1e3a5f] text-white"
              : isGov
                ? "text-white/75 hover:text-white hover:bg-white/10"
                : isLight
                  ? "text-slate-600 hover:bg-slate-100"
                  : "text-slate-400 hover:text-white"
          )}
        >
          {(isGov || isLight) ? l.label : l.short}
        </button>
      ))}
    </div>
  );
}
