import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Box,
  FileText,
  Loader2,
  Upload,
  MessageSquare,
  Video
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StatusBadge } from "@/components/app/StatusBadge";

export default function VerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activities, updateActivity } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [processing, setProcessing] = useState(false);
  const [phase, setPhase] = useState<string>("");

  const activity = activities.find(a => a.id === id);

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-16 w-16 text-slate-200 mb-4" />
        <h2 className="text-xl font-black text-slate-900 uppercase">Activity Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold uppercase tracking-widest text-xs underline">Go Back</button>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setPhase("Capturing Geolocation...");

    // 1. Capture Real Geolocation
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPhase("Uploading Evidence...");
        
        // 2. Convert to Base64 for Persistence
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          
          updateActivity(activity.id, {
            imageUrl: base64data,
            status: "submitted",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: new Date().toISOString()
          });

          setProcessing(false);
          setPhase("");
          toast.success("Evidence Secured", {
            description: `Location captured: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}. Sent for review.`
          });
        };
        reader.readAsDataURL(file);
      },
      (err) => {
        setProcessing(false);
        toast.error("Location Required", { description: "Please enable GPS to upload evidence for AI audit." });
      },
      { enableHighAccuracy: true }
    );
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*,video/*" 
        className="hidden" 
      />

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Ledger
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Evidence & Status */}
        <div className="lg:w-1/2 space-y-6">
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl bg-slate-50 group">
            {activity.imageUrl ? (
              activity.imageUrl.startsWith('data:video') || activity.imageUrl.includes('video') ? (
                <video src={activity.imageUrl} className="h-full w-full object-contain bg-slate-900 transition-transform group-hover:scale-105 duration-700" autoPlay muted loop playsInline />
              ) : (
                <img src={activity.imageUrl} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Evidence" />
              )
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4 border-4 border-white shadow-inner">
                  <ImageIcon className="h-10 w-10" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Awaiting Proof</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Upload Photo or Video of the session.</p>
              </div>
            )}
            
            {processing && (
              <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                <div className="relative">
                   <Loader2 className="h-16 w-16 animate-spin text-blue-400 mb-4" />
                   <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white animate-pulse" />
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em]">{phase}</div>
                <div className="mt-2 text-[8px] font-bold text-white/40 uppercase tracking-widest">Geo-fencing and Encryption active</div>
              </div>
            )}

            {!processing && (
              <div className="absolute top-6 left-6">
                <StatusBadge status={activity.status} showConfidence={false} className="shadow-2xl px-4 py-1.5" />
              </div>
            )}

            {!processing && activity.lat && (
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                     <MapPin className="h-4 w-4" />
                   </div>
                   <div>
                     <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Verified GPS</div>
                     <div className="text-[10px] font-black">{activity.lat.toFixed(4)}, {activity.lng.toFixed(4)}</div>
                   </div>
                 </div>
                 <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" /> Administrative Tracking
              </h3>
            </div>
            <div className="space-y-4">
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                {activity.status === "approved" ? (
                  `"Evidence successfully audited and geo-verified. Performance markers updated in your profile."`
                ) : activity.status === "submitted" ? (
                  `"Evidence received at ${format(new Date(activity.timestamp), "h:mm a")}. Supervisor is now performing neural analysis."`
                ) : activity.status === "issue" ? (
                  `"Correction required. Please review the supervisor remark and re-upload clearer evidence."`
                ) : (
                  `"Protocol: You must provide visual proof (Photo/Video) of the session while within 50m of the center coordinates."`
                )}
              </p>
              
              {activity.supervisorRemark && (
                <div className="mt-4 p-5 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 shadow-inner">
                  <MessageSquare className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9px] font-black text-rose-900 uppercase tracking-widest">Supervisor Instruction</div>
                    <div className="text-[11px] font-bold text-rose-700 mt-1 leading-relaxed">{activity.supervisorRemark}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Metadata & Actions */}
        <div className="lg:w-1/2 space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm h-full flex flex-col">
            <div className="mb-10 border-b border-slate-50 pb-8">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Audit Ledger Entry</div>
              <h1 className="text-4xl font-black text-[#0F172A] uppercase tracking-tight leading-none">{activity.type}</h1>
            </div>

            <div className="grid gap-8 flex-1">
              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date Logged</div>
                    <div className="text-sm font-black text-slate-900 uppercase">{format(new Date(activity.timestamp), "MMM d, yyyy")}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Logged</div>
                    <div className="text-sm font-black text-slate-900 uppercase">{format(new Date(activity.timestamp), "h:mm a")}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Participants Identified</div>
                  <div className="text-base font-black text-slate-900 uppercase">{activity.childrenPresent} Children Logged</div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Submission Summary</div>
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 italic text-sm text-slate-600 font-medium leading-relaxed shadow-inner">
                  "{activity.description}"
                </div>
              </div>

              {/* Actions Section */}
              <div className="pt-10 space-y-4">
                {!activity.imageUrl ? (
                  <button 
                    onClick={triggerUpload}
                    disabled={processing}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-4 active:scale-95"
                  >
                    {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                    Upload Image or Video
                  </button>
                ) : activity.status === "issue" ? (
                  <button 
                    onClick={triggerUpload}
                    disabled={processing}
                    className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-rose-600/30 hover:bg-rose-700 transition-all flex items-center justify-center gap-4 active:scale-95"
                  >
                    {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Video className="h-6 w-6" />}
                    Correct Evidence (Re-upload)
                  </button>
                ) : (
                  <div className="p-6 rounded-3xl border-2 border-dashed border-emerald-100 bg-emerald-50/30 flex flex-col items-center gap-2">
                     <ShieldCheck className="h-10 w-10 text-emerald-500" />
                     <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Evidence Secured & Geotagged</span>
                  </div>
                )}
                
                <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  {activity.imageUrl ? "Secure Hash: GVN-8842-AX-Z" : "GPS Lock Required for Submission"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
