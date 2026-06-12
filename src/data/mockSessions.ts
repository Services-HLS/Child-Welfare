import { SessionRecording, TrainingModule } from "@/types/session";

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "TM-STORY-01",
    title: "Ask Prediction Questions During Storytelling",
    description: "Increase child participation during story sessions with prediction and follow-up questions",
    durationMinutes: 35,
    category: "storytelling",
  },
  { id: "TM-ENG-01", title: "Circle Time Engagement", description: "Build inclusive group participation", durationMinutes: 25, category: "engagement" },
  { id: "TM-PLAY-02", title: "Play-Based Learning", description: "Structured play for ages 3-6", durationMinutes: 30, category: "engagement" },
  { id: "TM-SPEECH-01", title: "Clear Communication", description: "Pace, tone, and Telugu-English balance", durationMinutes: 20, category: "communication" },
  { id: "TM-NUM-01", title: "Foundational Numeracy", description: "Counting and number sense activities", durationMinutes: 35, category: "curriculum" },
  { id: "TM-LANG-02", title: "Phonemic Awareness", description: "Rhymes and sound games", durationMinutes: 28, category: "curriculum" },
  { id: "TM-COACH-03", title: "Peer Coaching Basics", description: "Reflective practice with supervisor", durationMinutes: 40, category: "coaching" },
  { id: "TM-MENTOR-01", title: "Mentorship Pathway", description: "Supported improvement plan", durationMinutes: 60, category: "coaching" },
  { id: "TM-CLASSROOM-04", title: "Classroom Management", description: "Transitions, materials, time use", durationMinutes: 45, category: "management" },
  { id: "TM-BEST-01", title: "Best Practice Showcase", description: "Exemplar session recordings", durationMinutes: 15, category: "general" },
];

export const mockSessionRecordings: SessionRecording[] = [
  {
    id: "SES-001",
    metadata: {
      workerId: "W-1042",
      workerName: "Lakshmi Devi",
      centerId: "AWC-TPT-01",
      centerName: "Alipiri Center",
      timestamp: ago(48),
      sessionType: "Preschool Morning",
      gps: { lat: 13.6288, lng: 79.4192 },
      ageGroup: "3-6",
      syllabusCategory: "language",
      durationMinutes: 18,
    },
    status: "completed",
    uploadProgress: 100,
    synced: true,
    createdAt: ago(48),
    processedAt: ago(47),
    scorecard: {
      teachingEffectiveness: 0.82,
      childEngagement: 0.78,
      communication: 0.85,
      activityCompliance: 0.8,
      classroomManagement: 0.76,
      overallPerformanceIndex: 0.8,
      band: "green",
      bodyLanguage: { teacherEngagement: 0.84, movementScore: 0.8, postureConfidence: 0.82, interactionQuality: 0.81 },
      childEngagementDetail: { attentive: 14, participating: 8, distracted: 3, inactive: 2, absent: 1, estimatedPresent: 28 },
      speech: { clarity: 0.86, pace: 0.82, confidence: 0.88, emotionalTone: 0.8, languageAppropriateness: 0.85 },
      syllabus: { curriculumMatch: 0.82, activitySequenceScore: 0.78, topicsCovered: ["Greetings", "Rhymes"], gaps: [] },
      classroomQuality: { activityCompletion: 0.85, materialUsage: 0.8, timeUtilization: 0.75, inclusiveness: 0.82, participationBalance: 0.78 },
      supportiveRecommendations: ["Strong session — share techniques at cluster meeting."],
      trainingModuleIds: ["TM-BEST-01"],
    },
  },
];
