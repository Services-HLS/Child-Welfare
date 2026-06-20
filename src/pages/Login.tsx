import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { LangToggle } from "@/components/app/LangToggle";
import { GOV_BRAND } from "@/lib/govBranding";
import { ArrowRight, Lock, Phone, CheckCircle2, Shield, BarChart3 } from "lucide-react";
import { Role } from "@/types/platform";
import { roleHomePath } from "@/lib/rolePaths";

const roles: { id: Role; labelKey: "beneficiary" | "worker" | "supervisor" | "district_admin" | "state_admin" }[] = [
  { id: "beneficiary", labelKey: "beneficiary" },
  { id: "worker", labelKey: "worker" },
  { id: "supervisor", labelKey: "supervisor" },
  { id: "district_admin", labelKey: "district_admin" },
  { id: "state_admin", labelKey: "state_admin" },
];

const highlights = [
  "Transparent Anganwadi service delivery and beneficiary trust",
  "Grievance tracking with timely resolution and public accountability",
  "Child outcomes, nutrition compliance, and workforce coaching",
];

export default function Login() {
  const { user, login, t, setLang } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role>("beneficiary");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("9876543210");
  const [password, setPassword] = useState("demo1234");

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    if (user) navigate(roleHomePath(user.role), { replace: true });
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(selected, { phone, password });
      navigate(roleHomePath(selected));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-gov-page flex flex-col">
      <div className="login-gov-tricolor flex shrink-0" aria-hidden>
        <span className="flex-1 bg-[#FF9933]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#138808]" />
      </div>

      <div className="login-gov-split flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Left — about the application */}
        <aside className="login-gov-about flex flex-col justify-between min-h-0 md:w-[48%] lg:w-1/2 shrink-0 md:shrink overflow-hidden">
          <div className="login-gov-about-content min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center gap-4">
              <div className="login-gov-about-emblem h-16 w-16 shrink-0 border-[3px] border-[#e8c547] bg-white text-[#0F172A] text-[11px] font-extrabold flex items-center justify-center text-center leading-tight shadow-md">
                AP
                <br />
                GOVT
              </div>
              <div>
                <span className="login-gov-pilot-pill inline-block text-[11px] font-bold uppercase tracking-wide text-[#0F172A] bg-[#f5d565] border border-[#e8c547] px-2 py-0.5 mb-1.5">
                  {t("pilot_environment")}
                </span>
                <h1 className="login-gov-about-title text-2xl sm:text-3xl font-extrabold leading-tight text-white">
                  {GOV_BRAND.title}
                </h1>
              </div>
            </div>

            <p className="login-gov-about-lead mt-5 text-base sm:text-lg font-semibold leading-snug text-white max-w-none">
              {t("tagline")}
            </p>

            <p className="login-gov-about-body mt-4 text-sm sm:text-[15px] font-medium leading-relaxed text-slate-100 max-w-none">
              Unified digital platform for Anganwadi operations, beneficiary feedback, grievance resolution, and
              evidence-based service improvement across {GOV_BRAND.pilotLocation}.
            </p>

            <ul className="login-gov-about-list mt-5 space-y-3 max-w-none">
              {highlights.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm sm:text-[15px] font-medium leading-snug text-white">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#f5d565]" strokeWidth={2.5} aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="login-gov-about-badges mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-sm bg-white/15 border border-white/25 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white">
                <Shield className="h-4 w-4 text-[#f5d565]" aria-hidden />
                Secure official access
              </span>
              <span className="inline-flex items-center gap-2 rounded-sm bg-white/15 border border-white/25 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white">
                <BarChart3 className="h-4 w-4 text-[#f5d565]" aria-hidden />
                Public transparency
              </span>
            </div>
          </div>

          <div className="login-gov-about-footer shrink-0 pt-4 mt-3 border-t-2 border-white/25">
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-[#f5d565]" aria-label="Public links">
              <Link to="/public/transparency" className="hover:text-white hover:underline underline-offset-2">
                Transparency
              </Link>
              <Link to="/impact" className="hover:text-white hover:underline underline-offset-2">
                Public Impact
              </Link>
              <Link to="/experience/hackathon" className="hover:text-white hover:underline underline-offset-2">
                Walkthrough
              </Link>
            </nav>
            <p className="mt-2 text-xs font-medium text-slate-200">
              © {new Date().getFullYear()} {GOV_BRAND.department}
            </p>
          </div>
        </aside>

        {/* Right — sign-in form */}
        <section className="login-gov-form-side flex flex-col min-h-0 flex-1 bg-[#e8ebef]">
          <div className="login-gov-form-toolbar shrink-0 flex items-center justify-end gap-2 px-4 py-2 border-b border-slate-300/80 bg-white/60">
            <span className="mr-auto text-[9px] font-bold uppercase text-slate-500 md:hidden">{GOV_BRAND.title}</span>
            <LangToggle variant="light" />
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-3">
            <div className="login-gov-card w-full max-w-xl border-2 border-[#1e3a5f] bg-white flex flex-col min-h-0">
              <div className="shrink-0 border-b border-[#1e3a5f]/25 bg-[#f8fafc] px-4 py-2.5 text-center">
                <h2 className="text-base font-bold text-[#0F172A]">{t("signIn")}</h2>
                <p className="text-[10px] text-slate-600 leading-tight mt-0.5">{GOV_BRAND.department}</p>
              </div>

              <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2.5">
                <p className="login-gov-notice-compact text-[10px] leading-snug text-slate-700 line-clamp-2">
                  {t("improvement_disclaimer")}
                </p>

                <div>
                  <label htmlFor="login-role" className="login-gov-label">
                    {t("access_category")}
                  </label>
                  <select
                    id="login-role"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value as Role)}
                    className="login-gov-input login-gov-input-compact mt-0.5 w-full"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {t(r.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="login-phone" className="login-gov-label">
                      {t("phone")}
                    </label>
                    <div className="relative mt-0.5">
                      <Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                      <input
                        id="login-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="username"
                        className="login-gov-input login-gov-input-compact w-full pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="login-password" className="login-gov-label">
                      {t("password")}
                    </label>
                    <div className="relative mt-0.5">
                      <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                      <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="login-gov-input login-gov-input-compact w-full pl-7"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="login-gov-submit login-gov-submit-compact w-full">
                  {loading ? "Please wait…" : (
                    <>
                      {t("continue")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                <p className="text-[9px] text-center text-slate-500 leading-tight">{t("demoCreds")}</p>
              </form>

              <p className="shrink-0 border-t border-slate-200 px-4 py-1.5 text-[9px] text-center text-slate-500 bg-[#f8fafc]">
                Pilot environment · Demonstration data only
              </p>
            </div>
          </div>

          <p className="login-gov-form-footer shrink-0 py-1.5 text-center text-[9px] text-slate-500 sm:hidden">
            <Link to="/public/transparency" className="text-[#1e40af] font-semibold">
              Transparency
            </Link>
            {" · "}
            <Link to="/impact" className="text-[#1e40af] font-semibold">
              Impact
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
