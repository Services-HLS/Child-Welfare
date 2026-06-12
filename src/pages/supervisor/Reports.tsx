import { useApp } from "@/context/AppContext";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Users, 
  Sparkles,
  Info
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { cn } from "@/lib/utils";

const complianceData = [
  { name: 'Jan', value: 65 },
  { name: 'Feb', value: 72 },
  { name: 'Mar', value: 68 },
  { name: 'Apr', value: 85 },
  { name: 'May', value: 82 },
  { name: 'Jun', value: 91 },
];

const activityData = [
  { name: 'Nutrition', value: 45, color: '#3b82f6' },
  { name: 'Education', value: 30, color: '#10b981' },
  { name: 'Health', value: 15, color: '#f59e0b' },
  { name: 'Others', value: 10, color: '#6366f1' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

export default function SupervisorReports() {
  const { t } = useApp();

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground">Detailed compliance and activity completion insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary">
            <Calendar className="h-4 w-4" /> This Month <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-elegant hover:opacity-90">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-lg bg-success/10 p-2 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-success">+14.2%</span>
          </div>
          <div className="text-2xl font-black text-foreground">88.5%</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Average Compliance</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-success">+5.1%</span>
          </div>
          <div className="text-2xl font-black text-foreground">1,248</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Activities Verified</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-lg bg-warning/10 p-2 text-warning">
              <TrendingDown className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-danger">-2.4%</span>
          </div>
          <div className="text-2xl font-black text-foreground">18</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Pending Alerts</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Compliance Progress */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold mb-6">Monthly Compliance Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4}
                  dot={{ r: 6, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold mb-6">Activity Type Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-64 w-64 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              {activityData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-semibold text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}%</span>
                </div>
              ))}
              <div className="mt-6 pt-6 border-t border-border">
                 <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-secondary/50 p-3 rounded-xl">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI identifies Nutrition as the most compliant category this month.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Rankings */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold">Top Performing Centers</h3>
          <button className="text-xs font-bold text-primary underline">Download Full Report</button>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Gandhi Nagar Center', compliance: 98, change: '+2.4%', worker: 'Lakshmi Devi' },
            { name: 'Ambedkar Colony', compliance: 94, change: '+1.8%', worker: 'Saraswati' },
            { name: 'Patel Nagar', compliance: 91, change: '+0.5%', worker: 'Anitha Rani' },
          ].map((center, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-secondary/20 transition-colors hover:bg-secondary/40">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black">
                  {idx + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{center.name}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold">Worker: {center.worker}</div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-sm font-black text-foreground">{center.compliance}%</div>
                  <div className="text-[10px] font-bold text-success uppercase">{center.change}</div>
                </div>
                <div className="h-10 w-[1px] bg-border" />
                <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-card">
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
