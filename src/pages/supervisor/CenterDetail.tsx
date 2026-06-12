import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { mockCenters, mockActivities, mockAlerts } from "@/data/mockData";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  User, 
  ShieldCheck, 
  Bell, 
  Image as ImageIcon,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/app/StatusBadge";
import { cn } from "@/lib/utils";

export default function CenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useApp();

  const center = mockCenters.find(c => c.id === id);
  const centerActivities = mockActivities.filter(a => a.centerId === id);
  const centerAlerts = mockAlerts.filter(a => a.centerId === id);

  if (!center) return <div className="p-10 text-center">Center not found</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-soft hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate(`/center-journey/${id}`)} className="flex items-center gap-2 rounded-xl bg-teal-600 text-white px-4 py-2 text-sm font-bold hover:bg-teal-700">
            <Sparkles className="h-4 w-4" /> Center Journey
          </button>
          <button onClick={() => navigate(`/center-digital-view/${id}`)} className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800 hover:bg-blue-100">
            Digital Twin
          </button>
          <button onClick={() => navigate(`/center-timeline/${id}`)} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary">
            <Clock className="h-4 w-4" /> Timeline
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary">
            <MessageSquare className="h-4 w-4" /> Send Reminder
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white shadow-elegant hover:opacity-90">
            <Bell className="h-4 w-4" /> Raise Issue
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Center Profile & Stats */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <div className={cn(
              "h-24 w-full",
              center.status === "healthy" ? "bg-success/20" : center.status === "warning" ? "bg-warning/20" : "bg-danger/20"
            )} />
            <div className="px-6 pb-6 pt-0">
              <div className="relative -mt-12 flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-card bg-secondary text-primary shadow-soft">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-foreground leading-tight">{center.name}</h1>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {center.mandal}, {center.district}
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID: {center.id}</span>
                <span className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                  center.status === "healthy" ? "bg-success/10 text-success" : center.status === "warning" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                )}>
                  {center.status} Status
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Worker</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{center.worker}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Compliance</span>
                  </div>
                  <span className="text-sm font-bold text-success">{center.compliance}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Children</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{center.children}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts for this center */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-danger" />
              Active Alerts
            </h3>
            <div className="space-y-3">
              {centerAlerts.length > 0 ? centerAlerts.map(alert => (
                <div key={alert.id} className="rounded-xl border border-border bg-secondary/20 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                      alert.severity === "high" ? "bg-danger text-white" : "bg-warning text-warning-foreground"
                    )}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{format(new Date(alert.time), "h:mm a")}</span>
                  </div>
                  <p className="text-xs font-bold text-foreground leading-snug">{alert.message}</p>
                </div>
              )) : (
                <div className="text-center py-4 text-xs text-muted-foreground">No active alerts for this center.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Activities & Verification */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold">Recent Activities</h2>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary">Today</button>
                <button className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary">Filter</button>
              </div>
            </div>

            <div className="space-y-4">
              {centerActivities.map((a) => (
                <div key={a.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-soft">
                  <div className="flex flex-col sm:flex-row">
                    {a.imageUrl ? (
                      <div className="relative h-44 w-full sm:h-32 sm:w-44 shrink-0 overflow-hidden">
                        <img src={a.imageUrl} alt={a.type} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </div>
                    ) : (
                      <div className="flex h-32 w-44 shrink-0 items-center justify-center bg-secondary text-muted-foreground/30">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground">{a.type}</h4>
                            {a.synced && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
                            <Calendar className="h-3 w-3" /> {format(new Date(a.timestamp), "d MMM")} 
                            <span className="opacity-40">|</span>
                            <Clock className="h-3 w-3" /> {format(new Date(a.timestamp), "h:mm a")}
                          </div>
                        </div>
                        <StatusBadge status={a.status} confidence={a.aiConfidence} />
                      </div>
                      <p className="mt-3 line-clamp-1 text-xs text-muted-foreground italic">"{a.description}"</p>
                      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                            <Users className="h-3 w-3" /> {a.childrenPresent}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                            <MapPin className="h-3 w-3" /> Verified Geo
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                            Details <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Insights / Map Placeholder */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold">Activity Coverage Map</h3>
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="relative h-64 overflow-hidden rounded-2xl bg-secondary/50 border border-border">
               <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-detail" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-detail)" />
                </svg>
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 scale-150" />
                  <MapPin className="h-10 w-10 text-primary relative z-10" />
                </div>
                <div className="mt-4 rounded-full bg-background/80 px-4 py-2 text-xs font-bold shadow-soft backdrop-blur-sm border border-border">
                  Live: Gandhi Nagar Center
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] font-bold text-muted-foreground bg-card/80 px-2 py-1 rounded border border-border">
                Precision: ±5m
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}