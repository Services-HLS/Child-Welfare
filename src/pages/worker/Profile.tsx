import { useApp } from "@/context/AppContext";
import { 
  User, 
  MapPin, 
  Phone, 
  Languages, 
  LogOut, 
  ShieldCheck, 
  Building2,
  Calendar,
  Settings,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUploads } from "@/context/worker/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout, lang, setLang, t, online } = useApp();
  const { uploadQueue } = useUploads();
  const queuePending = uploadQueue.filter((q) => q.status !== "verified").length;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Session Ended", { description: "You have been securely logged out." });
    navigate("/");
  };

  const toggleLanguage = () => {
    const next = lang === "en" ? "te" : "en";
    setLang(next);
    toast.success(`Language changed to ${next === "en" ? "English" : "Telugu"}`);
  };

  if (!user) return null;

  return (
    <div className="space-y-8 pb-20 w-full">
      {/* Header Branding */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">{t("worker_identity_settings")}</h1>
          <p className="text-sm text-slate-600 mt-1">Center assignment · language · sync · privacy</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <Settings className="h-6 w-6" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Identity Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-blue-50/50" />
            
            <div className="relative">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl font-black text-white shadow-2xl">
                {user.name.charAt(0)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">{user.name}</h2>
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: {user.id}</div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Center</div>
                    <div className="text-sm font-black text-slate-900 uppercase">{user.centerName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Number</div>
                    <div className="text-sm font-black text-slate-900">+91 {user.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-6 flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-emerald-900 uppercase tracking-tight">Active Duty Verification</h4>
              <p className="mt-1 text-[10px] font-medium text-emerald-700/80 leading-relaxed uppercase">Your biometric and geo-fence credentials are verified for the current shift.</p>
            </div>
          </div>
        </div>

        {/* Right: Settings & Preferences */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Preferences</h3>
            
            <div className="space-y-4">
              <button 
                onClick={toggleLanguage}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-5 transition-all hover:bg-slate-50 active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                    <Languages className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight">System Language</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'en' ? 'English' : 'Telugu'} Active</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-blue-600 uppercase">Change</span>
                   <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </button>

              <div className="flex w-full items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight">Sync & offline storage</div>
                    <div className="text-[10px] font-bold text-slate-400">{online ? "Online" : "Offline"} · {queuePending} items queued</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
              <button 
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-rose-50 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 transition-all hover:bg-rose-100"
              >
                <LogOut className="h-5 w-5" />
                Sign Out of Portal
              </button>
            </div>
          </div>

          <div className="p-4 text-center">
             <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Version 2.4.0 · Secure Governance Build</div>
             <div className="mt-1 text-[8px] font-bold text-slate-300 uppercase tracking-widest">© 2026 Dept of Women & Child Development</div>
          </div>
        </div>
      </div>
    </div>
  );
}
