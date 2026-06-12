import { PUBLIC_FEEDBACK_SUBMITTER_LABELS, PublicFeedbackSubmitterType } from "@/types/public-context";
import { cn } from "@/lib/utils";
import { Baby, Heart, Users, Building2, UserCircle, HelpCircle } from "lucide-react";

const TYPES: { id: PublicFeedbackSubmitterType; icon: typeof Baby }[] = [
  { id: "parent_caregiver", icon: Baby },
  { id: "pregnant_woman", icon: Heart },
  { id: "lactating_mother", icon: Heart },
  { id: "guardian", icon: Users },
  { id: "citizen_community", icon: Building2 },
  { id: "other_beneficiary", icon: HelpCircle },
];

export function WhoAreYouToday({
  selected,
  onSelect,
}: {
  selected: PublicFeedbackSubmitterType;
  onSelect: (t: PublicFeedbackSubmitterType) => void;
}) {
  return (
    <section className="rounded-2xl border-2 border-[#1e3a5f] bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase text-[#1e40af]">Who Are You Today?</p>
      <p className="text-xs text-slate-600 mt-1 mb-3">
        Personalizes services, benefits, and grievance templates for this session — does not change your account.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TYPES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
              selected === id
                ? "border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-md"
                : "border-slate-200 bg-white hover:border-[#1e40af]"
            )}
          >
            <Icon className={cn("h-5 w-5", selected === id ? "text-amber-200" : "text-[#1e40af]")} />
            <span className="text-[10px] font-bold leading-tight">
              {PUBLIC_FEEDBACK_SUBMITTER_LABELS[id].replace(" / Caregiver", "")}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
