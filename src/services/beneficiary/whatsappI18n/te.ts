import { waFmt, WhatsAppCopy } from "./types";
import { enCopy } from "./en";

export const teCopy: WhatsAppCopy = {
  ...enCopy,
  quickReplies: [
    { id: "hi", label: "హాయ్", triggers: ["hi", "hello", "hey", "namaste", "namaskar", "హాయ్", "నమస్తే", "నమస్కారం", "ప్రారంభం", "శుభోదయం", "శుభ సాయంత్రం", "start", "good morning", "good evening"] },
    { id: "grievances", label: "నా ఫిర్యాదులు", triggers: ["my grievances", "my grievance", "నా ఫిర్యాదులు", "నా ఫిర్యాదు", "ఫిర్యాదులు", "ఫిర్యాదు ట్రాక్", "ఫిర్యాదు స్థితి", "ఫిర్యాదుల జాబితా", "track grievance", "all grievances", "list grievances", "my complaints"] },
    { id: "submit", label: "ఫిర్యాదు సమర్పించండి", triggers: ["submit grievance", "ఫిర్యాదు సమర్పించండి", "కొత్త ఫిర్యాదు", "ఫిర్యాదు దాఖలు", "file grievance", "new grievance", "report issue"] },
    { id: "child", label: "నా బిడ్డ", triggers: ["my child", "నా బిడ్డ", "బిడ్డ", "పిల్లలు", "ఆరోగ్యం", "హాజరు", "టీకా", "వృద్ధి", "child", "aarav", "priya", "vaccination", "attendance"] },
    { id: "nutrition", label: "పోషణ / భోజనం", triggers: ["nutrition / meals", "పోషణ / భోజనం", "పోషణ", "భోజనం", "ఆహారం", "గుడ్డు", "రేషన్", "nutrition", "meal", "food", "menu"] },
    { id: "help", label: "సహాయం", triggers: ["help", "సహాయం", "మెనూ", "support", "options"] },
  ],
  greetingFallback: "తల్లి/తండ్రి",
  childFallback: "మీ బిడ్డ",
  centerFallback: "మీ కేంద్రం",
  welcome: ({ name, childName, centerName, count }) =>
    waFmt(
      `నమస్తే {name}! 🙏\n\n*AnganSakti 360 WhatsApp సపోర్ట్*కు స్వాగతం — WDCW, ఆంధ్ర ప్రదేశ్ ప్రభుత్వం అధికారిక ఛానల్.\n\nనేను మీకు సహాయం చేయగలను:\n• మీ అన్ని ఫిర్యాదులు & వివరాలు\n• {childName} వృద్ధి, టీకాలు & హాజరు\n• {centerName}లో పోషణ & అంగన్‌వాడీ సేవలు\n• కేంద్ర సమయాలు మరియు సంప్రదింపు\n\n` +
        (count > 0 ? `మీకు *{count}* ఫిర్యాదు(లు) నమోదు. అన్నీ చూడటానికి *నా ఫిర్యాదులు* నొక్కండి.\n\n` : "") +
        `*హాయ్* టైప్ చేయండి లేదా క్విక్ రిప్లై నొక్కండి.`,
      { name, childName, centerName, count }
    ),
  emptyPrompt: "దయచేసి మీ ప్రశ్న టైప్ చేయండి లేదా క్విక్ రిప్లై నొక్కండి. సహాయానికి సిద్ధంగా ఉన్నాను! 😊",
  hiReply: ({ name, count, childName }) =>
    waFmt(
      `హలో {name}! 👋\n\nఈరోజు మీకు ఎలా సహాయం చేయగలను?\n\n1️⃣ *నా ఫిర్యాదులు*{countLine}\n2️⃣ *ఫిర్యాదు సమర్పించండి*\n3️⃣ *నా బిడ్డ* — {childName}\n4️⃣ *పోషణ / భోజనం*\n5️⃣ *సహాయం*\n\nకేంద్ర సమయాలు, పర్యవేక్షక సంప్రదింపు లేదా ఫిర్యాదు ID అడగవచ్చు.`,
      { name, childName, countLine: count > 0 ? ` (${count} నమోదు)` : "" }
    ),
  grievanceListEmpty: `📋 *మీ ఫిర్యాదులు*\n\nమీ ఖాతాలో ఇంకా ఫిర్యాదులు లేవు.\n\n*ఫిర్యాదు సమర్పించండి* నొక్కండి. పర్యవేక్షకుడు *48 గంటల్లో* తనిఖీ చేస్తారు.`,
  grievanceListHeader: ({ count, exampleId }) =>
    waFmt(`📋 *మీ ఫిర్యాదులు* ({count})\n\n*వివరాలు చూడండి* నొక్కండి — లేదా ID టైప్ చేయండి (ఉదా. {exampleId}).`, { count, exampleId }),
  grievanceDetailTitle: "📄 *ఫిర్యాదు వివరాలు*",
  grievanceNotFound: ({ id }) => waFmt(`ఫిర్యాదు *{id}* కనుగొనబడలేదు. *నా ఫిర్యాదులు* నొక్కండి.`, { id }),
  submitGrievance: `📝 *ఫిర్యాదు సమర్పించండి*\n\n1. AnganSakti యాప్ → *ఫిర్యాదు సమర్పించండి*\n2. వర్గం ఎంచుకోండి\n3. తెలుగు/హిందీ/ఇంగ్లీష్‌లో వాయిస్\n4. *అనామకంగా* సమర్పించవచ్చు\n\n*రవి కుమార్ · పర్యవేక్షకుడు*కు వెళ్తుంది. *48 గంటల్లో* స్పందన.`,
  childNoData: `👶 *నా బిడ్డ*\n\nయాప్ → *మీ బిడ్డ గురించి తెలుసుకోండి*`,
  childSummary: (p) => {
    let t = waFmt(
      `👶 *{name}* · వయస్సు {age}\nకేంద్రం: *{center}*\n\n📊 *గత {days} రోజులు:*\n• హాజరు: *{attended}*, లేరు {absent}\n• భోజనాలు: *{mealDays}* రోజులు\n• టీకాలు: *{vaccinesDone} పూర్తి*{dueLine}\n\nయాప్ → *మీ బిడ్డ గురించి తెలుసుకోండి*`,
      { ...p, dueLine: p.vaccinesDue > 0 ? `, ${p.vaccinesDue} బాకీ` : "" }
    );
    if (p.siblings) t += waFmt(`\n\nఇంకా నమోదు: *{siblings}*`, { siblings: p.siblings });
    return t;
  },
  nutrition: (p) => {
    let t = waFmt(
      `🍽️ *పోషణ & భోజనం · {center}*\n\nనేటి మెనూ: అన్నం, పప్పు, కూరగాయలు & గుడ్డు\n• వేడి భోజనం (11:30 AM)\n• ఇంటి రేషన్ (శుక్రవారం)\n• {child} వృద్ధి పర్యవేక్షణ\n\nకార్యకర్త: *లక్ష్మీ దేవి* · 9 AM – 2 PM`,
      { center: p.center, child: p.child }
    );
    if (p.hasOpen && p.openId) {
      t += waFmt(`\n\n⚠️ తెరిచి ఉన్న పోషణ ఫిర్యాదు:\n*{openId}* — {openTitle}\nస్థితి: *{openStatus}*`, {
        openId: p.openId,
        openTitle: p.openTitle ?? "",
        openStatus: p.openStatus ?? "",
      });
    } else t += `\n\nభోజనం లేకపోతే *ఫిర్యాదు సమర్పించండి* లేదా *నా ఫిర్యాదులు*.`;
    return t;
  },
  center: ({ name, code }) =>
    waFmt(`🏫 *{name}*\n\nకోడ్: {code}\nజిల్లా: తిరుపతి\nకార్యకర్త: *లక్ష్మీ దేవి*\nపర్యవేక్షకుడు: *రవి కుమార్*\n\n⏰ *9:00 AM – 2:00 PM* (సోమ–శని)`, { name, code }),
  supervisor: ({ count }) =>
    `👮 *పర్యవేక్షక సంప్రదింపు*\n\n*రవి కుమార్ · పర్యవేక్షకుడు*\nహెల్ప్‌లైన్: 181` + (count > 0 ? `\n\nమీకు *${count}* కేసు(లు) — *నా ఫిర్యాదులు* నొక్కండి.` : ""),
  worker: ({ center }) => waFmt(`👩‍🏫 *లక్ష్మీ దేవి* — {center}\nకేంద్రంలో 9 AM – 2 PM`, { center }),
  anonymous: `🔒 *అనామక సమర్పణ*\n\nమీ గుర్తింపు ఫీల్డ్ సిబ్బందికి కనిపించదు.`,
  help: `🆘 *సహాయ మెనూ*\n\n• *నా ఫిర్యాదులు*\n• *ఫిర్యాదు సమర్పించండి*\n• *నా బిడ్డ*\n• *పోషణ / భోజనం*\n\nఫిర్యాదు ID టైప్ చేయండి. అత్యవసరం: *181*`,
  thanks: `స్వాగతం! 🙏 ఎప్పుడైనా సందేశం పంపండి.`,
  fallback: ({ count, childName }) =>
    waFmt(`ఫిర్యాదులు, బిడ్డ, పోషణ, కేంద్ర సమాచారంలో సహాయం చేయగలను.\n\n• *నా ఫిర్యాదులు* ({count})\n• *నా బిడ్డ* — {childName}\n• *పోషణ / భోజనం*\n\n*181* కాల్ చేయండి.`, { count, childName }),
  detailLabels: {
    status: "స్థితి",
    category: "వర్గం",
    priority: "ప్రాధాన్యత",
    center: "కేంద్రం",
    village: "గ్రామం",
    submitted: "సమర్పించిన తేదీ",
    submittedBy: "సమర్పించినవారు",
    anonymousBy: "అనామక పౌరుడు",
    supervisor: "పర్యవేక్షకుడు",
    expectedResolution: "అంచనా పరిష్కారం",
    latestUpdate: "తాజా నవీకరణ",
    resolution: "పరిష్కారం",
    description: "వివరణ",
  },
  statusLabels: {
    supervisor_review: "పర్యవేక్షక సమీక్ష",
    ai_processing: "AI ప్రాసెసింగ్",
    beneficiary_confirmation: "మీ నిర్ధారణ కోసం",
    worker_response: "కార్యకర్త స్పందన",
    closed: "మూసివేయబడింది",
    rejected: "తిరస్కరించబడింది",
    escalation: "ఎస్కలేషన్",
    resolved: "పరిష్కరించబడింది",
  },
  categoryLabels: {
    nutrition_quality: "పోషణ నాణ్యత",
    hot_cooked_meals: "వేడి భోజనం",
    education: "విద్య",
    child_safety: "బాల్య భద్రత",
    infrastructure: "మౌలిక సదుపాయాలు",
    worker_behavior: "కార్యకర్త ప్రవర్తన",
    drinking_water: "తాగునీరు",
    cleanliness: "శుభ్రత",
    attendance: "హాజరు",
    hygiene: "హైజీన్",
    nutrition: "పోషణ",
  },
  priorityLabels: { low: "తక్కువ", medium: "మధ్యస్థ", high: "అధిక", critical: "క్లిష్టమైన", attendance: "హాజరు" },
  ui: {
    headerTitle: "AnganSakti 360 · WDCW",
    online: (count) => `ఆన్‌లైన్ · ప్రభుత్వ ధృవీకరణ · ${count} ఫిర్యాదు(లు)`,
    typing: "టైప్ చేస్తోంది…",
    demoBanner: "🔒 డెమో సిమ్యులేషన్ · అధికారిక WDCW WhatsApp ఛానల్",
    typeMessage: "సందేశం టైప్ చేయండి",
    viewDetails: "వివరాలు చూడండి",
    openFullPage: "పూర్తి పేజీ తెరవండి",
    trackTimeline: "టైమ్‌లైన్ ట్రాక్ చేయండి",
    anonymousTag: "అనామకం",
    back: "వెనుకకు",
  },
};
