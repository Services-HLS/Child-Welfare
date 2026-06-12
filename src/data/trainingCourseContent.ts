import { TRAINING_MODULES } from "@/data/mockSessions";
import { SessionRecording } from "@/types/session";
import {
  TrainingCourseContent,
  TrainingCourseContext,
} from "@/types/training-course";

function moduleMeta(moduleId: string) {
  return TRAINING_MODULES.find((m) => m.id === moduleId) ?? TRAINING_MODULES[0];
}

function contextFromSession(
  session: SessionRecording | undefined,
  fallbackIssue: string
): TrainingCourseContext {
  const ext = session?.extractedAnalysis;
  const sc = session?.scorecard;
  const engagement =
    ext?.engagementPercent ??
    (sc ? Math.round(sc.childEngagement * 100) : undefined);
  return {
    issueIdentified: fallbackIssue,
    observationSummary:
      ext?.engagementSummary ??
      sc?.supportiveRecommendations?.[0] ??
      "Classroom observation noted opportunity to strengthen interactive storytelling and participation.",
    expectedImprovement:
      "Increase attentive participation by 10–15% within the next two story sessions.",
    learningObjectives: [
      "Ask prediction questions before turning each page",
      "Use follow-up questions so children explain their ideas",
      "Combine voice, gesture, and movement during narration",
    ],
    relatedSessionId: session?.id,
    relatedSessionLabel: session
      ? `${session.metadata.sessionType} · ${new Date(session.metadata.timestamp).toLocaleDateString()}`
      : undefined,
    engagementBefore: engagement ?? 68,
    engagementAfter: engagement ? Math.min(92, engagement + 14) : 82,
  };
}

const STORY_COURSE: Omit<TrainingCourseContent, "moduleId"> = {
  title: "Ask Prediction Questions During Storytelling",
  subtitle: "Government coaching module · Preschool language & engagement",
  estimatedMinutes: 35,
  expectedImpact: "Child participation during storytelling expected to rise 10–15%",
  category: "storytelling",
  context: {
    issueIdentified:
      "Low child participation during storytelling — many children listened passively without answering questions.",
    observationSummary:
      "During the Nakka–Tabelu (Fox & Tortoise) session, children remained attentive but few responded aloud. The teacher narrated well; interactive pauses were limited.",
    expectedImprovement:
      "After this module, workers should see more children predicting story events and answering follow-up questions each session.",
    learningObjectives: [
      "Pause before each page turn and ask “What will happen next?”",
      "Invite 2–3 children to answer using names",
      "Repeat correct ideas in simple Telugu/English",
      "Use hand actions when animals move or speak",
    ],
    engagementBefore: 68,
    engagementAfter: 82,
  },
  learnBlocks: [
    {
      id: "problem",
      title: "What was observed in your classroom",
      body:
        "When storytelling is mostly one-way narration, preschool children may listen quietly without participating. This is common and fixable. Your session recording showed good story delivery with limited call-and-response moments.",
      examples: [
        "Children looked at the teacher but did not raise hands",
        "Story pacing was steady; pauses for questions were short",
      ],
    },
    {
      id: "why",
      title: "Why participation matters",
      body:
        "Prediction questions build language, attention, and confidence. Andhra Pradesh ECCE guidelines encourage interactive story time for ages 3–6. Small changes in questioning can improve syllabus coverage without adding extra time.",
    },
    {
      id: "good",
      title: "What good practice looks like",
      body:
        "Effective Anganwadi storytelling includes short questions, waiting time for answers, praise for effort, and simple gestures. You do not need a perfect answer — trying is success.",
      examples: [
        "“ఈ పేజీ తిప్చే ముందు — తర్వాత ఏమి జరుగుతుంది?”",
        "“Who can show me how the tortoise walks?”",
        "Child answers → teacher repeats → continues story",
      ],
    },
    {
      id: "steps",
      title: "Practical steps for your next session",
      body:
        "1) Plan three prediction stops in a 15-minute story. 2) Use names to invite answers. 3) Add one movement activity linked to the story animal. 4) Note which children still need encouragement and pair them with a peer.",
    },
  ],
  videos: [
    {
      id: "demo-1",
      title: "Demonstration: Prediction questions in storytelling",
      description: "Supervisor coaching clip — Alipiri cluster exemplar",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      durationMinutes: 8,
      keyTakeaways: [
        "Pause before page turns",
        "Ask open questions, not only yes/no",
        "Praise every attempt",
      ],
      summary:
        "Watch how the worker asks two prediction questions and one movement prompt during a Telugu story.",
    },
    {
      id: "demo-2",
      title: "Body movement during animal stories",
      description: "Short practice reference for ages 3–6",
      durationMinutes: 5,
      keyTakeaways: [
        "Use large gestures children can copy",
        "Link movement to story events",
      ],
      summary: "Movement keeps energy high without losing story focus.",
    },
  ],
  practiceTasks: [
    {
      id: "record-story",
      title: "Record a 2-minute storytelling segment",
      instructions:
        "Record yourself asking at least two prediction questions. Upload or note completion — retry allowed.",
      tips: [
        "Face the children in semi-circle",
        "Speak slowly before each question",
        "Wait 5 seconds for answers",
      ],
      evidenceOptional: true,
    },
    {
      id: "movement",
      title: "Demonstrate one animal movement",
      instructions:
        "Practice tortoise walk and fox movement with voice change. Mark done when comfortable.",
      tips: ["Keep movements safe in small rooms", "Invite children to copy"],
    },
  ],
  quiz: [
    {
      id: "q1",
      type: "multiple_choice",
      prompt: "When should you ask a prediction question during storytelling?",
      options: [
        "Only at the end of the story",
        "Before turning the page or at a story pause",
        "While children are eating",
        "After children leave",
      ],
      correctIndex: 1,
      explanation: "Prediction works best at natural pauses before the next event.",
    },
    {
      id: "q2",
      type: "scenario",
      prompt: "A child gives a wrong prediction. What do you do?",
      options: [
        "Stop the story and correct harshly",
        "Ignore the child",
        "Thank them, gently guide, and continue",
        "End the session",
      ],
      correctIndex: 2,
      explanation: "Encourage effort — correct softly and keep flow.",
    },
    {
      id: "q3",
      type: "classroom_decision",
      prompt: "Only 2 of 12 children answer questions. Best next step?",
      options: [
        "Skip questions for the rest of the week",
        "Use names, shorter questions, and pair support",
        "Read faster to finish",
        "Send children home",
      ],
      correctIndex: 1,
      explanation: "Targeted invitations and shorter prompts increase participation.",
    },
    {
      id: "q4",
      type: "multiple_choice",
      prompt: "Good follow-up after a child answers:",
      options: [
        "Repeat their idea in simple words and continue",
        "Say nothing",
        "Switch to numeracy immediately",
        "Only write on blackboard",
      ],
      correctIndex: 0,
      explanation: "Repeating validates participation and reinforces language.",
    },
  ],
  submitPrompts: {
    learned: "What did you learn from this coaching module?",
    willChange: "What will you change in your next storytelling session?",
    engagementPlan: "How will you help quieter children participate?",
  },
  nextModuleIds: ["TM-ENG-01", "TM-LANG-02"],
  certificateTitle: "Interactive Storytelling — Field Completion",
};

function templateCourse(
  moduleId: string,
  ctx: TrainingCourseContext
): TrainingCourseContent {
  const m = moduleMeta(moduleId);
  return {
    moduleId,
    title: m.title,
    subtitle: `Government learning module · ${m.category}`,
    estimatedMinutes: m.durationMinutes,
    expectedImpact: "Supports measurable improvement in classroom delivery over 2–3 sessions",
    category: m.category,
    context: { ...ctx, engagementBefore: ctx.engagementBefore ?? 65, engagementAfter: ctx.engagementAfter ?? 78 },
    learnBlocks: [
      {
        id: "intro",
        title: `Understanding ${m.title}`,
        body: m.description + ". This module connects your recent classroom observation to practical Anganwadi techniques.",
      },
      {
        id: "practice-good",
        title: "What good practice looks like",
        body: "Observe peers, use simple language, and apply one technique per session. Supervisors support — this is coaching, not punishment.",
        examples: [
          "Short activities with clear instructions",
          "Positive reinforcement for children",
          "Consistent daily routine",
        ],
      },
      {
        id: "steps",
        title: "Steps for your next session",
        body: "Review objectives, prepare materials, practice aloud once, deliver with children, and reflect after the session.",
      },
    ],
    videos: [
      {
        id: "v1",
        title: `${m.title} — supervisor overview`,
        description: "Coaching video for Anganwadi workers",
        durationMinutes: Math.min(12, m.durationMinutes),
        keyTakeaways: ["Clear learning goal", "Safe classroom setup", "Track progress"],
        summary: m.description,
      },
    ],
    practiceTasks: [
      {
        id: "p1",
        title: "Apply one technique in class",
        instructions: "Try the main skill from this module in your next session and note what happened.",
        tips: ["Start with a small group", "Retry if first attempt is difficult"],
        evidenceOptional: true,
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: `Main focus of "${m.title}" is:`,
        options: [m.description, "Only paperwork", "Skipping activities", "Closing the center"],
        correctIndex: 0,
        explanation: m.description,
      },
      {
        id: "q2",
        type: "scenario",
        prompt: "Children lose attention mid-activity. You should:",
        options: [
          "Shout louder only",
          "Shorten segment, add movement, re-engage",
          "Cancel ECCE for the day",
          "Ignore",
        ],
        correctIndex: 1,
        explanation: "Re-engagement through movement and shorter segments works for ages 3–6.",
      },
      {
        id: "q3",
        type: "classroom_decision",
        prompt: "After coaching, you should:",
        options: [
          "Apply one change and observe results",
          "Never change practice",
          "Wait one year",
          "Avoid sessions",
        ],
        correctIndex: 0,
        explanation: "Incremental practice builds sustainable improvement.",
      },
    ],
    submitPrompts: {
      learned: "What was the most useful idea from this module?",
      willChange: "What will you do differently next session?",
      engagementPlan: "How will you measure improvement?",
    },
    nextModuleIds: ["TM-BEST-01"],
    certificateTitle: `${m.title} — Completion Certificate`,
  };
}

const COURSE_OVERRIDES: Record<string, Omit<TrainingCourseContent, "moduleId">> = {
  "TM-STORY-01": STORY_COURSE,
};

export function buildTrainingCourseContent(
  moduleId: string,
  options?: {
    session?: SessionRecording;
    reason?: string;
    assignedBy?: "ai" | "supervisor";
  }
): TrainingCourseContent {
  const override = COURSE_OVERRIDES[moduleId];
  const ctx = contextFromSession(
    options?.session,
    options?.reason ?? "Classroom observation identified a coaching opportunity."
  );
  if (override) {
    return {
      moduleId,
      ...override,
      context: {
        ...override.context,
        ...ctx,
        relatedSessionId: ctx.relatedSessionId ?? override.context.relatedSessionId,
        relatedSessionLabel: ctx.relatedSessionLabel ?? override.context.relatedSessionLabel,
      },
    };
  }
  return templateCourse(moduleId, ctx);
}

export function getTrainingModule(moduleId: string) {
  return moduleMeta(moduleId);
}
