import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTrainingCourse } from "@/hooks/useTrainingCourse";
import { CourseSectionNav } from "@/components/worker/training/CourseSectionNav";
import { renderCourseSection } from "@/components/worker/training/TrainingCourseSections";
import { CourseSectionId } from "@/types/training-course";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function TrainingCourse() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [search] = useSearchParams();
  const recId = search.get("rec");
  const navigate = useNavigate();

  const {
    content,
    progress,
    section,
    percent,
    update,
    goToSection,
    finishCourse,
    loaded,
  } = useTrainingCourse(moduleId ?? "TM-STORY-01", recId);

  if (!moduleId) {
    return <p className="p-4 text-sm">Module not found.</p>;
  }

  if (!loaded || !progress) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e40af]" />
      </div>
    );
  }

  const handleSectionDone = (next: CourseSectionId) => {
    void goToSection(next, section);
  };

  return (
    <div className="pb-24 w-full min-h-screen bg-slate-50">
      <div className="bg-[#0F172A] text-white px-4 py-4 border-b-4 border-amber-400">
        <Link to="/worker/training" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Training Dashboard
        </Link>
        <p className="text-[10px] font-bold uppercase text-amber-200">WDCW Learning Portal</p>
        <h1 className="text-xl font-bold mt-1">{content.title}</h1>
        <p className="text-sm text-white/85 mt-1">{content.subtitle}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-xs font-bold">{percent}%</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <div className="worker-card p-3 lg:sticky lg:top-4">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-2 px-1">Course navigation</p>
            <CourseSectionNav
              current={section}
              completed={progress.completedSections}
              onSelect={(s) => void goToSection(s)}
            />
          </div>
        </aside>

        <main className="flex-1 worker-card p-5 sm:p-6 min-w-0">
          <h2 className="text-lg font-bold text-[#0F172A] capitalize mb-4">{section}</h2>
          {renderCourseSection(section, {
            content,
            progress,
            onUpdate: (p) => void update(p),
            onSectionDone: handleSectionDone,
            onFinish: () => {
              void finishCourse().then(() => navigate("/worker/training"));
            },
          })}
        </main>
      </div>
    </div>
  );
}
