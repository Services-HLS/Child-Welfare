import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Building2, 
  User, 
  Search,
  MessageSquare,
  X,
  Navigation,
  BookOpen,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SupervisorAuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activities, updateActivity } = useApp();
  const [auditing, setAuditing] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [remark, setRemark] = useState("");

  const activity = activities.find(a => a.id === id);

  if (!activity) return null;

  const runAudit = () => {
    setAuditing(true);
    
    const extractionProfiles: Record<string, { evidence: string[], report: string }> = {
      "Student Attendance": {
        evidence: ["Biometric facial match", "Standard uniform detected", "Digital registry sync"],
        report: `[INFO] Attendance saved: attendance.csv\n\n========== ATTENDANCE REPORT ==========\nTotal Students: 7\nPresent: 7\nAbsent: 0\nUnique unknown persons (approx): 16\nUnknown detections (events): 73\n\nPresent Students:\n1. Adarsh\n2. Ganesh\n3. Gowtham\n4. Pooja\n5. Siva\n6. Rajini\n7. Chaitanya\n\nAbsent Students:\nNone\n=======================================`
      },
      "Nutrition Distribution": {
        evidence: ["Thermal signature: 65°C", "Food grade containers", "Standard portion size"],
        report: `========== NUTRITION AUDIT ==========\nBatch ID: NT-2024-04\nMean Temp: 65.4°C (PASS)\nPortion Volume: 250ml (MATCH)\nHygiene Index: 99.2%\n\nExtraction: Balanced meal with pulses and vegetables identified.\n====================================`
      }
    };

    setTimeout(() => {
      const profile = extractionProfiles[activity.type] || {
        evidence: ["General materials", "Session participants"],
        report: `========== GENERAL AUDIT ==========\nType: ${activity.type}\nStatus: Verified\nConfidence: 98.4%\n====================================`
      };

      const confidence = 0.982 + Math.random() * 0.012;
      
      // Demo Logic: Live Capture (Trigger Failure) vs Local Upload (Trigger Success)
      const isLive = activity.isLiveCapture;
      
      const OFFICIAL_LAT = 13.6288;
      const OFFICIAL_LNG = 79.4192;
      
      // Inverting logic for User Demo:
      // Live Capture -> DISCREPANCY DETECTED
      // Upload -> VERIFIED MATCH
      const isGeoMatch = !isLive;
      const isCountMatch = !isLive;

      const finalConfidence = isLive ? confidence * 0.42 : confidence;

      const result = {
        activityMatch: isLive ? "mismatch" : "match",
        detectedChildren: isLive ? 2 : 7, // 2 unauthorized detected if live
        classroomCheck: { 
          materials: !isLive, 
          seating: !isLive, 
          setup: !isLive 
        },
        specificEvidence: isLive 
          ? ["Unauthorized adult presence", "Non-AWC background", "Zero materials detected"]
          : profile.evidence,
        anomalies: isLive 
          ? ["Unauthorized Personnel Detected", "Severe Geofence Breach", "Compliance Failure"] 
          : [],
        confidence: finalConfidence,
        summary: profile.report,
        isGeoMatch,
        isCountMatch,
        explanation: isLive 
          ? "CRITICAL BIOMETRIC ANOMALY: AI detected 2 unauthorized adults (non-students) within the live frame. Severe geo-fencing violation flagged (1.2km mismatch). Mandatory materials and seating setup are missing from the environment."
          : "GOLD STANDARD: Standard compliance verified. All biometric identities, geofence parameters, and environmental materials match the official Anganwadi registry."
      };

      updateActivity(activity.id, { aiConfidence: finalConfidence, aiResult: result as any });
      setAuditing(false);
      
      if (!isGeoMatch || !isCountMatch) {
        toast.error("Audit Discrepancy Found", { description: "AI detected anomalies in location or headcount." });
      } else {
        toast.success("Neural Extraction Complete", { description: "High-fidelity audit report generated." });
      }
    }, 2500);
  };

  const handleDecision = (status: "approved" | "issue") => {
    updateActivity(activity.id, { 
      status, 
      supervisorRemark: status === "issue" ? remark : undefined 
    });
    toast.success(status === "approved" ? "Submission Approved" : "Issue Flagged");
    if (status === "issue") setShowIssueDialog(false);
    navigate("/supervisor/verifications");
  };

  return (
    <div className="space-y-6 pb-20 w-full max-w-none px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Ledger
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Media View (TOP) */}
        <div className="lg:col-span-12">
          <div className="relative h-[60vh] w-full rounded-[2.5rem] overflow-hidden bg-slate-950 border border-slate-200 shadow-2xl group">
            {activity.imageUrl ? (
              activity.imageUrl.startsWith('data:video') || activity.imageUrl.includes('video') ? (
                <video src={activity.imageUrl} className="h-full w-full object-contain" autoPlay controls loop playsInline />
              ) : (
                <img src={activity.imageUrl} className="h-full w-full object-contain" alt="Evidence" />
              )
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-slate-500">
                <AlertCircle className="h-20 w-20 opacity-20 mb-4" />
                <span className="text-xs font-black uppercase tracking-widest">No Evidence Uploaded</span>
              </div>
            )}
            
            <div className="absolute top-8 left-8 flex items-center gap-3">
              <div className="rounded-full bg-black/60 backdrop-blur-md px-4 py-2 border border-white/20">
                <span className="text-[10px] font-black uppercase text-white tracking-widest">{activity.type}</span>
              </div>
              <div className="rounded-full bg-emerald-500/90 px-4 py-2 text-white">
                <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Actions & Results */}
        <div className="lg:col-span-8 space-y-6">
          {!activity.aiResult ? (
            <div className="rounded-[2.5rem] border-4 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
               <div className="mx-auto h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                  <Sparkles className="h-10 w-10" />
               </div>
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Neural Extraction Pending</h2>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 max-w-sm mx-auto">Run AI analysis to cross-verify biometric identity, student headcount, and geo-location.</p>
               <button 
                 onClick={runAudit} 
                 disabled={auditing}
                 className="h-16 px-12 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center gap-4 mx-auto active:scale-95 disabled:opacity-50"
               >
                 {auditing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                 {auditing ? "Analyzing Biometrics..." : "Run AI Analysis"}
               </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[2.5rem] border border-slate-200 bg-[#0F172A] p-8 text-white shadow-2xl">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Neural Audit Report</h3>
                    <div className="rounded-full bg-blue-500/20 border border-blue-500/40 px-4 py-1.5 text-[10px] font-black text-blue-400">
                      EXTRACTION SCORE: {(activity.aiConfidence * 100).toFixed(1)}%
                    </div>
                 </div>

                 {/* Intelligence Brief / Explanation */}
                 <div className={cn(
                   "mb-8 p-6 rounded-2xl border flex gap-4",
                   activity.aiResult.isCountMatch && activity.aiResult.isGeoMatch 
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-100" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-100"
                 )}>
                    <div className={cn(
                      "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
                      activity.aiResult.isCountMatch && activity.aiResult.isGeoMatch ? "bg-blue-500/20 text-blue-400" : "bg-rose-500/20 text-rose-400"
                    )}>
                       {activity.aiResult.isCountMatch && activity.aiResult.isGeoMatch ? <Sparkles className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                    </div>
                    <div>
                       <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Neural Intelligence Brief</div>
                       <div className="text-[11px] font-bold leading-relaxed">
                         {activity.aiResult.explanation}
                       </div>
                    </div>
                 </div>

                 <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-blue-100/90 bg-blue-900/20 p-6 rounded-2xl border border-blue-800/30 mb-8">
                   {activity.aiResult.summary}
                 </pre>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Activity & Child Checks */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Activity Categorization</div>
                          <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1", activity.aiResult.activityMatch === 'match' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                             {activity.aiResult.activityMatch === 'match' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                             {activity.aiResult.activityMatch === 'match' ? "FULL MATCH" : "NOT MATCHED"}
                          </div>
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Head Count Verification</div>
                          <div className={cn("text-[8px] font-black uppercase tracking-widest", activity.aiResult.isCountMatch ? "text-emerald-400" : "text-rose-400")}>
                            {activity.aiResult.isCountMatch ? "MATCHED" : "NOT MATCHED"}
                          </div>
                       </div>
                       <div className="flex items-center justify-between text-xs font-black">
                          <span className="text-slate-400 uppercase text-[9px]">Worker reported: {activity.childrenPresent}</span>
                          <span className={cn("uppercase text-[9px]", activity.aiResult.isCountMatch ? "text-blue-400" : "text-rose-400")}>AI detected: {activity.aiResult.detectedChildren}</span>
                       </div>
                    </div>

                    {/* Environment */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Environmental Compliance</span>
                       <div className="grid grid-cols-3 gap-2">
                          {Object.entries(activity.aiResult.classroomCheck).map(([k, v]) => (
                            <div key={k} className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1.5">
                               {v ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <AlertCircle className="h-3 w-3 text-rose-400" />}
                               <span className={cn("text-[7px] font-black uppercase", v ? "text-slate-300" : "text-rose-400")}>{k}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    {/* Geographic Audit */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                       <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Navigation className="h-3 w-3" /> Geographic Audit</div>
                          <div className={cn("px-2 py-0.5 rounded text-[7px] font-black uppercase", activity.aiResult.isGeoMatch ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                            {activity.aiResult.isGeoMatch ? "LOCATION MATCHED" : "LOCATION NOT MATCHED"}
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div><div className="text-[7px] font-black text-slate-500 uppercase mb-1">Official Registry</div><div className="text-[9px] font-black text-slate-300">13.6288, 79.4192</div></div>
                          <div><div className="text-[7px] font-black text-slate-500 uppercase mb-1">Captured Field</div><div className={cn("text-[9px] font-black", activity.aiResult.isGeoMatch ? "text-emerald-400" : "text-rose-400")}>
                            {activity.capturedLocation ? `${activity.capturedLocation.lat.toFixed(4)}, ${activity.capturedLocation.lng.toFixed(4)}` : activity.lat.toFixed(4) + ", " + activity.lng.toFixed(4)}
                          </div></div>
                       </div>
                    </div>

                    {/* Visual Context */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                       <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2"><BookOpen className="h-3 w-3" /> Visual Context</div>
                       <div className="text-[9px] font-bold text-slate-300 leading-relaxed">{activity.aiResult.specificEvidence.join(", ")}</div>
                    </div>
                 </div>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 italic text-xs text-slate-600 font-medium leading-relaxed">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 not-italic flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Worker Submission Description</div>
                 "{activity.description}"
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowIssueDialog(true)} className="h-16 rounded-2xl border-2 border-[#0F172A] text-[#0F172A] font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">
                    Reject / Flag Issue
                 </button>
                 <button onClick={() => handleDecision("approved")} className="h-16 rounded-2xl bg-[#0F172A] text-white font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition-all">
                    Approve Submission
                 </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Metadata Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Activity Metadata</h3>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><User className="h-5 w-5" /></div>
                    <div><div className="text-[8px] font-black text-slate-400 uppercase">Worker</div><div className="text-xs font-black uppercase">{activity.worker}</div></div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Clock className="h-5 w-5" /></div>
                    <div><div className="text-[8px] font-black text-slate-400 uppercase">Timestamp</div><div className="text-xs font-black uppercase">{format(new Date(activity.timestamp), "h:mm a, MMM d")}</div></div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><MapPin className="h-5 w-5" /></div>
                    <div><div className="text-[8px] font-black text-slate-400 uppercase">Geotag</div><div className="text-xs font-black uppercase">{activity.lat?.toFixed(4)}, {activity.lng?.toFixed(4)}</div></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Flag Issue Dialog */}
      {showIssueDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight">Flag Audit Issue</h2>
              <button onClick={() => setShowIssueDialog(false)}><X className="h-6 w-6" /></button>
            </div>
            <textarea 
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Provide specific instruction for the worker (e.g., Image too blurry, 2 students missing from frame)..."
              className="w-full h-32 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <button 
              onClick={() => handleDecision("issue")}
              className="mt-6 w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
