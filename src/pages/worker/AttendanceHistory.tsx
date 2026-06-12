import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, addMonths, subMonths, isSameDay } from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Info, 
  Umbrella, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Clock,
  LogIn,
  LogOut,
  Download,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const holidays = [
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-05", name: "Babu Jagjivan Ram Jayanti" },
  { date: "2026-04-14", name: "Dr. B.R. Ambedkar Jayanti" },
];

const mockAttendance = [
  { date: "2026-04-22", status: "present", in: "09:00 AM", out: "04:30 PM", verification: "verified" },
  { date: "2026-04-21", status: "present", in: "08:55 AM", out: "04:35 PM", verification: "verified" },
  { date: "2026-04-20", status: "present", in: "09:10 AM", out: "04:15 PM", verification: "verified" },
  { date: "2026-04-18", status: "absent", reason: "Medical Leave", verification: "authorized" },
  { date: "2026-04-17", status: "present", in: "09:05 AM", out: "04:40 PM", verification: "verified" },
  { date: "2026-04-16", status: "present", in: "08:50 AM", out: "04:20 PM", verification: "verified" },
  { date: "2026-04-15", status: "present", in: "09:00 AM", out: "04:30 PM", verification: "verified" },
  { date: "2026-04-13", status: "present", in: "09:15 AM", out: "04:05 PM", verification: "verified" },
  { date: "2026-04-09", status: "present", in: "09:00 AM", out: "04:30 PM", verification: "verified" },
  { date: "2026-04-08", status: "present", in: "08:55 AM", out: "04:45 PM", verification: "verified" },
  { date: "2026-04-07", status: "present", in: "09:00 AM", out: "04:30 PM", verification: "verified" },
  { date: "2026-04-06", status: "absent", reason: "Casual Leave", verification: "authorized" },
  { date: "2026-04-03", status: "present", in: "09:00 AM", out: "04:30 PM", verification: "verified" },
  { date: "2026-04-02", status: "present", in: "09:10 AM", out: "04:20 PM", verification: "verified" },
  { date: "2026-04-01", status: "present", in: "09:00 AM", out: "04:30 PM", verification: "verified" },
];

export default function AttendanceHistory() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026
  const [filter, setFilter] = useState<string>("all");
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getStatus = (date: Date) => {
    const dStr = format(date, "yyyy-MM-dd");
    
    // 1. Holidays always take top priority
    const holiday = holidays.find(h => h.date === dStr);
    if (holiday) return { type: "holiday", name: holiday.name };
    
    // 2. Attendance logs take second priority (e.g. Leave on a Saturday)
    const att = mockAttendance.find(a => a.date === dStr);
    if (att) return { type: att.status, data: att };
    
    // 3. Weekly Off - Only Sunday
    if (date.getDay() === 0) return { type: "off" };
    
    // 4. Default cases
    return { type: date > new Date() ? "upcoming" : "none" };
  };

  const filteredLogs = mockAttendance.filter(log => {
    if (filter === "all") return true;
    return log.status === filter;
  });

  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-black text-[#0F172A] dark:text-white uppercase tracking-tight">Attendance Record</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Government of Andhra Pradesh · WCD Department</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <Download className="h-3.5 w-3.5" /> Export Ledger
        </button>
      </div>

      <div className="grid xl:grid-cols-12 gap-6">
        {/* Left Column: Stats & Filters */}
        <div className="xl:col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Monthly Presence</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">22 / 26 <span className="text-[10px] text-slate-400">Days</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Verification Score</div>
                  <div className="text-lg font-black text-emerald-600">98.4%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Filter Log</h3>
            <div className="grid gap-2">
              {[
                { id: "all", label: "All Logs" },
                { id: "present", label: "Present" },
                { id: "absent", label: "Leave" }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setFilter(s.id)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-left transition-all border",
                    filter === s.id 
                      ? "bg-[#0F172A] border-[#0F172A] text-white" 
                      : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Calendar */}
        <div className="xl:col-span-9 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            {/* Header */}
            <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Day Labels */}
              <div className="grid grid-cols-7 mb-4">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                  <div key={day} className="text-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Cells - High Contrast Square */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square bg-slate-50/30 rounded-lg" />
                ))}
                
                {daysInMonth.map(day => {
                  const status = getStatus(day);
                  return (
                    <div 
                      key={day.toString()}
                      className={cn(
                        "relative aspect-square flex flex-col items-center justify-center rounded-lg text-[11px] font-black transition-all border group",
                        status.type === "present" && "bg-emerald-500 border-emerald-600 text-white shadow-sm",
                        status.type === "absent" && "bg-rose-500 border-rose-600 text-white shadow-sm",
                        status.type === "holiday" && "bg-blue-600 border-blue-700 text-white shadow-sm",
                        status.type === "off" && "bg-slate-100 border-slate-200 text-slate-400",
                        status.type === "none" && "bg-white border-slate-100 text-slate-300",
                        isSameDay(day, new Date()) && "ring-2 ring-[#0F172A] ring-inset"
                      )}
                    >
                      {day.getDate()}
                      <div className="absolute top-1 right-1">
                        {status.type === "holiday" && <Umbrella className="h-2 w-2 opacity-60" />}
                        {status.type === "present" && <CheckCircle2 className="h-2 w-2 opacity-60" />}
                        {status.type === "absent" && <XCircle className="h-2 w-2 opacity-60" />}
                      </div>

                      {/* Premium Hover Detail Popover */}
                      {(status.type === "present" || status.type === "absent" || status.type === "holiday") && (
                        <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 pointer-events-none">
                          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3 shadow-2xl overflow-hidden ring-4 ring-black/5">
                            <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-1.5">
                              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{format(day, "MMM d, yyyy")}</span>
                              <div className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                status.type === "present" ? "bg-emerald-500" : status.type === "absent" ? "bg-rose-500" : "bg-blue-500"
                              )} />
                            </div>
                            
                            {status.type === "present" && (
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-slate-500 font-bold uppercase">Check In</span>
                                  <span className="text-white font-black">{status.data.in}</span>
                                </div>
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-slate-500 font-bold uppercase">Check Out</span>
                                  <span className="text-white font-black">{status.data.out}</span>
                                </div>
                                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-1.5 text-[7px] font-black text-emerald-400 uppercase tracking-tighter">
                                  <ShieldCheck className="h-2.5 w-2.5" /> AI Verified Shift
                                </div>
                              </div>
                            )}

                            {status.type === "absent" && (
                              <div className="space-y-1">
                                <div className="text-[9px] font-black text-rose-400 uppercase">{status.data.reason}</div>
                                <div className="text-[7px] text-slate-500 font-bold uppercase">Authorized Ledger Entry</div>
                              </div>
                            )}

                            {status.type === "holiday" && (
                              <div className="space-y-1">
                                <div className="text-[9px] font-black text-blue-400 uppercase">{status.name}</div>
                                <div className="text-[7px] text-slate-500 font-bold uppercase">Official State Holiday</div>
                              </div>
                            )}
                          </div>
                          {/* Triangle tail */}
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#0F172A] mx-auto" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend - Clean & Explicit */}
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-8">
                {[
                  { color: "bg-emerald-500", label: "Present" },
                  { color: "bg-rose-500", label: "Leave" },
                  { color: "bg-blue-600", label: "Holiday" },
                  { color: "bg-slate-100", label: "Weekly Off" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Activity Logs - Full Width to eliminate left space */}
      <div className="space-y-4 pt-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Governance Audit Ledger</h2>
        <div className="grid gap-3">
          {filteredLogs.map((item, i) => (
            <div key={i} className="flex items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition-all dark:bg-slate-900 dark:border-slate-800">
              {/* Left: Icon & Date */}
              <div className="flex items-center gap-4 w-64 shrink-0">
                <div className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  item.status === "present" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{format(new Date(item.date), "EEEE, MMM d")}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.status === "present" ? "Regular Shift Verification" : "Authorized Personal Leave"}</div>
                </div>
              </div>

              {/* Middle: Time / Reason - Expanded Space */}
              <div className="flex-1 flex items-center justify-center px-12 border-l border-r border-slate-50 dark:border-slate-800">
                {item.status === "present" ? (
                  <div className="flex items-center gap-16">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Entry Time</span>
                      <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.1em]">
                        <LogIn className="h-4 w-4 text-blue-600" /> {item.in}
                      </div>
                    </div>
                    <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Exit Time</span>
                      <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.1em]">
                        <LogOut className="h-4 w-4 text-rose-600" /> {item.out}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-xs font-black text-rose-600 uppercase tracking-[0.15em]">
                    <AlertCircle className="h-5 w-5" /> {item.reason}
                  </div>
                )}
              </div>

              {/* Right: Verification Details */}
              <div className="w-48 flex flex-col items-end gap-1.5">
                <div className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                  item.status === "present" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                  {item.status === "present" ? "System Verified" : "Leave Processed"}
                </div>
                <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                  <ShieldCheck className="h-3 w-3 text-blue-500" />
                  Audit ID: {crypto.randomUUID().slice(0, 12)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

