"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Download,
  FileSpreadsheet,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";

type Status = "حاضر" | "مرخصی" | "خارج‌شده";

type Employee = {
  id: string;
  name: string;
  family: string;
  username: string;
  password?: string;
  phone?: string;
  national?: string;
  status: Status;
  hours: number;
  today: number;
  overtime: number;
  hourly?: number;
  leaveLimit?: number;
  leaveTaken: number;
  initials: string;
  color: string;
};

const seed: Employee[] = [
  { id: "EMP-024", name: "آرمان", family: "رضایی", username: "arman.r", phone: "0912 345 6789", status: "حاضر", hours: 148.5, today: 6.2, overtime: 4.5, hourly: 180000, leaveLimit: 24, leaveTaken: 6, initials: "آر", color: "#dff3eb" },
  { id: "EMP-018", name: "نگار", family: "احمدی", username: "negar.a", phone: "0935 120 4488", status: "حاضر", hours: 136.25, today: 5.8, overtime: 0, leaveTaken: 0, initials: "ن", color: "#f3e8ff" },
  { id: "EMP-031", name: "پارسا", family: "محمدی", username: "parsa.m", status: "مرخصی", hours: 122, today: 0, overtime: 2, hourly: 210000, leaveTaken: 0, initials: "پ", color: "#fff0d9" },
  { id: "EMP-012", name: "سارا", family: "کریمی", username: "sara.k", phone: "0910 443 2190", status: "حاضر", hours: 158.75, today: 7.1, overtime: 8, leaveTaken: 0, initials: "س", color: "#e1edff" },
  { id: "EMP-027", name: "کیان", family: "حسینی", username: "kian.h", status: "خارج‌شده", hours: 104.5, today: 4.4, overtime: 0, leaveTaken: 0, initials: "ک", color: "#ffe4e6" },
];

const fa = (n: number, digits = 1) =>
  new Intl.NumberFormat("fa-IR", { maximumFractionDigits: digits }).format(n);

const nav = [
  { name: "پیشخوان", icon: LayoutDashboard },
  { name: "کارکنان", icon: Users },
  { name: "گزارش ماهانه", icon: FileSpreadsheet },
  { name: "مدیریت دوره", icon: CalendarDays },
];

const palette = ["#dff3eb", "#f3e8ff", "#fff0d9", "#e1edff", "#ffe4e6", "#e9e6ff", "#fdeee8", "#e6f7f2"];

const toNum = (v: FormDataEntryValue | null): number | undefined => {
  const n = Number(v);
  return n > 0 ? n : undefined;
};

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>(seed);
  const [page, setPage] = useState("پیشخوان");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("همه");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [theme, setTheme] = useState("mint");
  const [font, setFont] = useState("vazirmatn");
  const [orgName, setOrgName] = useState("نوآوران فردا");
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPass, setAdminPass] = useState("admin");
  const [toast, setToast] = useState("");
  const [time, setTime] = useState(new Date(0));
  const [logged, setLogged] = useState(false);
  const [login, setLogin] = useState({ u: "", p: "" });
  const [selectedMonth, setSelectedMonth] = useState("آبان ۱۴۰۵");
  const [showActions, setShowActions] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const t = setInterval(() => {
      if (mounted) setTime(new Date());
    }, 1000);
    const init = setTimeout(() => {
      if (!mounted) return;
      setTime(new Date());
      try {
        const s = localStorage.getItem("attendance-demo");
        if (s) setEmployees(JSON.parse(s));
      } catch {}
      try {
        const s = localStorage.getItem("attendance-settings");
        if (s) {
          const o = JSON.parse(s);
          if (o.theme) setTheme(o.theme);
          if (o.font) setFont(o.font);
          if (o.orgName) setOrgName(o.orgName);
          if (o.adminUser) setAdminUser(o.adminUser);
          if (o.adminPass) setAdminPass(o.adminPass);
        }
      } catch {}
    }, 0);
    return () => {
      mounted = false;
      clearInterval(t);
      clearTimeout(init);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("attendance-demo", JSON.stringify(employees));
    } catch {}
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "attendance-settings",
        JSON.stringify({ theme, font, orgName, adminUser, adminPass })
      );
    } catch {}
  }, [theme, font, orgName, adminUser, adminPass]);

  const total = employees.length;
  const present = employees.filter((e) => e.status === "حاضر").length;
  const worked = employees.reduce((s, e) => s + e.hours, 0);

  const filtered = useMemo(
    () =>
      employees.filter((e) => {
        const matchQ = `${e.name} ${e.family} ${e.username} ${e.id}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchS = statusFilter === "همه" || e.status === statusFilter;
        return matchQ && matchS;
      }),
    [employees, query, statusFilter]
  );

  function notify(s: string) {
    setToast(s);
    setTimeout(() => setToast(""), 2600);
  }

  function exportCsv() {
    const rows = [
      ["نام", "نام خانوادگی", "نام کاربری", "کد ملی", "کد پرسنلی", "شماره همراه", "وضعیت", "ساعت کارکرد", "اضافه‌کاری", "دستمزد ساعتی (تومان)"],
      ...employees.map((e) => [
        e.name,
        e.family,
        e.username,
        e.national || "",
        e.id,
        e.phone || "",
        e.status,
        String(e.hours),
        String(e.overtime),
        e.hourly ? String(e.hourly) : "",
      ]),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((r) => r.map((x) => `"${x.replaceAll('"', '""')}"`).join(","))
        .join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `attendance-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify("گزارش ماهانه دریافت شد");
  }

  function action(id: string, kind: Status) {
    setEmployees((es) => es.map((e) => (e.id === id ? { ...e, status: kind } : e)));
    setShowActions(null);
    notify(kind === "حاضر" ? "ورود ثبت شد" : kind === "مرخصی" ? "مرخصی ثبت شد" : "خروج ثبت شد");
  }

  function nextId(es: Employee[]): string {
    let id = "";
    do {
      id = `EMP-${String(Math.floor(100 + Math.random() * 899))}`;
    } while (es.some((e) => e.id === id));
    return id;
  }

  function addEmployee(f: FormData) {
    const name = String(f.get("name") || "").trim();
    const username = String(f.get("username") || "").trim();
    const password = String(f.get("password") || "").trim();
    if (!name || !username || !password) {
      notify("نام، شناسهٔ کاربری و رمز عبور الزامی است");
      return;
    }
    setEmployees((es) => [
      {
        id: nextId(es),
        name,
        family: String(f.get("family") || ""),
        username,
        password,
        phone: String(f.get("phone") || ""),
        national: String(f.get("national") || ""),
        status: "خارج‌شده",
        hours: 0,
        today: 0,
        overtime: 0,
        hourly: toNum(f.get("hourly")),
        leaveLimit: toNum(f.get("leaveLimit")),
        leaveTaken: 0,
        initials: name.slice(0, 1),
        color: palette[Math.floor(Math.random() * palette.length)],
      },
      ...es,
    ]);
    setModal(false);
    notify("کارمند جدید اضافه شد");
  }

  function saveEdit(f: FormData) {
    if (!editing) return;
    const name = String(f.get("name") || "").trim();
    const username = String(f.get("username") || "").trim();
    const password = String(f.get("password") || "").trim();
    if (!name || !username) {
      notify("نام و شناسهٔ کاربری الزامی است");
      return;
    }
    setEmployees((es) =>
      es.map((e) =>
        e.id === editing.id
          ? {
              ...e,
              name,
              family: String(f.get("family") || ""),
              username,
              password: password || e.password,
              phone: String(f.get("phone") || ""),
              national: String(f.get("national") || ""),
              hourly: toNum(f.get("hourly")),
              leaveLimit: toNum(f.get("leaveLimit")),
              initials: name.slice(0, 1),
            }
          : e
      )
    );
    setEditing(null);
    notify("اطلاعات کارمند به‌روزرسانی شد");
  }

  function confirmDelete() {
    if (!deleting) return;
    setEmployees((es) => es.filter((e) => e.id !== deleting.id));
    setDeleting(null);
    notify("کارمند حذف شد");
  }

  const rootClass = `app theme-${theme}${font === "arad" ? " font-arad" : ""}`;

  if (!logged)
    return (
      <main className={`login-shell${font === "arad" ? " font-arad" : ""}`} dir="rtl">
        <div className="login-art">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-chip">
            <Activity size={18} /> حضور و غیاب هوشمند
          </div>
          <div className="art-copy">
            <div className="art-mark">ر</div>
            <h1>
              وقت ارزشمندترین
              <br />
              دارایی شماست.
            </h1>
            <p>مدیریت دقیق زمان، شروع یک تیم هماهنگ و موفق است.</p>
            <div className="art-foot">
              <span>● ● ●</span>
              <span>تجربه‌ای روان، برای یک روز کاری بهتر</span>
            </div>
          </div>
        </div>
        <div className="login-panel">
          <div className="login-top">
            <span className="brand-icon">ر</span>
            <span>
              رَوَند <small>سامانه حضور و غیاب</small>
            </span>
          </div>
          <div className="login-box">
            <div className="login-caption">خوش برگشتی 👋</div>
            <h2>ورود به پنل مدیریت</h2>
            <p>برای ادامه، اطلاعات حساب خود را وارد کنید.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (login.u === adminUser && login.p === adminPass) {
                  setLogged(true);
                  notify("خوش آمدید");
                } else notify("شناسه یا رمز عبور نادرست است");
              }}
            >
              <label>شناسهٔ کاربری</label>
              <div className="field">
                <Users size={18} />
                <input
                  placeholder="مثلاً admin"
                  value={login.u}
                  onChange={(e) => setLogin({ ...login, u: e.target.value })}
                />
              </div>
              <label>رمز عبور</label>
              <div className="field">
                <ShieldCheck size={18} />
                <input
                  type="password"
                  placeholder="رمز عبور را وارد کنید"
                  value={login.p}
                  onChange={(e) => setLogin({ ...login, p: e.target.value })}
                />
              </div>
              <button className="primary login-btn">
                ورود به پنل <ArrowLeft size={18} />
              </button>
            </form>
            <button
              className="employee-login"
              onClick={() => notify("ورود کارکنان با کد یکبارمصرف در نسخهٔ بعدی فعال می‌شود")}
            >
              ورود کارکنان با Google Authenticator <ArrowLeft size={15} />
            </button>
            <div className="login-hint">
              ورود آزمایشی: <b>admin / admin</b>
            </div>
          </div>
          <div className="login-legal">
            رَوَند — مدیریت زمان با آرامش بیشتر <span>نسخهٔ آزمایشی ۱.۰</span>
          </div>
        </div>
      </main>
    );

  return (
    <main className={rootClass} dir="rtl">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">ر</span>
          <div>
            <b>رَوَند</b>
            <small>مدیریت حضور و غیاب</small>
          </div>
          <button className="side-collapse">
            <ArrowLeft size={16} />
          </button>
        </div>
        <div className="company">
          <div className="company-logo">{orgName.slice(0, 1)}</div>
          <div>
            <b>{orgName}</b>
            <small>فضای کاری شما</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">فضای کاری</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.name}
              className={`nav-item ${page === n.name ? "active" : ""}`}
              onClick={() => setPage(n.name)}
            >
              <n.icon size={19} />
              <span>{n.name}</span>
              {n.name === "گزارش ماهانه" && <span className="nav-pill">جدید</span>}
            </button>
          ))}
        </nav>
        <div className="nav-label management-label">مدیریت</div>
        <button
          className={`nav-item ${page === "تنظیمات" ? "active" : ""}`}
          onClick={() => setPage("تنظیمات")}
        >
          <Settings2 size={19} />
          <span>تنظیمات</span>
        </button>
        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon">
              <Sparkles size={17} />
            </div>
            <b>کمک لازم دارید؟</b>
            <p>راهنمای رَوَند همیشه در دسترس شماست.</p>
            <button onClick={() => notify("راهنمای رَوَند به‌زودی در دسترس است")}>
              مشاهدهٔ راهنما <ArrowLeft size={14} />
            </button>
          </div>
          <div className="profile-mini">
            <div className="avatar admin-avatar">آ</div>
            <div>
              <b>آرین کریمی</b>
              <small>مدیر کل</small>
            </div>
            <button onClick={() => setLogged(false)} title="خروج">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="crumb">
            فضای کاری <span>/</span> <b>{page}</b>
          </div>
          <div className="top-actions">
            <span className="live-indicator">
              <i /> زنده
            </span>
            <div className="date-chip">
              <CalendarDays size={16} />
              {new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" }).format(time)}
            </div>
            <button className="icon-button notification" onClick={() => notify("اعلان تازه‌ای ندارید")}>
              <Bell size={19} />
              <i />
            </button>
            <div className="avatar top-avatar">آ</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                یکشنبه،{" "}
                {new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(time)}
              </div>
              <h1>{page === "پیشخوان" ? "روز بخیر، آرین 👋" : page}</h1>
              <p>
                {page === "پیشخوان"
                  ? "نمای کلی وضعیت تیم شما در یک نگاه."
                  : "اطلاعات و فعالیت‌های تیم خود را مدیریت کنید."}
              </p>
            </div>
            <div className="heading-actions">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option>آبان ۱۴۰۵</option>
                <option>مهر ۱۴۰۵</option>
                <option>شهریور ۱۴۰۵</option>
              </select>
              <button className="outline" onClick={exportCsv}>
                <Download size={17} /> دریافت گزارش
              </button>
              <button className="primary" onClick={() => setModal(true)}>
                <Plus size={18} /> افزودن کارمند
              </button>
            </div>
          </div>

          {page === "تنظیمات" ? (
            <div className="settings-view">
              <div className="settings-card">
                <h3>ظاهر پنل مدیریت</h3>
                <p>رنگ و حال‌وهوای فضای کاری خود را انتخاب کنید.</p>
                <div className="theme-grid">
                  {[
                    { id: "mint", name: "سبز و سفید", color: "#19a779" },
                    { id: "dark", name: "مشکی و نارنجی", color: "#f28b43" },
                    { id: "blue", name: "آبی و سفید", color: "#4e78df" },
                    { id: "brown", name: "قهوه‌ای و سفید", color: "#947252" },
                    { id: "mono", name: "مشکی و سفید", color: "#34383b" },
                  ].map((t) => (
                    <button
                      className={`theme-choice ${theme === t.id ? "chosen" : ""}`}
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                    >
                      <span style={{ background: t.color }} />
                      <div>
                        <b>{t.name}</b>
                        <small>تم روشن</small>
                      </div>
                      {theme === t.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
                <h3 className="subhead">تنظیمات سازمان</h3>
                <label className="setting-label">نام مجموعه</label>
                <div className="field setting-field">
                  <input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <label className="setting-label">خانوادهٔ فونت</label>
                <select className="font-select" value={font} onChange={(e) => setFont(e.target.value)}>
                  <option value="vazirmatn">وزیرمتن</option>
                  <option value="arad">آراد</option>
                </select>
                <button className="primary save-settings" onClick={() => notify("تنظیمات ظاهری ذخیره شد")}>
                  ذخیرهٔ تنظیمات <Check size={16} />
                </button>
              </div>

              <div className="settings-card security-card">
                <div className="security-icon">
                  <ShieldCheck size={22} />
                </div>
                <h3>امنیت و ورود</h3>
                <p>
                  نام کاربری و رمز عبور مدیر را می‌توانید در همین بخش تغییر دهید. این اطلاعات به‌صورت محلی
                  در مرورگر ذخیره می‌شود.
                </p>
                <div className="security-row">
                  <span>ورود دومرحله‌ای کارکنان</span>
                  <span className="badge badge-pending">نیازمند راه‌اندازی</span>
                </div>
                <label className="setting-label">نام کاربری مدیر</label>
                <div className="field setting-field">
                  <Users size={16} />
                  <input value={adminUser} onChange={(e) => setAdminUser(e.target.value)} />
                </div>
                <label className="setting-label">رمز عبور مدیر</label>
                <div className="field setting-field">
                  <KeyRound size={16} />
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                  />
                </div>
                <button className="primary save-settings" onClick={() => notify("اطلاعات ورود مدیر ذخیره شد")}>
                  ذخیرهٔ تغییرات <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span>کل کارکنان</span>
                    <span className="stat-icon purple">
                      <Users size={19} />
                    </span>
                  </div>
                  <div className="stat-value">
                    {fa(total, 0)}
                    <small>نفر</small>
                  </div>
                  <div className="stat-foot">
                    <span className="trend">↗ ۱۲٪</span>
                    <span>نسبت به ماه قبل</span>
                    <div className="mini-bars">
                      {[20, 36, 29, 47, 34, 61, 52, 78, 60, 85].map((x, i) => (
                        <i key={i} style={{ height: `${x}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>حاضر در محل</span>
                    <span className="stat-icon green">
                      <Activity size={19} />
                    </span>
                  </div>
                  <div className="stat-value">
                    {fa(present, 0)}
                    <small>نفر</small>
                  </div>
                  <div className="stat-foot">
                    <span className="live-note">
                      <i /> {fa(Math.round((present / Math.max(total, 1)) * 100), 0)}٪
                    </span>
                    <span>از کل کارکنان</span>
                    <div className="avatar-stack">
                      <span>آ</span>
                      <span>ن</span>
                      <span>س</span>
                      <b>+{fa(Math.max(present - 3, 0), 0)}</b>
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>ساعت کارکرد این ماه</span>
                    <span className="stat-icon orange">
                      <Clock3 size={19} />
                    </span>
                  </div>
                  <div className="stat-value">
                    {fa(Math.floor(worked), 0)}
                    <small>ساعت</small>
                  </div>
                  <div className="stat-foot">
                    <span className="trend">↗ ۸٪</span>
                    <span>نسبت به ماه قبل</span>
                    <svg className="spark" viewBox="0 0 100 32" preserveAspectRatio="none">
                      <path d="M0 26 C10 22 14 25 23 17 S36 20 45 14 S58 18 67 8 S80 14 88 6 S96 8 100 2" />
                    </svg>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>اضافه‌کاری تأییدشده</span>
                    <span className="stat-icon blue">
                      <Wallet size={19} />
                    </span>
                  </div>
                  <div className="stat-value">
                    {fa(employees.reduce((s, e) => s + e.overtime, 0), 0)}
                    <small>ساعت</small>
                  </div>
                  <div className="stat-foot">
                    <span className="muted">۸ ساعت کاری روزانه</span>
                    <span className="approval-dot">
                      <i />
                      نیازمند تأیید مدیر
                    </span>
                  </div>
                </div>
              </div>

              <div className="overview-grid">
                <section className="panel attendance-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>وضعیت امروز</h2>
                      <p>فعالیت لحظه‌ای کارکنان</p>
                    </div>
                    <button className="dots" onClick={() => notify("گزارش وضعیت امروز")}>
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  <div className="attendance-content">
                    <div className="donut-wrap">
                      <div className="donut">
                        <div>
                          <b>{fa(total, 0)}</b>
                          <small>کارمند</small>
                        </div>
                      </div>
                      <div className="donut-caption">
                        <span>
                          <i className="legend-green" /> حاضر
                        </span>
                        <span>
                          <i className="legend-orange" /> مرخصی
                        </span>
                        <span>
                          <i className="legend-gray" /> خارج از محل
                        </span>
                      </div>
                    </div>
                    <div className="attendance-detail">
                      <div className="attendance-number">
                        <div>
                          <span className="detail-dot green-dot" />
                          حاضر
                        </div>
                        <b>
                          {fa(present, 0)} <small>نفر</small>
                        </b>
                        <div className="progress">
                          <i style={{ width: `${(present / Math.max(total, 1)) * 100}%` }} />
                        </div>
                      </div>
                      <div className="attendance-number">
                        <div>
                          <span className="detail-dot orange-dot" />
                          در مرخصی
                        </div>
                        <b>
                          {fa(employees.filter((e) => e.status === "مرخصی").length, 0)} <small>نفر</small>
                        </b>
                        <div className="progress orange-progress">
                          <i
                            style={{
                              width: `${
                                (employees.filter((e) => e.status === "مرخصی").length / Math.max(total, 1)) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="attendance-number">
                        <div>
                          <span className="detail-dot gray-dot" />
                          خارج از محل
                        </div>
                        <b>
                          {fa(employees.filter((e) => e.status === "خارج‌شده").length, 0)} <small>نفر</small>
                        </b>
                        <div className="progress gray-progress">
                          <i
                            style={{
                              width: `${
                                (employees.filter((e) => e.status === "خارج‌شده").length / Math.max(total, 1)) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="update-time">
                        <span className="live-indicator">
                          <i /> به‌روزرسانی زنده
                        </span>
                        <span>{new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(time)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="panel hours-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>روند ساعت کاری</h2>
                      <p>مجموع ساعات ثبت‌شده در ماه جاری</p>
                    </div>
                    <select className="small-select">
                      <option>این ماه</option>
                      <option>ماه قبل</option>
                    </select>
                  </div>
                  <div className="chart-total">
                    <b>
                      {fa(Math.round(worked), 0)} <small>ساعت</small>
                    </b>
                    <span className="trend">↗ ۸.۲٪</span>
                  </div>
                  <div className="chart">
                    <div className="chart-y">
                      <span>۲۰۰</span>
                      <span>۱۵۰</span>
                      <span>۱۰۰</span>
                      <span>۵۰</span>
                      <span>۰</span>
                    </div>
                    <div className="chart-plot">
                      <div className="gridline g1" />
                      <div className="gridline g2" />
                      <div className="gridline g3" />
                      <div className="gridline g4" />
                      <svg viewBox="0 0 600 170" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0" stopColor="var(--accent)" stopOpacity=".22" />
                            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          className="chart-area"
                          d="M0 128 C36 112 50 118 80 100 S126 110 155 79 S199 99 230 76 S271 85 305 62 S347 77 380 47 S425 61 460 42 S510 51 540 25 S575 37 600 12 V170 H0Z"
                        />
                        <path
                          className="chart-line"
                          d="M0 128 C36 112 50 118 80 100 S126 110 155 79 S199 99 230 76 S271 85 305 62 S347 77 380 47 S425 61 460 42 S510 51 540 25 S575 37 600 12"
                        />
                      </svg>
                      <div className="chart-x">
                        <span>۱ آبان</span>
                        <span>۵ آبان</span>
                        <span>۱۰ آبان</span>
                        <span>۱۵ آبان</span>
                        <span>۲۰ آبان</span>
                        <span>۳۰ آبان</span>
                      </div>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i /> امسال
                    </span>
                    <span>
                      <i /> ماه قبل
                    </span>
                  </div>
                </section>
              </div>

              <section className="panel team-panel">
                <div className="team-heading">
                  <div>
                    <div className="title-inline">
                      <h2>{page === "کارکنان" ? "فهرست کارکنان" : "حضور و غیاب تیم"}</h2>
                      <span className="count-badge">{fa(total, 0)} نفر</span>
                    </div>
                    <p>وضعیت و ساعت کارکرد کارکنان در {selectedMonth}</p>
                  </div>
                  <div className="table-actions">
                    <div className="search-box">
                      <Search size={16} />
                      <input
                        placeholder="جستجوی نام کارمند..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      <kbd>⌘ K</kbd>
                    </div>
                    <select
                      className="filter-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>همه</option>
                      <option>حاضر</option>
                      <option>مرخصی</option>
                      <option>خارج‌شده</option>
                    </select>
                    <button className="table-menu" onClick={exportCsv}>
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>کارمند</th>
                        <th>وضعیت امروز</th>
                        <th>ساعت امروز</th>
                        <th>کارکرد ماه</th>
                        <th>اضافه‌کاری</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((e) => (
                        <tr key={e.id}>
                          <td>
                            <div className="employee-cell">
                              <div className="avatar employee-avatar" style={{ background: e.color }}>
                                {e.initials}
                              </div>
                              <div>
                                <b>
                                  {e.name} {e.family}
                                </b>
                                <small>
                                  {e.id} <i /> {e.username}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                e.status === "حاضر"
                                  ? "badge-present"
                                  : e.status === "مرخصی"
                                  ? "badge-leave"
                                  : "badge-out"
                              }`}
                            >
                              <i />
                              {e.status}
                            </span>
                          </td>
                          <td>
                            <b className="hours-main">
                              {fa(e.today, 1)} <small>ساعت</small>
                            </b>
                          </td>
                          <td>
                            <div className="month-hours">
                              <b>{fa(e.hours, 2)}</b>
                              <span>
                                <i style={{ width: `${Math.min((e.hours / 176) * 100, 100)}%` }} />
                              </span>
                            </div>
                          </td>
                          <td>
                            {e.overtime > 0 ? (
                              <span className="overtime">
                                +{fa(e.overtime, 1)} <small>ساعت</small>
                              </span>
                            ) : (
                              <span className="muted">—</span>
                            )}
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="clock-action"
                                onClick={() => action(e.id, e.status === "حاضر" ? "خارج‌شده" : "حاضر")}
                              >
                                {e.status === "حاضر" ? (
                                  <>
                                    <ArrowUpLeft size={14} /> ثبت خروج
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownLeft size={14} /> ثبت ورود
                                  </>
                                )}
                              </button>
                              <button
                                className="dots row-dots"
                                onClick={() => setShowActions(showActions === e.id ? null : e.id)}
                              >
                                <MoreHorizontal size={17} />
                              </button>
                              {showActions === e.id && (
                                <div className="action-menu">
                                  <button onClick={() => action(e.id, "حاضر")}>ثبت ورود</button>
                                  <button onClick={() => action(e.id, "خارج‌شده")}>ثبت خروج</button>
                                  <button onClick={() => action(e.id, "مرخصی")}>ثبت مرخصی</button>
                                  <button
                                    onClick={() => {
                                      setEditing(e);
                                      setShowActions(null);
                                    }}
                                  >
                                    <Pencil size={12} /> ویرایش
                                  </button>
                                  <button
                                    className="danger"
                                    onClick={() => {
                                      setDeleting(e);
                                      setShowActions(null);
                                    }}
                                  >
                                    <Trash2 size={12} /> حذف
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="empty">کارمندی با این مشخصات پیدا نشد.</div>
                  )}
                </div>
                <div className="table-footer">
                  <span>
                    نمایش {fa(filtered.length, 0)} از {fa(total, 0)} کارمند
                  </span>
                  <div>
                    <button disabled>قبلی</button>
                    <button className="page-current">۱</button>
                    <button disabled>بعدی</button>
                  </div>
                  <button className="view-all" onClick={() => setPage("کارکنان")}>
                    مشاهدهٔ همه <ArrowLeft size={14} />
                  </button>
                </div>
              </section>

              <footer className="content-footer">
                <span>© ۱۴۰۵ رَوَند. ساخته‌شده برای روزهای بهتر.</span>
                <span>
                  <i /> سیستم فعال است <span className="footer-sep">·</span> آخرین همگام‌سازی{" "}
                  {new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(time)}
                </span>
              </footer>
            </>
          )}
        </div>
      </section>

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <form className="employee-modal" action={addEmployee}>
            <div className="modal-head">
              <div>
                <div className="modal-icon">
                  <Users size={19} />
                </div>
                <h2>افزودن کارمند</h2>
                <p>اطلاعات اولیهٔ حساب کاربری را وارد کنید.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModal(false)}>
                <X size={20} />
              </button>
            </div>
            <label>
              نام <b>*</b>
            </label>
            <input name="name" required placeholder="نام کارمند" />
            <label>نام خانوادگی</label>
            <input name="family" placeholder="نام خانوادگی" />
            <label>
              شناسهٔ کاربری <b>*</b>
            </label>
            <input name="username" required placeholder="مثلاً ali.r" />
            <label>
              رمز عبور <b>*</b>
            </label>
            <input name="password" required type="password" placeholder="رمز عبور اولیه" />
            <label>کد ملی</label>
            <input name="national" placeholder="۱۰ رقمی" />
            <label>شمارهٔ همراه</label>
            <input name="phone" placeholder="09xx xxx xxxx" />
            <label>دستمزد ساعتی (تومان)</label>
            <input name="hourly" type="number" placeholder="مثلاً ۱۸۰۰۰۰" />
            <label>سقف مرخصی (ساعت)</label>
            <input name="leaveLimit" type="number" placeholder="مثلاً ۲۴" />
            <div className="modal-note">
              نام، شناسهٔ کاربری و رمز عبور الزامی هستند. سایر موارد اختیاری‌اند و در گزارش اکسل قابل مشاهده خواهند بود.
            </div>
            <div className="modal-buttons">
              <button type="button" className="outline" onClick={() => setModal(false)}>
                انصراف
              </button>
              <button className="primary">
                <Plus size={16} /> افزودن کارمند
              </button>
            </div>
          </form>
        </div>
      )}

      {editing && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <form className="employee-modal" action={saveEdit} key={editing.id}>
            <div className="modal-head">
              <div>
                <div className="modal-icon">
                  <Pencil size={19} />
                </div>
                <h2>ویرایش کارمند</h2>
                <p>اطلاعات حساب کاربری را به‌روزرسانی کنید.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setEditing(null)}>
                <X size={20} />
              </button>
            </div>
            <label>
              نام <b>*</b>
            </label>
            <input name="name" required defaultValue={editing.name} placeholder="نام کارمند" />
            <label>نام خانوادگی</label>
            <input name="family" defaultValue={editing.family} placeholder="نام خانوادگی" />
            <label>
              شناسهٔ کاربری <b>*</b>
            </label>
            <input name="username" required defaultValue={editing.username} placeholder="مثلاً ali.r" />
            <label>رمز عبور</label>
            <input name="password" type="password" placeholder="خالی = بدون تغییر" />
            <label>کد ملی</label>
            <input name="national" defaultValue={editing.national || ""} placeholder="۱۰ رقمی" />
            <label>شمارهٔ همراه</label>
            <input name="phone" defaultValue={editing.phone || ""} placeholder="09xx xxx xxxx" />
            <label>دستمزد ساعتی (تومان)</label>
            <input name="hourly" type="number" defaultValue={editing.hourly || ""} placeholder="مثلاً ۱۸۰۰۰۰" />
            <label>سقف مرخصی (ساعت)</label>
            <input name="leaveLimit" type="number" defaultValue={editing.leaveLimit || ""} placeholder="مثلاً ۲۴" />
            <div className="modal-note">
              شناسهٔ پرسنلی <b>{editing.id}</b> ثابت است و قابل تغییر نیست.
            </div>
            <div className="modal-buttons">
              <button type="button" className="outline" onClick={() => setEditing(null)}>
                انصراف
              </button>
              <button className="primary">
                <Check size={16} /> ذخیرهٔ تغییرات
              </button>
            </div>
          </form>
        </div>
      )}

      {deleting && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleting(null);
          }}
        >
          <div className="confirm-modal">
            <div className="confirm-icon">
              <Trash2 size={22} />
            </div>
            <h2>حذف کارمند</h2>
            <p>
              آیا از حذف <b>{deleting.name} {deleting.family}</b> مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="modal-buttons">
              <button className="outline" onClick={() => setDeleting(null)}>
                انصراف
              </button>
              <button className="primary danger-btn" onClick={confirmDelete}>
                <Trash2 size={15} /> حذف کارمند
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </main>
  );
}
