import { useApp } from "@/context/AppContext";
import { mockAlerts } from "@/data/mockData";
import { 
  Bell, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Search,
  MoreVertical,
  MessageSquare,
  Navigation,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Alerts() {
  const { t } = useApp();
  
  const handleAction = (id: string, action: string) => {
    toast.success(`Action "${action}" recorded`, {
      description: `Alert ID: ${id}`
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("alerts")}</h1>
          <p className="text-sm text-muted-foreground">Managing {mockAlerts.length} system alerts across all centers</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-elegant hover:opacity-90 transition-opacity">
            <CheckCircle2 className="h-4 w-4" /> Mark All Read
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Filter by center or message..." 
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          {["All", "High", "Medium", "Low"].map((s) => (
            <button
              key={s}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border",
                s === "All" ? "bg-secondary border-border text-foreground" : "bg-background border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              {s}
            </button>
          ))}
          <div className="h-6 w-[1px] bg-border mx-2" />
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {mockAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition-all hover:shadow-elegant",
              alert.severity === "high" ? "border-danger/30" : "border-border"
            )}
          >
            {alert.severity === "high" && (
              <div className="absolute left-0 top-0 h-full w-1.5 bg-danger" />
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  alert.severity === "high" ? "bg-danger/10 text-danger" : 
                  alert.severity === "medium" ? "bg-warning/10 text-warning" : 
                  "bg-info/10 text-info"
                )}>
                  {alert.severity === "high" ? <AlertCircle className="h-6 w-6" /> : 
                   alert.severity === "medium" ? <AlertTriangle className="h-6 w-6" /> : 
                   <Info className="h-6 w-6" />}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                      alert.severity === "high" ? "bg-danger text-white" : "bg-secondary text-muted-foreground"
                    )}>
                      {alert.severity} Priority
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{alert.type.replace("-", " ")}</span>
                    <span className="text-muted-foreground opacity-30">|</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(alert.time), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {alert.message}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Navigation className="h-3.5 w-3.5" /> {alert.centerName}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-end md:self-center">
                <button 
                  onClick={() => handleAction(alert.id, "Send Reminder")}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                  title="Send Reminder"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleAction(alert.id, "Mark Resolved")}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors uppercase tracking-widest"
                >
                  Resolve
                </button>
                <button 
                  className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-elegant hover:opacity-90 transition-opacity uppercase tracking-widest flex items-center gap-2"
                >
                  Take Action <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Insight */}
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-glow">
          <Bell className="h-7 w-7" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-lg font-bold text-foreground">Notification Efficiency</h4>
          <p className="mt-1 text-sm text-muted-foreground">Average resolution time for critical alerts has improved by 24% this week. AI auto-triaging is active.</p>
        </div>
        <button className="whitespace-nowrap rounded-xl bg-white dark:bg-slate-800 px-6 py-3 text-xs font-bold text-primary shadow-soft border border-primary/10 uppercase tracking-widest">
          View Stats
        </button>
      </div>
    </div>
  );
}