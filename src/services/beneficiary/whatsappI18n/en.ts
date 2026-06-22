import { waFmt, WhatsAppCopy } from "./types";

export const enCopy: WhatsAppCopy = {
  quickReplies: [
    { id: "hi", label: "Hi", triggers: ["hi", "hello", "hey", "namaste", "namaskar", "start", "good morning", "good evening"] },
    {
      id: "grievances",
      label: "My grievances",
      triggers: [
        "my grievances",
        "my grievance",
        "track grievance",
        "track grievances",
        "all grievances",
        "list grievances",
        "show grievances",
        "my complaints",
        "complaint list",
        "grievance status",
        "track status",
      ],
    },
    {
      id: "submit",
      label: "Submit grievance",
      triggers: ["submit grievance", "file grievance", "new grievance", "register grievance", "report issue", "file complaint"],
    },
    {
      id: "child",
      label: "My child",
      triggers: ["my child", "child", "aarav", "priya", "growth", "vaccination", "attendance", "milestone", "my kid", "baby"],
    },
    {
      id: "nutrition",
      label: "Nutrition / meals",
      triggers: ["nutrition / meals", "nutrition", "meal", "meals", "food", "egg", "rice", "ration", "thr", "lunch", "menu"],
    },
    { id: "help", label: "Help", triggers: ["help", "support", "menu", "options", "what can you do"] },
  ],
  greetingFallback: "Parent",
  childFallback: "your child",
  centerFallback: "your center",
  defaultSupervisor: "Ravi Kumar · Supervisor",
  welcome: ({ name, childName, centerName, count }) =>
    waFmt(
      `Namaste {name}! 🙏\n\n` +
        `Welcome to *AnganSakti 360 WhatsApp Support* — official channel of WDCW, Government of Andhra Pradesh.\n\n` +
        `I can help you with:\n` +
        `• View all your grievances & details\n` +
        `• {childName}'s growth, vaccination & attendance\n` +
        `• Nutrition & Anganwadi services at {centerName}\n` +
        `• Center timings and contact\n\n` +
        (count > 0 ? `You have *{count}* grievance(s) on record. Tap *My grievances* to see all.\n\n` : "") +
        `Type *Hi* or tap a quick reply below.`,
      { name, childName, centerName, count }
    ),
  emptyPrompt: "Please type your question or tap a quick reply. I'm here to help! 😊",
  hiReply: ({ name, count, childName }) =>
    waFmt(
      `Hello {name}! 👋\n\n` +
        `How can I help you today?\n\n` +
        `1️⃣ *My grievances*{countLine}\n` +
        `2️⃣ *Submit grievance* — file a new complaint\n` +
        `3️⃣ *My child* — {childName} progress & health\n` +
        `4️⃣ *Nutrition / meals* — today's menu & ration\n` +
        `5️⃣ *Help* — all support options\n\n` +
        `You can also ask: center timings, supervisor contact, or type a Grievance ID.`,
      { name, childName, countLine: count > 0 ? ` (${count} on file)` : "" }
    ),
  grievanceListEmpty:
    `📋 *Your Grievances*\n\n` +
    `No grievances found for your account yet.\n\n` +
    `Tap *Submit grievance* to file a new complaint with photo/voice evidence. Supervisor will investigate within *48 hours*.`,
  grievanceListHeader: ({ count, exampleId }) =>
    waFmt(
      `📋 *Your Grievances* ({count})\n\n` +
        `Tap *View details* on any card below — or type a Grievance ID (e.g. {exampleId}).`,
      { count, exampleId }
    ),
  grievanceDetailTitle: "📄 *Grievance Details*",
  grievanceNotFound: ({ id }) =>
    waFmt(`Grievance *{id}* was not found in your account. Tap *My grievances* to see your complaints.`, { id }),
  submitGrievance:
    `📝 *Submit Grievance*\n\n` +
    `To file a grievance with photo/voice evidence:\n` +
    `1. Open AnganSakti app → *Submit Grievance*\n` +
    `2. Choose category (nutrition, safety, worker, etc.)\n` +
    `3. Add description — voice in Telugu/Hindi/English\n` +
    `4. Optional: submit *anonymously*\n\n` +
    `Your grievance goes to *Ravi Kumar · Supervisor* for AI investigation. Expected response within *48 hours*.`,
  childNoData:
    `👶 *My Child*\n\n` + `Open the app → *Know About Your Child* for growth, vaccination, attendance, and milestones.`,
  childSummary: ({ name, age, center, days, attended, absent, mealDays, vaccinesDone, vaccinesDue, siblings }) => {
    let t =
      waFmt(
        `👶 *{name}* · Age {age}\n` +
          `Center: *{center}*\n\n` +
          `📊 *Last {days} days:*\n` +
          `• Attendance: *{attended} present*, {absent} absent\n` +
          `• Nutrition meals received: *{mealDays}* days\n` +
          `• Vaccination: *{vaccinesDone} done*{dueLine}\n\n` +
          `View full records in app → *Know About Your Child*`,
        {
          name,
          age,
          center,
          days,
          attended,
          absent,
          mealDays,
          vaccinesDone,
          dueLine: vaccinesDue > 0 ? `, ${vaccinesDue} due` : "",
        }
      );
    if (siblings) t += waFmt(`\n\nAlso enrolled: *{siblings}*`, { siblings });
    return t;
  },
  nutrition: ({ center, child, openId, openTitle, openStatus, hasOpen }) => {
    let t =
      waFmt(
        `🍽️ *Nutrition & Meals · {center}*\n\n` +
          `Today's typical menu: Rice, dal, vegetables & egg\n` +
          `• Hot cooked meal (11:30 AM)\n` +
          `• Take-home ration (THR) on Fridays\n` +
          `• Growth monitoring for {child}\n\n` +
          `Worker: *Lakshmi Devi* · Timings: 9:00 AM – 2:00 PM`,
        { center, child }
      );
    if (hasOpen && openId) {
      t += waFmt(
        `\n\n⚠️ You have an open nutrition grievance:\n*{openId}* — {openTitle}\nStatus: *{openStatus}*\nType the ID for full details.`,
        { openId, openTitle: openTitle ?? "", openStatus: openStatus ?? "" }
      );
    } else {
      t += `\n\nIf meals were not served, tap *Submit grievance* or type *My grievances*.`;
    }
    return t;
  },
  center: ({ name, code }) =>
    waFmt(
      `🏫 *{name}*\n\n` +
        `Code: {code}\n` +
        `District: Tirupati · Mandal: Tirupati Urban\n` +
        `Anganwadi Worker: *Lakshmi Devi*\n` +
        `Supervisor: *Ravi Kumar · Supervisor*\n\n` +
        `⏰ Timings: *9:00 AM – 2:00 PM* (Mon–Sat)\n` +
        `Services: Preschool (ECCE), hot meals, growth monitoring, immunization`,
      { name, code }
    ),
  supervisor: ({ count }) =>
    `👮 *Supervisor Contact*\n\n` +
    `Block supervisor: *Ravi Kumar · Supervisor*\n` +
    `District: Tirupati · WDCW, Andhra Pradesh\n` +
    `Helpline: 181 (Childline)\n\n` +
    `All grievances are reviewed with AI-assisted investigation.` +
    (count > 0 ? ` You have *${count}* active case(s) — tap *My grievances* to view.` : ""),
  worker: ({ center }) =>
    waFmt(
      `👩‍🏫 *Anganwadi Worker*\n\n` +
        `*Lakshmi Devi* — {center}\n` +
        `Phone: Available at center (9 AM – 2 PM)\n\n` +
        `For worker-related complaints, tap *Submit grievance* → category *Worker behaviour*.`,
      { center }
    ),
  anonymous:
    `🔒 *Anonymous Submission*\n\n` +
    `Check *Anonymous Submission* in Submit Grievance — your identity is hidden from field staff. Supervisors investigate using evidence and Grievance ID only.`,
  help:
    `🆘 *Help Menu*\n\n` +
    `• *My grievances* — list all & view details\n` +
    `• *Submit grievance* — new complaint with evidence\n` +
    `• *My child* — growth, vaccination, attendance\n` +
    `• *Nutrition / meals* — menu & ration info\n` +
    `• Center timings · Supervisor contact\n\n` +
    `Type any Grievance ID (e.g. GRV-240001) for instant status.\n` +
    `Urgent child safety: call *181*`,
  thanks: `You're welcome! 🙏 Message anytime for Anganwadi services or grievances.`,
  fallback: ({ count, childName }) =>
    waFmt(
      `I can help with grievances, child progress, nutrition, and center info.\n\n` +
        `Try:\n` +
        `• *My grievances* — see all {count} complaint(s)\n` +
        `• *My child* — {childName} attendance & health\n` +
        `• *Nutrition / meals* — today's menu\n` +
        `• Type a Grievance ID (e.g. GRV-240001)\n\n` +
        `Urgent child safety: call *181*.`,
      { count, childName }
    ),
  detailLabels: {
    status: "Status",
    category: "Category",
    priority: "Priority",
    center: "Center",
    village: "Village",
    submitted: "Submitted",
    submittedBy: "Submitted by",
    anonymousBy: "Submitted by: Anonymous citizen",
    supervisor: "Supervisor",
    expectedResolution: "Expected resolution",
    latestUpdate: "Latest update",
    resolution: "Resolution",
    description: "Description",
  },
  statusLabels: {
    supervisor_review: "Supervisor review",
    ai_processing: "AI processing",
    beneficiary_confirmation: "Awaiting your confirmation",
    worker_response: "Worker response",
    closed: "Closed",
    rejected: "Rejected",
    escalation: "Escalation",
    resolved: "Resolved",
  },
  categoryLabels: {
    nutrition_quality: "Nutrition quality",
    hot_cooked_meals: "Hot cooked meals",
    education: "Education",
    child_safety: "Child safety",
    infrastructure: "Infrastructure",
    worker_behavior: "Worker behaviour",
    drinking_water: "Drinking water",
    cleanliness: "Cleanliness",
    attendance: "Attendance",
    hygiene: "Hygiene",
    nutrition: "Nutrition",
  },
  priorityLabels: {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    attendance: "Attendance",
  },
  ui: {
    headerTitle: "AnganSakti 360 · WDCW",
    online: (count) => `online · Government verified · ${count} grievance(s)`,
    typing: "typing…",
    demoBanner: "🔒 Demo simulation · Official WDCW WhatsApp channel",
    typeMessage: "Type a message",
    viewDetails: "View details",
    openFullPage: "Open full page",
    trackTimeline: "Track timeline",
    anonymousTag: "Anonymous",
    back: "Back",
  },
};
