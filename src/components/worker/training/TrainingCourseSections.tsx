import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrainingCourseContent,
  TrainingCourseProgress,
  CourseSectionId,
} from "@/types/training-course";
import { MIN_QUIZ_SCORE } from "@/services/worker/trainingCourseService";
import { timelineSteps } from "@/services/worker/trainingCourseService";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Play, Bookmark, CheckCircle2, Award } from "lucide-react";

export function CourseOverviewSection({
  content,
  onContinue,
}: {
  content: TrainingCourseContent;
  onContinue: () => void;
}) {
  const { context: ctx } = content;
  return (
    <div className="space-y-5">
      <div className="border-l-4 border-[#1e3a5f] bg-slate-50 p-4 rounded-r-lg">
        <h2 className="text-lg font-bold text-[#0F172A]">Why this training was assigned</h2>
        <p className="text-sm text-slate-700 mt-2">{ctx.issueIdentified}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="worker-card p-4">
          <p className="text-[10px] font-bold uppercase text-slate-500">AI / supervisor observation</p>
          <p className="text-sm mt-1">{ctx.observationSummary}</p>
        </div>
        <div className="worker-card p-4">
          <p className="text-[10px] font-bold uppercase text-slate-500">Expected improvement</p>
          <p className="text-sm mt-1 text-emerald-800 font-medium">{ctx.expectedImprovement}</p>
        </div>
      </div>
      <div className="worker-card p-4">
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Learning objectives</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          {ctx.learningObjectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>
      {ctx.relatedSessionId && (
        <Link
          to={`/worker/session-feedback/${ctx.relatedSessionId}`}
          className="inline-flex text-sm font-bold text-[#1e40af] underline"
        >
          Open related session summary →
        </Link>
      )}
      <button type="button" onClick={onContinue} className="gov-btn-primary text-sm">
        Begin learning →
      </button>
    </div>
  );
}

export function CourseLearnSection({
  content,
  onContinue,
}: {
  content: TrainingCourseContent;
  onContinue: () => void;
}) {
  const [open, setOpen] = useState<string | null>(content.learnBlocks[0]?.id ?? null);
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Structured guidance in simple language for Anganwadi practice.</p>
      {content.learnBlocks.map((block) => {
        const isOpen = open === block.id;
        return (
          <div key={block.id} className="worker-card overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 text-left"
              onClick={() => setOpen(isOpen ? null : block.id)}
            >
              <span className="font-bold text-[#0F172A]">{block.title}</span>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed mt-3">{block.body}</p>
                {block.examples && (
                  <ul className="mt-3 text-sm space-y-2 bg-blue-50 rounded-lg p-3 list-disc pl-5">
                    {block.examples.map((ex) => (
                      <li key={ex}>{ex}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
      <button type="button" onClick={onContinue} className="gov-btn-primary text-sm">
        Continue to Watch →
      </button>
    </div>
  );
}

export function CourseWatchSection({
  content,
  progress,
  onUpdate,
  onContinue,
}: {
  content: TrainingCourseContent;
  progress: TrainingCourseProgress;
  onUpdate: (patch: Partial<TrainingCourseProgress>) => void;
  onContinue: () => void;
}) {
  const [activeVideo, setActiveVideo] = useState(content.videos[0]?.id);
  const video = content.videos.find((v) => v.id === activeVideo) ?? content.videos[0];
  const speeds = [0.75, 1, 1.25, 1.5];

  const markWatched = () => {
    if (!video || progress.watch.completedVideoIds.includes(video.id)) return;
    onUpdate({
      watch: {
        ...progress.watch,
        completedVideoIds: [...progress.watch.completedVideoIds, video.id],
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {content.videos.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActiveVideo(v.id)}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg border",
              activeVideo === v.id ? "bg-[#1e3a5f] text-white" : "bg-white"
            )}
          >
            {v.title}
          </button>
        ))}
      </div>
      {video && (
        <>
          <div className="aspect-video rounded-xl bg-black overflow-hidden relative">
            {video.embedUrl ? (
              <iframe
                title={video.title}
                src={video.embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/80 p-6 text-center">
                <Play className="h-12 w-12 mb-2" />
                <p className="text-sm font-bold">{video.title}</p>
                <p className="text-xs mt-2">{video.description}</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-500">Speed</span>
            {speeds.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdate({ watch: { ...progress.watch, playbackSpeed: s } })}
                className={cn(
                  "text-xs px-2 py-1 rounded border",
                  progress.watch.playbackSpeed === s && "bg-[#1e40af] text-white"
                )}
              >
                {s}x
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                onUpdate({
                  watch: {
                    ...progress.watch,
                    bookmarks: [...progress.watch.bookmarks, Date.now()],
                  },
                })
              }
              className="gov-btn-outline text-xs flex items-center gap-1 ml-auto"
            >
              <Bookmark className="h-3.5 w-3.5" /> Bookmark
            </button>
            <button type="button" onClick={markWatched} className="gov-btn-primary text-xs">
              Mark lesson watched
            </button>
          </div>
          <textarea
            className="w-full border rounded-lg p-3 text-sm min-h-[80px]"
            placeholder="Lesson notes (saved automatically)…"
            value={progress.watch.notes}
            onChange={(e) => onUpdate({ watch: { ...progress.watch, notes: e.target.value } })}
          />
          <div className="worker-card p-4">
            <p className="text-[10px] font-bold uppercase text-slate-500">Key takeaways</p>
            <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
              {video.keyTakeaways.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
            <p className="text-sm text-slate-600 mt-3 border-t pt-3">{video.summary}</p>
          </div>
        </>
      )}
      <button
        type="button"
        onClick={onContinue}
        disabled={progress.watch.completedVideoIds.length < 1}
        className="gov-btn-primary text-sm disabled:opacity-40"
      >
        Continue to Practice →
      </button>
    </div>
  );
}

export function CoursePracticeSection({
  content,
  progress,
  onUpdate,
  onContinue,
}: {
  content: TrainingCourseContent;
  progress: TrainingCourseProgress;
  onUpdate: (patch: Partial<TrainingCourseProgress>) => void;
  onContinue: () => void;
}) {
  const toggleTask = (taskId: string) => {
    const ids = progress.practice.completedTaskIds;
    const next = ids.includes(taskId) ? ids.filter((x) => x !== taskId) : [...ids, taskId];
    onUpdate({
      practice: {
        ...progress.practice,
        completedTaskIds: next,
        attempts: progress.practice.attempts + (ids.includes(taskId) ? 0 : 1),
        lastAttemptAt: new Date().toISOString(),
      },
    });
  };

  const allDone = content.practiceTasks.every((t) => progress.practice.completedTaskIds.includes(t.id));

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Apply what you learned — practical tasks with retry support.</p>
      {content.practiceTasks.map((task) => {
        const done = progress.practice.completedTaskIds.includes(task.id);
        return (
          <div key={task.id} className={cn("worker-card p-4 border-2", done && "border-emerald-300 bg-emerald-50/50")}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold">{task.title}</h3>
              {done && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            </div>
            <p className="text-sm mt-2">{task.instructions}</p>
            <ul className="text-xs text-slate-600 mt-2 list-disc pl-4">
              {task.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            {task.evidenceOptional && (
              <input
                type="file"
                accept="video/*,image/*"
                className="mt-3 text-xs w-full"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f)
                    onUpdate({
                      practice: { ...progress.practice, evidenceFileName: f.name },
                    });
                }}
              />
            )}
            <button type="button" onClick={() => toggleTask(task.id)} className="gov-btn-outline text-xs mt-3">
              {done ? "Retry task" : "Mark practice complete"}
            </button>
          </div>
        );
      })}
      <textarea
        className="w-full border rounded-lg p-3 text-sm"
        placeholder="Practice reflection (auto-saved)…"
        value={progress.practice.notes}
        onChange={(e) => onUpdate({ practice: { ...progress.practice, notes: e.target.value } })}
      />
      <button type="button" onClick={onContinue} disabled={!allDone} className="gov-btn-primary text-sm disabled:opacity-40">
        Continue to Quiz →
      </button>
    </div>
  );
}

export function CourseQuizSection({
  content,
  progress,
  onUpdate,
  onContinue,
}: {
  content: TrainingCourseContent;
  progress: TrainingCourseProgress;
  onUpdate: (patch: Partial<TrainingCourseProgress>) => void;
  onContinue: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>(progress.quiz?.answers ?? {});
  const [submitted, setSubmitted] = useState(!!progress.quiz?.passed);

  const submit = () => {
    let correct = 0;
    content.quiz.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / content.quiz.length) * 100);
    const passed = score >= MIN_QUIZ_SCORE;
    onUpdate({
      quiz: {
        answers,
        score,
        passed,
        completedAt: new Date().toISOString(),
      },
    });
    setSubmitted(true);
  };

  const score = progress.quiz?.score;

  return (
    <div className="space-y-4">
      {content.quiz.map((q, qi) => (
        <div key={q.id} className="worker-card p-4">
          <p className="text-[10px] font-bold uppercase text-slate-500">{q.type.replace("_", " ")}</p>
          <p className="font-bold mt-1">
            {qi + 1}. {q.prompt}
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => (
              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === oi}
                  disabled={submitted && progress.quiz?.passed}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                />
                {opt}
              </label>
            ))}
          </div>
          {submitted && (
            <p
              className={cn(
                "text-xs mt-2 font-medium",
                answers[q.id] === q.correctIndex ? "text-emerald-700" : "text-rose-700"
              )}
            >
              {answers[q.id] === q.correctIndex ? "Correct." : `Explanation: ${q.explanation}`}
            </p>
          )}
        </div>
      ))}
      {!submitted && (
        <button type="button" onClick={submit} className="gov-btn-primary text-sm">
          Submit quiz
        </button>
      )}
      {submitted && progress.quiz && (
        <div className={cn("p-4 rounded-lg border-2", progress.quiz.passed ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50")}>
          <p className="font-bold">Score: {score}% — {progress.quiz.passed ? "Passed" : `Need ${MIN_QUIZ_SCORE}% to continue`}</p>
          {!progress.quiz.passed && (
            <button type="button" onClick={() => setSubmitted(false)} className="gov-btn-outline text-xs mt-2">
              Retry quiz
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onContinue}
        disabled={!progress.quiz?.passed}
        className="gov-btn-primary text-sm disabled:opacity-40"
      >
        Continue to Submit →
      </button>
    </div>
  );
}

export function CourseSubmitSection({
  content,
  progress,
  onUpdate,
  onContinue,
}: {
  content: TrainingCourseContent;
  progress: TrainingCourseProgress;
  onUpdate: (patch: Partial<TrainingCourseProgress>) => void;
  onContinue: () => void;
}) {
  const submit = progress.submit ?? { learned: "", willChange: "", engagementPlan: "", submittedAt: "" };
  const patchSubmit = (field: keyof typeof submit, value: string) => {
    onUpdate({ submit: { ...submit, [field]: value } });
  };
  const ready = submit.learned.length > 20 && submit.willChange.length > 20 && submit.engagementPlan.length > 10;

  const finalize = () => {
    onUpdate({
      submit: { ...submit, submittedAt: new Date().toISOString() },
      lifecycleStatus: "submitted",
    });
    onContinue();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Reflection saved locally — syncs when you are back online.</p>
      {(
        [
          ["learned", content.submitPrompts.learned],
          ["willChange", content.submitPrompts.willChange],
          ["engagementPlan", content.submitPrompts.engagementPlan],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="text-xs font-bold text-slate-700">{label}</label>
          <textarea
            className="w-full border rounded-lg p-3 text-sm mt-1 min-h-[100px]"
            value={submit[key]}
            onChange={(e) => patchSubmit(key, e.target.value)}
          />
        </div>
      ))}
      <button type="button" onClick={finalize} disabled={!ready} className="gov-btn-primary text-sm disabled:opacity-40">
        Submit reflection & view results →
      </button>
    </div>
  );
}

export function CourseResultSection({
  content,
  progress,
  onFinish,
}: {
  content: TrainingCourseContent;
  progress: TrainingCourseProgress;
  onFinish: () => void;
}) {
  const before = content.context.engagementBefore ?? 68;
  const after = content.context.engagementAfter ?? 82;
  const steps = timelineSteps(progress);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center">
        <Award className="h-10 w-10 text-emerald-700 mx-auto" />
        <h2 className="text-xl font-bold text-emerald-900 mt-2">Training Complete</h2>
        <p className="text-sm text-emerald-800 mt-1">{content.certificateTitle}</p>
      </div>

      <div className="worker-card p-4">
        <p className="text-[10px] font-bold uppercase text-slate-500">Before vs after (session data)</p>
        <div className="flex items-end justify-center gap-6 mt-3">
          <div>
            <p className="text-3xl font-black text-slate-400">{before}%</p>
            <p className="text-[10px] uppercase">Engagement before</p>
          </div>
          <span className="text-2xl text-blue-600">→</span>
          <div>
            <p className="text-3xl font-black text-emerald-700">{after}%</p>
            <p className="text-[10px] uppercase">After applying techniques</p>
          </div>
        </div>
        <p className="text-xs text-center text-slate-600 mt-3">
          Example: engagement improved from {before}% to {after}% after prediction questions and movement.
        </p>
      </div>

      <div className="worker-card p-4">
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-3">Training timeline</p>
        <ol className="space-y-2">
          {steps.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-sm">
              <span className={cn("h-2 w-2 rounded-full", s.done ? "bg-emerald-500" : "bg-slate-300")} />
              {s.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="worker-card p-4">
        <p className="text-[10px] font-bold uppercase text-slate-500">Next recommended modules</p>
        <ul className="text-sm mt-2 space-y-1">
          {content.nextModuleIds.map((id) => (
            <li key={id}>
              <Link to={`/worker/training/${id}`} className="text-[#1e40af] font-bold underline">
                {id} →
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <button type="button" onClick={onFinish} className="gov-btn-primary w-full text-sm">
        Save completion & return to dashboard
      </button>
    </div>
  );
}

export function renderCourseSection(
  section: CourseSectionId,
  props: {
    content: TrainingCourseContent;
    progress: TrainingCourseProgress;
    onUpdate: (p: Partial<TrainingCourseProgress>) => void;
    onSectionDone: (next: CourseSectionId) => void;
    onFinish: () => void;
  }
) {
  const go = (next: CourseSectionId) => () => props.onSectionDone(next);

  switch (section) {
    case "overview":
      return <CourseOverviewSection content={props.content} onContinue={go("learn")} />;
    case "learn":
      return <CourseLearnSection content={props.content} onContinue={go("watch")} />;
    case "watch":
      return (
        <CourseWatchSection
          content={props.content}
          progress={props.progress}
          onUpdate={props.onUpdate}
          onContinue={go("practice")}
        />
      );
    case "practice":
      return (
        <CoursePracticeSection
          content={props.content}
          progress={props.progress}
          onUpdate={props.onUpdate}
          onContinue={go("quiz")}
        />
      );
    case "quiz":
      return (
        <CourseQuizSection
          content={props.content}
          progress={props.progress}
          onUpdate={props.onUpdate}
          onContinue={go("submit")}
        />
      );
    case "submit":
      return (
        <CourseSubmitSection
          content={props.content}
          progress={props.progress}
          onUpdate={props.onUpdate}
          onContinue={go("result")}
        />
      );
    case "result":
      return <CourseResultSection content={props.content} progress={props.progress} onFinish={props.onFinish} />;
    default:
      return null;
  }
}
