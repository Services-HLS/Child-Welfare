import { waFmt, WhatsAppCopy } from "./types";
import { enCopy } from "./en";

export const hiCopy: WhatsAppCopy = {
  ...enCopy,
  quickReplies: [
    { id: "hi", label: "नमस्ते", triggers: ["hi", "hello", "hey", "namaste", "namaskar", "नमस्ते", "हेलो", "हाय", "शुरू", "सुप्रभात", "शुभ संध्या", "start", "good morning", "good evening"] },
    { id: "grievances", label: "मेरी शिकायतें", triggers: ["my grievances", "my grievance", "मेरी शिकायतें", "मेरी शिकायत", "शिकायतें", "शिकायत ट्रैक", "शिकायत स्थिति", "track grievance", "all grievances", "list grievances", "my complaints"] },
    { id: "submit", label: "शिकायत दर्ज करें", triggers: ["submit grievance", "शिकायत दर्ज करें", "नई शिकायत", "शिकायत दाखिल", "file grievance", "new grievance", "report issue"] },
    { id: "child", label: "मेरा बच्चा", triggers: ["my child", "मेरा बच्चा", "बच्चा", "बच्चे", "स्वास्थ्य", "उपस्थिति", "टीका", "विकास", "child", "aarav", "priya", "vaccination", "attendance"] },
    { id: "nutrition", label: "पोषण / भोजन", triggers: ["nutrition / meals", "पोषण / भोजन", "पोषण", "भोजन", "खाना", "अंडा", "राशन", "nutrition", "meal", "food", "menu"] },
    { id: "help", label: "सहायता", triggers: ["help", "सहायता", "मेनू", "support", "options"] },
  ],
  greetingFallback: "अभिभावक",
  childFallback: "आपका बच्चा",
  centerFallback: "आपका केंद्र",
  welcome: ({ name, childName, centerName, count }) =>
    waFmt(
      `नमस्ते {name}! 🙏\n\n*AnganSakti 360 WhatsApp सहायता* में स्वागत है — WDCW, आंध्र प्रदेश सरकार का आधिकारिक चैनल।\n\nमैं मदद कर सकता/सकती हूँ:\n• आपकी सभी शिकायतें और विवरण\n• {childName} की वृद्धि, टीकाकरण और उपस्थिति\n• {centerName} में पोषण और आंगनवाड़ी सेवाएँ\n• केंद्र का समय और संपर्क\n\n` +
        (count > 0 ? `आपकी *{count}* शिकायत(एँ) दर्ज हैं। *मेरी शिकायतें* टैप करें।\n\n` : "") +
        `*नमस्ते* टाइप करें या क्विक रिप्लाई टैप करें।`,
      { name, childName, centerName, count }
    ),
  emptyPrompt: "कृपया अपना प्रश्न टाइप करें या क्विक रिप्लाई टैप करें। मैं मदद के लिए तैयार हूँ! 😊",
  hiReply: ({ name, count, childName }) =>
    waFmt(
      `नमस्ते {name}! 👋\n\nआज मैं कैसे मदद करूँ?\n\n1️⃣ *मेरी शिकायतें*{countLine}\n2️⃣ *शिकायत दर्ज करें*\n3️⃣ *मेरा बच्चा* — {childName}\n4️⃣ *पोषण / भोजन*\n5️⃣ *सहायता*\n\nकेंद्र समय, पर्यवेक्षक संपर्क या शिकायत ID पूछ सकते हैं।`,
      { name, childName, countLine: count > 0 ? ` (${count} दर्ज)` : "" }
    ),
  grievanceListEmpty: `📋 *आपकी शिकायतें*\n\nअभी कोई शिकायत नहीं है।\n\n*शिकायत दर्ज करें* टैप करें। पर्यवेक्षक *48 घंटे* में जाँच करेंगे।`,
  grievanceListHeader: ({ count, exampleId }) =>
    waFmt(`📋 *आपकी शिकायतें* ({count})\n\n*विवरण देखें* टैप करें — या ID टाइप करें (जैसे {exampleId})।`, { count, exampleId }),
  grievanceDetailTitle: "📄 *शिकायत विवरण*",
  grievanceNotFound: ({ id }) => waFmt(`शिकायत *{id}* नहीं मिली। *मेरी शिकायतें* टैप करें।`, { id }),
  submitGrievance: `📝 *शिकायत दर्ज करें*\n\n1. AnganSakti ऐप → *शिकायत दर्ज करें*\n2. श्रेणी चुनें\n3. तेलुगु/हिंदी/अंग्रेज़ी में वॉइस\n4. *गुमनाम* दर्ज कर सकते हैं\n\n*रवि कुमार · पर्यवेक्षक* को जाती है। *48 घंटे* में प्रतिक्रिया।`,
  childNoData: `👶 *मेरा बच्चा*\n\nऐप → *अपने बच्चे के बारे में जानें*`,
  childSummary: (p) => {
    let t = waFmt(
      `👶 *{name}* · उम्र {age}\nकेंद्र: *{center}*\n\n📊 *पिछले {days} दिन:*\n• उपस्थिति: *{attended}*, अनुपस्थित {absent}\n• भोजन: *{mealDays}* दिन\n• टीकाकरण: *{vaccinesDone} पूर्ण*{dueLine}\n\nऐप → *अपने बच्चे के बारे में जानें*`,
      { ...p, dueLine: p.vaccinesDue > 0 ? `, ${p.vaccinesDue} बाकी` : "" }
    );
    if (p.siblings) t += waFmt(`\n\nयह भी नामांकित: *{siblings}*`, { siblings: p.siblings });
    return t;
  },
  nutrition: (p) => {
    let t = waFmt(
      `🍽️ *पोषण और भोजन · {center}*\n\nमेनू: चावल, दाल, सब्ज़ियाँ और अंडा\n• गर्म भोजन (11:30 AM)\n• घर राशन (शुक्रवार)\n• {child} की वृद्धि निगरानी\n\nकार्यकर्ता: *लक्ष्मी देवी* · 9 AM – 2 PM`,
      { center: p.center, child: p.child }
    );
    if (p.hasOpen && p.openId) {
      t += waFmt(`\n\n⚠️ खुली पोषण शिकायत:\n*{openId}* — {openTitle}\nस्थिति: *{openStatus}*`, {
        openId: p.openId,
        openTitle: p.openTitle ?? "",
        openStatus: p.openStatus ?? "",
      });
    } else t += `\n\nभोजन न मिला तो *शिकायत दर्ज करें* या *मेरी शिकायतें*।`;
    return t;
  },
  center: ({ name, code }) =>
    waFmt(`🏫 *{name}*\n\nकोड: {code}\nज़िला: तिरुपति\nकार्यकर्ता: *लक्ष्मी देवी*\nपर्यवेक्षक: *रवि कुमार*\n\n⏰ *9:00 AM – 2:00 PM* (सोम–शनि)`, { name, code }),
  supervisor: ({ count }) =>
    `👮 *पर्यवेक्षक संपर्क*\n\n*रवि कुमार · पर्यवेक्षक*\nहेल्पलाइन: 181` + (count > 0 ? `\n\nआपके *${count}* मामले — *मेरी शिकायतें* टैप करें।` : ""),
  worker: ({ center }) => waFmt(`👩‍🏫 *लक्ष्मी देवी* — {center}\nकेंद्र पर 9 AM – 2 PM`, { center }),
  anonymous: `🔒 *गुमनाम दर्ज*\n\nआपकी पहचान फ़ील्ड स्टाफ से छिपी रहती है।`,
  help: `🆘 *सहायता मेनू*\n\n• *मेरी शिकायतें*\n• *शिकायत दर्ज करें*\n• *मेरा बच्चा*\n• *पोषण / भोजन*\n\nशिकायत ID टाइप करें। अत्यावश्यक: *181*`,
  thanks: `आपका स्वागत है! 🙏 कभी भी संदेश भेजें।`,
  fallback: ({ count, childName }) =>
    waFmt(`शिकायत, बच्चा, पोषण, केंद्र जानकारी में मदद कर सकता/सकती हूँ।\n\n• *मेरी शिकायतें* ({count})\n• *मेरा बच्चा* — {childName}\n• *पोषण / भोजन*\n\n*181* कॉल करें।`, { count, childName }),
  detailLabels: {
    status: "स्थिति",
    category: "श्रेणी",
    priority: "प्राथमिकता",
    center: "केंद्र",
    village: "गाँव",
    submitted: "दर्ज तिथि",
    submittedBy: "दर्ज करने वाले",
    anonymousBy: "गुमनाम नागरिक",
    supervisor: "पर्यवेक्षक",
    expectedResolution: "अपेक्षित समाधान",
    latestUpdate: "नवीनतम अपडेट",
    resolution: "समाधान",
    description: "विवरण",
  },
  statusLabels: {
    supervisor_review: "पर्यवेक्षक समीक्षा",
    ai_processing: "AI प्रसंस्करण",
    beneficiary_confirmation: "आपकी पुष्टि की प्रतीक्षा",
    worker_response: "कार्यकर्ता प्रतिक्रिया",
    closed: "बंद",
    rejected: "अस्वीकृत",
    escalation: "एस्केलेशन",
    resolved: "समाधान",
  },
  categoryLabels: {
    nutrition_quality: "पोषण गुणवत्ता",
    hot_cooked_meals: "गर्म पका भोजन",
    education: "शिक्षा",
    child_safety: "बाल सुरक्षा",
    infrastructure: "अवसंरचना",
    worker_behavior: "कार्यकर्ता व्यवहार",
    drinking_water: "पीने का पानी",
    cleanliness: "स्वच्छता",
    attendance: "उपस्थिति",
    hygiene: "स्वच्छता",
    nutrition: "पोषण",
  },
  priorityLabels: { low: "कम", medium: "मध्यम", high: "उच्च", critical: "गंभीर", attendance: "उपस्थिति" },
  ui: {
    headerTitle: "AnganSakti 360 · WDCW",
    online: (count) => `ऑनलाइन · सरकारी सत्यापित · ${count} शिकायत(एँ)`,
    typing: "टाइप कर रहा है…",
    demoBanner: "🔒 डेमो सिमुलेशन · आधिकारिक WDCW WhatsApp चैनल",
    typeMessage: "संदेश टाइप करें",
    viewDetails: "विवरण देखें",
    openFullPage: "पूर्ण पेज खोलें",
    trackTimeline: "टाइमलाइन ट्रैक करें",
    anonymousTag: "गुमनाम",
    back: "वापस",
  },
};
