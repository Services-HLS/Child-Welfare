import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { 
  MapPin, 
  Search, 
  Filter, 
  Layers, 
  Navigation, 
  Maximize2, 
  Plus, 
  Minus,
  Building2,
  Users,
  ShieldCheck,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MapView() {
  const { t } = useApp();

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-6 overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold">Geospatial Monitor</h1>
          <p className="text-sm text-muted-foreground">Real-time center locations and field staff movement</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex rounded-xl border border-border bg-card p-1 shadow-soft">
            <button className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-primary">
              <Zap className="h-3.5 w-3.5" /> Live
            </button>
            <button className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
              Historical
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
        {/* Mock Map Canvas */}
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 overflow-hidden">
          {/* Abstract Map Grid */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="large-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
                </pattern>
                <pattern id="small-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#small-grid)" />
              <rect width="100%" height="100%" fill="url(#large-grid)" />
            </svg>
          </div>

          {/* Abstract Road Lines */}
          <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 1000 1000">
            <path d="M0,200 Q500,250 1000,100" fill="none" stroke="currentColor" strokeWidth="20" className="text-primary" />
            <path d="M300,0 Q350,500 200,1000" fill="none" stroke="currentColor" strokeWidth="15" className="text-primary" />
            <path d="M0,700 Q400,600 1000,850" fill="none" stroke="currentColor" strokeWidth="25" className="text-primary" />
          </svg>

          {/* Map Markers */}
          {mockCenters.map((center, idx) => (
            <div 
              key={center.id} 
              className="absolute group cursor-pointer transition-all hover:z-20"
              style={{ 
                left: `${20 + (idx * 12) % 60}%`, 
                top: `${15 + (idx * 18) % 70}%` 
              }}
            >
              <div className="relative">
                <div className={cn(
                  "absolute inset-0 animate-ping rounded-full bg-primary/20",
                  center.status === "healthy" ? "bg-success/20" : "bg-danger/20"
                )} />
                <div className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white dark:border-slate-800 shadow-elegant transition-transform group-hover:scale-110",
                  center.status === "healthy" ? "bg-success text-white" : center.status === "warning" ? "bg-warning text-white" : "bg-danger text-white"
                )}>
                  <Building2 className="h-5 w-5" />
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="rounded-xl border border-border bg-card p-3 shadow-elegant backdrop-blur-md">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{center.id}</div>
                    <div className="text-sm font-bold text-foreground truncate">{center.name}</div>
                    <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase">
                        {center.compliance}% Compliance
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                         {center.children} kids
                      </div>
                    </div>
                  </div>
                  <div className="mx-auto w-2 h-2 bg-card border-r border-b border-border rotate-45 -mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map Controls */}
        <div className="absolute right-6 top-6 flex flex-col gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 text-foreground shadow-soft backdrop-blur-md hover:bg-card">
            <Maximize2 className="h-4 w-4" />
          </button>
          <div className="flex flex-col rounded-xl border border-border bg-card/80 shadow-soft backdrop-blur-md">
            <button className="flex h-10 w-10 items-center justify-center border-b border-border hover:bg-secondary rounded-t-xl"><Plus className="h-4 w-4" /></button>
            <button className="flex h-10 w-10 items-center justify-center hover:bg-secondary rounded-b-xl"><Minus className="h-4 w-4" /></button>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 text-foreground shadow-soft backdrop-blur-md hover:bg-card">
            <Layers className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute left-6 top-6 w-72 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search map..." 
              className="w-full rounded-xl border border-border bg-card/80 py-2.5 pl-9 pr-4 text-sm shadow-soft backdrop-blur-md focus:outline-none"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur-md">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Live Feed Preview</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <div className="text-xs font-semibold text-foreground truncate">Gandhi Nagar Center active</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <div className="text-xs font-semibold text-foreground truncate">Subhash Colony alert</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 flex items-center gap-4 rounded-xl border border-border bg-card/80 px-4 py-2 shadow-soft backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-success" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-warning" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-danger" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Critical</span>
          </div>
        </div>

        <button className="absolute bottom-6 right-6 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-elegant hover:opacity-90">
          <Navigation className="h-4 w-4" /> Center Me
        </button>
      </div>
    </div>
  );
}
