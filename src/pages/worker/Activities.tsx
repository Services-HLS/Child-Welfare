import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useActivities } from "@/context/worker/hooks";
import { 
  Mic, 
  Send, 
  Loader2, 
  MapPin, 
  Box, 
  Info, 
  ClipboardList, 
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  ShieldCheck,
  Camera,
  Navigation,
  Circle,
  Play
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ActivityLog } from "@/data/mockData";
import { verifyServiceDelivery } from "@/services/ai/verification";

const SERVICE_SECTIONS = [
  "Preschool Activities",
  "Nutrition Distribution",
  "Health Activities",
  "Home Visits",
  "Community Outreach",
  "Infrastructure Updates",
] as const;

export default function Activities() {
  const { user, updateActivity, addChildProgress, scheduleSurvey, online, t } = useApp();
  const { submitActivity, completionPercent } = useActivities();
  const [logOutcome, setLogOutcome] = useState(true);
  const [childName, setChildName] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [type, setType] = useState<string>(SERVICE_SECTIONS[0]);
  const [desc, setDesc] = useState("");
  const [count, setCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Camera UI State
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const startVoice = () => {
    toast.info("Listening...", { description: "Narrative transcription active." });
    setTimeout(() => {
      setDesc((d) => (d ? d + " " : "") + "Session conducted successfully with all students verified.");
    }, 1500);
  };

  const handleOfficialUpload = () => {
    setLocating(true);
    setTimeout(() => {
      setLocation({ lat: 13.6288, lng: 79.4192 }); 
      setIsLive(false);
      setLocating(false);
      fileInputRef.current?.click();
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
        setFileType(f.type);
      };
      reader.readAsDataURL(f);
    }
  };

  // Real-time Camera Logic
  const startCamera = async () => {
    setLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setIsLive(true);
      setShowCamera(true);
      setLocating(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setLocating(false);
      toast.error("Camera or GPS Access Denied");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  const takePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current!.videoWidth;
    canvas.height = videoRef.current!.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current!, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.5); // Reduced quality to save space
    setFilePreview(dataUrl);
    setFileType("image/jpeg");
    stopCamera();
    toast.success("Photo Captured with GPS");
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordedChunks([]);
    const stream = videoRef.current?.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => e.data.size > 0 && setRecordedChunks(p => [...p, e.data]);
    recorder.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setTimeout(() => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
        setFileType("video/webm");
        stopCamera();
        toast.success("Video Recorded with GPS");
      };
      reader.readAsDataURL(blob);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !location || !filePreview) {
      toast.error("Incomplete Submission", { description: "Evidence, Narrative and GPS required." });
      return;
    }

    setSubmitting(true);
    (async () => {
      const draft: Partial<ActivityLog> = {
        type,
        description: desc,
        childrenPresent: count,
        imageUrl: filePreview || undefined,
        lat: location?.lat ?? 13.6288,
        lng: location?.lng ?? 79.4192,
      };
      const verification = await verifyServiceDelivery(draft);
      const actId = await submitActivity({
        type,
        description: desc,
        childrenPresent: count,
        lat: location?.lat ?? 13.6288,
        lng: location?.lng ?? 79.4192,
        imageUrl: filePreview || undefined,
      });
      if (!actId) {
        setSubmitting(false);
        return;
      }
      updateActivity(actId, {
        status: verification.serviceOccurred ? "submitted" : "issue",
        aiConfidence: verification.metrics.overallConfidence,
        aiResult: verification.aiResult,
        serviceMetrics: verification.metrics,
        mealDistribution: type.toLowerCase().includes("nutrition"),
        classroomEngagement: verification.metrics.activityExecution,
        synced: online,
      });
      const activityId = actId;
      if (logOutcome && childName.trim()) {
        addChildProgress({
          id: `CP-${activityId}`,
          childId: `CH-${activityId}`,
          childName: childName.trim(),
          centerId: user!.centerId!,
          workerId: user!.workerId ?? "W-1042",
          date: new Date().toISOString().slice(0, 10),
          attended: count > 0,
          nutritionCompleted: type.toLowerCase().includes("nutrition"),
          preschoolParticipation: verification.metrics.activityExecution,
          learningObservation: desc.slice(0, 80),
          activityId,
        });
      }
      scheduleSurvey("B-1001", user!.centerId!, "after_activity");
      setSubmitting(false);
      toast.success("Service evidence captured", { description: verification.summary });
      navigate(`/worker/activity/${activityId}`);
    })();
  };

  return (
    <div className="space-y-6 pb-20 w-full">
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-xl font-bold text-[#0F172A]">{t("service_delivery_tracker")}</h1>
        <p className="text-sm text-slate-600 mt-1">Government services delivered today — {completionPercent}% of daily target</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time field evidence capture</p>
      </div>

      {/* Camera Modal Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between p-6 text-white">
            <div className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" /> Live Real-time Capture
            </div>
            <button onClick={stopCamera} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><X className="h-6 w-6" /></button>
          </div>
          
          <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <div className="absolute top-4 left-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase">
               <Navigation className="h-3 w-3 inline mr-1 text-blue-400" /> GPS Locked: {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
            </div>
          </div>

          <div className="p-10 flex items-center justify-center gap-8 bg-black/80 backdrop-blur-xl">
             {!isRecording ? (
               <>
                 <button onClick={takePhoto} className="flex flex-col items-center gap-2 text-white group">
                    <div className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center group-active:scale-95 transition-transform">
                      <div className="h-12 w-12 rounded-full bg-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase">Snapshot</span>
                 </button>
                 <button onClick={startRecording} className="flex flex-col items-center gap-2 text-white group">
                    <div className="h-16 w-16 rounded-full border-4 border-rose-600 flex items-center justify-center group-active:scale-95 transition-transform">
                       <Circle className="h-8 w-8 text-rose-600 fill-rose-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase">Record</span>
                 </button>
               </>
             ) : (
               <button onClick={stopRecording} className="flex flex-col items-center gap-2 text-white">
                  <div className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center animate-pulse">
                     <div className="h-8 w-8 bg-rose-600 rounded" />
                  </div>
                  <span className="text-[10px] font-black uppercase">Stop Recording</span>
               </button>
             )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Activity Type</label>
          <div className="mt-4 flex flex-wrap gap-2">
            {SERVICE_SECTIONS.map((tp) => (
              <button key={tp} type="button" onClick={() => setType(tp)} className={cn("rounded-xl border px-4 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all", type === tp ? "bg-[#0F172A] text-white" : "bg-slate-50 text-slate-500")}>
                {tp}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Participants</label>
              <input type="number" value={count || ""} onChange={(e) => setCount(parseInt(e.target.value) || 0)} className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 py-3 px-4 text-xs font-bold" />
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3 space-y-2">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase text-teal-800">
                <input type="checkbox" checked={logOutcome} onChange={(e) => setLogOutcome(e.target.checked)} /> Log child outcome
              </label>
              {logOutcome && (
                <input placeholder="Primary child name (optional)" value={childName} onChange={(e) => setChildName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-xs" />
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Narrative</label>
                <button type="button" onClick={startVoice} className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1"><Mic className="h-3 w-3" /> Voice</button>
              </div>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs font-medium" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Real-time Evidence</label>
             <div className="relative flex-1 min-h-[150px] rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden mb-4">
               {filePreview ? (
                 fileType?.startsWith('video') ? (
                   <video src={filePreview} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop />
                 ) : (
                   <img src={filePreview} className="absolute inset-0 h-full w-full object-cover" />
                 )
               ) : (
                 <div className="text-center"><ImageIcon className="h-8 w-8 text-slate-200 mx-auto mb-2" /><span className="text-[9px] font-black uppercase text-slate-400">Capture Proof</span></div>
               )}
               {location && (
                 <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[8px] font-black uppercase flex items-center gap-1.5 backdrop-blur-md border border-white/10">
                   <Navigation className="h-2.5 w-2.5 text-blue-400" /> 
                   {isLive ? `LIVE GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : `CENTER: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                 </div>
               )}
             </div>

             <div className="grid grid-cols-2 gap-3">
               <button type="button" onClick={handleOfficialUpload} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-white hover:bg-slate-800 transition-all">
                 <Upload className="h-5 w-5" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Official Upload</span>
               </button>
               <button type="button" onClick={startCamera} disabled={locating} className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all relative">
                 {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                 <span className="text-[8px] font-black uppercase tracking-widest">{locating ? "Initializing..." : "Live Capture"}</span>
               </button>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
        </div>

        <button type="submit" disabled={submitting || !filePreview} className="w-full rounded-2xl bg-blue-600 py-5 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl disabled:opacity-50">
          {submitting ? "Digitizing Record..." : "Submit to Ledger"}
        </button>
      </form>
    </div>
  );
}