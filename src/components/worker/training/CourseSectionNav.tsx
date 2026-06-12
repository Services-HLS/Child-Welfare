import { COURSE_SECTION_ORDER, CourseSectionId } from "@/types/training-course";
import { canAccessSection } from "@/services/worker/trainingCourseService";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  Dumbbell,
  HelpCircle,
  Send,
  Award,
} from "lucide-react";

const LABELS: Record<CourseSectionId, string> = {
  overview: "Overview",
  learn: "Learn",
  watch: "Watch",
  practice: "Practice",
  quiz: "Quiz",
  submit: "Submit",
  result: "Result",
};

const ICONS: Record<CourseSectionId, typeof BookOpen> = {
  overview: LayoutDashboard,
  learn: BookOpen,
  watch: PlayCircle,
  practice: Dumbbell,
  quiz: HelpCircle,
  submit: Send,
  result: Award,
};

export function CourseSectionNav({
  current,
  completed,
  onSelect,
}: {
  current: CourseSectionId;
  completed: CourseSectionId[];
  onSelect: (s: CourseSectionId) => void;
}) {
  return (
    <nav className="space-y-1" aria-label="Course sections">
      {COURSE_SECTION_ORDER.map((section) => {
        const Icon = ICONS[section];
        const done = completed.includes(section);
        const active = current === section;
        const allowed = canAccessSection(section, completed) || done || active;
        return (
          <button
            key={section}
            type="button"
            disabled={!allowed}
            onClick={() => allowed && onSelect(section)}
            className={cn(
              "w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors",
              active && "bg-[#1e3a5f] text-white",
              !active && done && "bg-emerald-50 text-emerald-900 border border-emerald-200",
              !active && !done && allowed && "text-slate-700 hover:bg-slate-100",
              !allowed && "text-slate-300 cursor-not-allowed"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{LABELS[section]}</span>
            {done && <span className="text-[10px]">✓</span>}
          </button>
        );
      })}
    </nav>
  );
}
