import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: "#050816",
  surface0: "#0B1220",
  surface1: "#111827",
  surface2: "#172033",
  surface3: "#1E2A40",
  border: "#1E2D47",
  borderGlow: "#3B82F640",
  primary: "#3B82F6",
  primaryLight: "#60A5FA",
  primaryGlow: "#93C5FD",
  primaryDim: "#1D4ED8",
  text: "#F1F5F9",
  textMuted: "#64748B",
  textDim: "#94A3B8",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK = {
  currentUser: {
    id: 1, name: "Alex Rivera", email: "alex@company.com",
    role: "OWNER", avatar: "AR", status: "active",
    lastLogin: "2026-06-20 09:14 UTC", joined: "2024-01-15",
    twoFA: true, notifications: 7,
  },
  stats: {
    totalUsers: 1284, activeUsers: 847, totalTickets: 3921,
    openTickets: 142, resolvedToday: 38, revenue: "$248,400",
    satisfaction: 96.4, growth: "+12.3%",
  },
  tickets: [
    { id: "TK-2041", subject: "API Integration Failing on Production", category: "Technical Issues", priority: "Urgent", status: "In Progress", user: "Marco Chen", created: "2h ago", updated: "12m ago", assignee: "Sarah K." },
    { id: "TK-2040", subject: "Custom Discord Bot – Phase 2 Scope", category: "Bot Development", priority: "High", status: "Waiting For Client", user: "Priya Shah", created: "5h ago", updated: "1h ago", assignee: "James L." },
    { id: "TK-2039", subject: "Invoice #INV-0221 Payment Issue", category: "Billing", priority: "High", status: "Open", user: "Tom Nguyen", created: "8h ago", updated: "8h ago", assignee: "Unassigned" },
    { id: "TK-2038", subject: "Web App Redesign – Landing Page Mockups", category: "Website Development", priority: "Medium", status: "In Progress", user: "Lisa Park", created: "1d ago", updated: "3h ago", assignee: "Sarah K." },
    { id: "TK-2037", subject: "Hosting Upgrade Request", category: "Hosting Services", priority: "Low", status: "Resolved", user: "Carlos M.", created: "2d ago", updated: "6h ago", assignee: "James L." },
    { id: "TK-2036", subject: "Partnership Inquiry – SaaS Integration", category: "Partnership Requests", priority: "Medium", status: "Pending", user: "Emma Wilson", created: "3d ago", updated: "1d ago", assignee: "Admin" },
  ],
  users: [
    { id: 1, name: "Marco Chen", email: "marco@techcorp.io", role: "USER", status: "active", tickets: 12, joined: "2024-03-10", avatar: "MC" },
    { id: 2, name: "Priya Shah", email: "priya@designlab.com", role: "USER", status: "active", tickets: 8, joined: "2024-05-22", avatar: "PS" },
    { id: 3, name: "Sarah Kim", email: "sarah@crazebyte.dev", role: "MODERATOR", status: "active", tickets: 94, joined: "2023-11-01", avatar: "SK" },
    { id: 4, name: "James Lee", email: "james@crazebyte.dev", role: "MODERATOR", status: "active", tickets: 127, joined: "2023-09-15", avatar: "JL" },
    { id: 5, name: "Tom Nguyen", email: "tom@startup.co", role: "USER", status: "suspended", tickets: 3, joined: "2024-07-08", avatar: "TN" },
    { id: 6, name: "Emma Wilson", email: "emma@ventures.com", role: "ADMIN", status: "active", tickets: 45, joined: "2023-06-20", avatar: "EW" },
    { id: 7, name: "Carlos Martinez", email: "carlos@media.net", role: "USER", status: "active", tickets: 6, joined: "2025-01-12", avatar: "CM" },
  ],
  services: [
    { id: "SVC-001", name: "Enterprise Web Application", category: "Web Applications", status: "In Progress", progress: 68, created: "2024-11-10", renewal: "2025-11-10", staff: "Sarah K.", stage: "Development Phase 3" },
    { id: "SVC-002", name: "Discord Community Bot", category: "Bot Development", status: "Completed", progress: 100, created: "2024-09-05", renewal: "2025-09-05", staff: "James L.", stage: "Delivered & Live" },
    { id: "SVC-003", name: "UI/UX Design System", category: "UI/UX Design", status: "Review", progress: 85, created: "2025-01-20", renewal: "2026-01-20", staff: "Sarah K.", stage: "Client Review" },
    { id: "SVC-004", name: "Cloud Hosting – Pro Plan", category: "Hosting Solutions", status: "Active", progress: 100, created: "2023-06-01", renewal: "2026-06-01", staff: "System", stage: "Auto-Renewed" },
  ],
  announcements: [
    { id: 1, title: "Platform v3.2.0 Released", type: "Platform Updates", content: "We've shipped major performance improvements, a redesigned notification center, and enhanced RBAC controls. All accounts upgraded automatically.", author: "CrazeByte Team", date: "2026-06-18", pinned: true, target: "All" },
    { id: 2, title: "Scheduled Maintenance – June 22", type: "Maintenance Notices", content: "Brief maintenance window from 02:00–04:00 UTC for database optimization. Minimal downtime expected.", author: "System", date: "2026-06-15", pinned: false, target: "All" },
    { id: 3, title: "New Service: AI Integration Packages", type: "News", content: "Introducing AI-powered add-ons for all existing plans. Upgrade your project with intelligent automation today.", author: "Sales Team", date: "2026-06-10", pinned: false, target: "USER" },
  ],
  messages: [
    { id: 1, sender: "Sarah K.", role: "MODERATOR", content: "Thanks for reaching out! I've reviewed the API logs and found the issue — the OAuth token refresh is failing due to an expired certificate on your end.", time: "09:42 AM", isStaff: true, avatar: "SK" },
    { id: 2, sender: "Alex Rivera", role: "OWNER", content: "Thank you for looking into this so quickly. Can you give me the exact certificate that needs to be updated? We have several running in our infra.", time: "09:51 AM", isStaff: false, avatar: "AR" },
    { id: 3, sender: "Sarah K.", role: "MODERATOR", content: "Of course! It's the `api.company.io` TLS cert — SHA-256: 4A:F8:2C... The expiry was 2026-06-18. Here's the full renewal guide from our docs.", time: "10:03 AM", isStaff: true, avatar: "SK", internal: false },
    { id: 4, sender: "James L.", role: "MODERATOR", content: "[INTERNAL NOTE] Escalate if not resolved by EOD — this is blocking their CI/CD pipeline. Priority should be Urgent.", time: "10:07 AM", isStaff: true, avatar: "JL", internal: true },
  ],
  chartData: {
    tickets: [28, 35, 42, 31, 48, 55, 38, 62, 44, 51, 67, 49],
    users: [120, 145, 168, 190, 224, 251, 289, 312, 356, 401, 445, 487],
    months: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"],
  },
  notifications: [
    { id: 1, type: "reply", title: "New reply on TK-2041", desc: "Sarah K. responded to your ticket", time: "12m ago", read: false },
    { id: 2, type: "update", title: "TK-2038 status changed", desc: "Status updated to In Progress", time: "1h ago", read: false },
    { id: 3, type: "announcement", title: "Platform v3.2.0 Released", desc: "New features available", time: "2d ago", read: false },
    { id: 4, type: "security", title: "New login detected", desc: "Chrome on macOS – San Francisco, CA", time: "3d ago", read: true },
    { id: 5, type: "service", title: "SVC-003 moved to Review", desc: "Your UI/UX Design System is ready for review", time: "4d ago", read: true },
  ],
};

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────────
const cn = (...classes) => classes.filter(Boolean).join(" ");

function Avatar({ initials, size = 36, color = C.primary, ring = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}33, ${color}66)`,
      border: `1.5px solid ${ring ? color : color + "44"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 700, color,
      boxShadow: ring ? `0 0 12px ${color}44` : "none",
      flexShrink: 0, letterSpacing: "-0.02em",
    }}>{initials}</div>
  );
}

function Badge({ label, variant = "default", size = "sm" }) {
  const configs = {
    default: { bg: C.surface3, color: C.textDim, border: C.border },
    primary: { bg: `${C.primary}20`, color: C.primaryLight, border: `${C.primary}40` },
    success: { bg: "#10B98120", color: "#10B981", border: "#10B98140" },
    warning: { bg: "#F59E0B20", color: "#F59E0B", border: "#F59E0B40" },
    error: { bg: "#EF444420", color: "#EF4444", border: "#EF444440" },
    info: { bg: "#3B82F620", color: "#60A5FA", border: "#3B82F640" },
    purple: { bg: "#8B5CF620", color: "#A78BFA", border: "#8B5CF640" },
    cyan: { bg: "#06B6D420", color: "#22D3EE", border: "#06B6D440" },
  };
  const cfg = configs[variant] || configs.default;
  const pad = size === "xs" ? "2px 6px" : "3px 10px";
  const fs = size === "xs" ? 10 : 11;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 6, padding: pad, fontSize: fs,
      fontWeight: 600, letterSpacing: "0.04em",
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function priorityVariant(p) {
  return { Urgent: "error", High: "warning", Medium: "info", Low: "default" }[p] || "default";
}
function statusVariant(s) {
  return { "Open": "info", "In Progress": "primary", "Pending": "warning", "Waiting For Client": "purple", "Resolved": "success", "Closed": "default" }[s] || "default";
}
function roleVariant(r) {
  return { OWNER: "error", ADMIN: "warning", MODERATOR: "primary", USER: "default" }[r] || "default";
}

function GlassCard({ children, style = {}, glow = false, hover = false, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: `linear-gradient(135deg, ${C.surface1}ee, ${C.surface0}cc)`,
        border: `1px solid ${hov && hover ? C.primary + "60" : C.border}`,
        borderRadius: 16, padding: 24,
        backdropFilter: "blur(12px)",
        boxShadow: glow ? `0 0 40px ${C.primary}15, inset 0 1px 0 ${C.surface3}` : `inset 0 1px 0 ${C.surface3}`,
        transition: "all 0.25s ease",
        transform: hov && hover ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >{children}</div>
  );
}

function Btn({ children, variant = "primary", size = "md", onClick, disabled, style = {}, icon }) {
  const [hov, setHov] = useState(false);
  const configs = {
    primary: {
      bg: hov ? C.primaryLight : C.primary,
      color: "#fff",
      border: C.primary,
      shadow: `0 0 20px ${C.primary}44`,
    },
    ghost: {
      bg: hov ? C.surface2 : "transparent",
      color: C.textDim,
      border: C.border,
      shadow: "none",
    },
    danger: {
      bg: hov ? "#DC2626" : "#EF4444",
      color: "#fff",
      border: "#EF4444",
      shadow: `0 0 20px #EF444440`,
    },
    subtle: {
      bg: hov ? C.surface2 : C.surface1,
      color: C.text,
      border: C.border,
      shadow: "none",
    },
  };
  const cfg = configs[variant] || configs.primary;
  const pad = size === "sm" ? "6px 14px" : size === "lg" ? "12px 28px" : "9px 20px";
  const fs = size === "sm" ? 12 : size === "lg" ? 15 : 13;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: 10, padding: pad, fontSize: fs,
        fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease", letterSpacing: "0.02em",
        boxShadow: hov ? cfg.shadow : "none",
        display: "flex", alignItems: "center", gap: 8,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
      {children}
    </button>
  );
}

function StatCard({ icon, label, value, change, variant = "default" }) {
  const colors = {
    default: C.primary,
    success: C.success,
    warning: C.warning,
    error: C.error,
  };
  const clr = colors[variant] || C.primary;
  return (
    <GlassCard style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${clr}10`, filter: "blur(20px)" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${clr}18`, border: `1px solid ${clr}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        {change && <span style={{ fontSize: 12, color: change.startsWith("+") ? C.success : C.error, fontWeight: 600, background: change.startsWith("+") ? "#10B98115" : "#EF444415", border: `1px solid ${change.startsWith("+") ? "#10B98130" : "#EF444430"}`, borderRadius: 6, padding: "2px 8px" }}>{change}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6, fontWeight: 500 }}>{label}</div>
    </GlassCard>
  );
}

function MiniChart({ data, color = C.primary, height = 48 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200, h = height;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 8) - 4,
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = path + ` L${w},${h} L0,${h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Input({ placeholder, value, onChange, type = "text", icon, style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {icon && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 14, pointerEvents: "none" }}>{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: C.surface2,
          border: `1px solid ${focus ? C.primary + "80" : C.border}`,
          borderRadius: 10, color: C.text,
          padding: icon ? "10px 14px 10px 36px" : "10px 14px",
          fontSize: 14, outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focus ? `0 0 0 3px ${C.primary}18` : "none",
          ...style,
        }}
      />
    </div>
  );
}

function Select({ value, onChange, options, style = {} }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: C.surface2, border: `1px solid ${C.border}`,
        borderRadius: 10, color: C.text, padding: "9px 14px",
        fontSize: 13, outline: "none", cursor: "pointer", ...style,
      }}
    >
      {options.map(o => <option key={o.value} value={o.value} style={{ background: C.surface1 }}>{o.label}</option>)}
    </select>
  );
}

function Table({ columns, data, onRow }) {
  return (
    <div style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{
                textAlign: "left", padding: "10px 16px",
                fontSize: 11, fontWeight: 700, color: C.textMuted,
                letterSpacing: "0.06em", textTransform: "uppercase",
                borderBottom: `1px solid ${C.border}`,
                whiteSpace: "nowrap",
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <TableRow key={ri} row={row} columns={columns} onRow={onRow} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableRow({ row, columns, onRow }) {
  const [hov, setHov] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onRow && onRow(row)}
      style={{
        background: hov ? C.surface2 + "80" : "transparent",
        transition: "background 0.15s",
        cursor: onRow ? "pointer" : "default",
        borderBottom: `1px solid ${C.border}40`,
      }}
    >
      {columns.map(col => (
        <td key={col.key} style={{ padding: "12px 16px", fontSize: 13, color: C.text, whiteSpace: "nowrap" }}>
          {col.render ? col.render(row[col.key], row) : row[col.key]}
        </td>
      ))}
    </tr>
  );
}

function Divider({ style = {} }) {
  return <div style={{ height: 1, background: C.border, margin: "20px 0", ...style }} />;
}

function Sidebar({ active, setActive, role, collapsed, setCollapsed }) {
  const items = [
    { key: "dashboard", icon: "⬡", label: "Dashboard", roles: ["USER","MODERATOR","ADMIN","OWNER"] },
    { key: "tickets", icon: "◈", label: "Tickets", roles: ["USER","MODERATOR","ADMIN","OWNER"] },
    { key: "services", icon: "◎", label: "Services", roles: ["USER","MODERATOR","ADMIN","OWNER"] },
    { key: "announcements", icon: "◉", label: "Announcements", roles: ["USER","MODERATOR","ADMIN","OWNER"] },
    { key: "notifications", icon: "◯", label: "Notifications", roles: ["USER","MODERATOR","ADMIN","OWNER"] },
    { key: "profile", icon: "◐", label: "Profile", roles: ["USER","MODERATOR","ADMIN","OWNER"] },
    { type: "divider", roles: ["MODERATOR","ADMIN","OWNER"] },
    { key: "moderator", icon: "◆", label: "Mod Panel", roles: ["MODERATOR","ADMIN","OWNER"] },
    { key: "admin", icon: "◇", label: "Admin Panel", roles: ["ADMIN","OWNER"] },
    { key: "analytics", icon: "◈", label: "Analytics", roles: ["ADMIN","OWNER"] },
    { type: "divider", roles: ["OWNER"] },
    { key: "owner", icon: "✦", label: "Control Center", roles: ["OWNER"] },
  ];

  const w = collapsed ? 64 : 240;
  return (
    <div style={{
      width: w, minHeight: "100vh", flexShrink: 0,
      background: `linear-gradient(180deg, ${C.surface0} 0%, ${C.bg}cc 100%)`,
      borderRight: `1px solid ${C.border}`,
      transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden", position: "relative", zIndex: 10,
      display: "flex", flexDirection: "column",
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, height: 72, boxSizing: "border-box", justifyContent: collapsed ? "center" : "flex-start" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDim})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 900, color: "#fff",
          boxShadow: `0 0 20px ${C.primary}44`,
        }}>⬡</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>CrazeByte</div>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Dev Studio</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {items.filter(i => !i.roles || i.roles.includes(role)).map((item, idx) => {
          if (item.type === "divider") return <div key={idx} style={{ height: 1, background: C.border, margin: "8px 8px" }} />;
          const isActive = active === item.key;
          return (
            <NavItem key={item.key} item={item} isActive={isActive} collapsed={collapsed} onClick={() => setActive(item.key)} />
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: 12, borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: "100%", padding: "8px", background: C.surface2,
            border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted,
            cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start", gap: 8,
            transition: "all 0.2s",
          }}
        >
          <span style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.25s", display: "inline-block" }}>◀</span>
          {!collapsed && <span style={{ fontSize: 12, fontWeight: 600 }}>Collapse</span>}
        </button>
      </div>
    </div>
  );
}

function NavItem({ item, isActive, collapsed, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={collapsed ? item.label : ""}
      style={{
        width: "100%", padding: collapsed ? "10px 0" : "10px 12px",
        display: "flex", alignItems: "center", gap: 12,
        justifyContent: collapsed ? "center" : "flex-start",
        background: isActive ? `${C.primary}18` : hov ? `${C.surface2}` : "transparent",
        border: `1px solid ${isActive ? C.primary + "40" : "transparent"}`,
        borderRadius: 10, cursor: "pointer", marginBottom: 2,
        transition: "all 0.15s",
        boxShadow: isActive ? `0 0 12px ${C.primary}18` : "none",
      }}
    >
      <span style={{ fontSize: 16, color: isActive ? C.primary : hov ? C.textDim : C.textMuted, transition: "color 0.15s", flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.primaryLight : hov ? C.textDim : C.textMuted, transition: "color 0.15s" }}>{item.label}</span>}
      {!collapsed && isActive && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: C.primary }} />}
    </button>
  );
}

function Topbar({ user, notifCount, onNotif, onSearch, searchVal, view }) {
  const titles = {
    dashboard: "Dashboard", tickets: "Ticket Management", services: "Services",
    announcements: "Announcements", notifications: "Notifications",
    profile: "My Profile", moderator: "Moderation Panel",
    admin: "Admin Panel", analytics: "Analytics Center",
    owner: "Owner Control Center",
  };
  return (
    <div style={{
      height: 64, background: `${C.surface0}ee`,
      borderBottom: `1px solid ${C.border}`,
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", padding: "0 24px", gap: 16,
      position: "sticky", top: 0, zIndex: 9,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{titles[view] || "Dashboard"}</div>
        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>CrazeByte Dev Studio</div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 280, width: "100%" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13 }}>⌕</span>
        <input
          placeholder="Search anything…"
          value={searchVal}
          onChange={e => onSearch(e.target.value)}
          style={{
            width: "100%", background: C.surface2, border: `1px solid ${C.border}`,
            borderRadius: 10, color: C.text, padding: "8px 14px 8px 34px",
            fontSize: 13, outline: "none", boxSizing: "border-box",
          }}
        />
        {searchVal && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.textMuted, background: C.surface3, borderRadius: 4, padding: "2px 6px", border: `1px solid ${C.border}` }}>⌘K</span>}
      </div>

      {/* Notif */}
      <button
        onClick={onNotif}
        style={{ position: "relative", width: 40, height: 40, borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 16 }}
      >
        🔔
        {notifCount > 0 && (
          <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: C.primary, boxShadow: `0 0 6px ${C.primary}` }} />
        )}
      </button>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, cursor: "pointer" }}>
        <Avatar initials={user.avatar} size={30} ring />
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{user.name.split(" ")[0]}</div>
          <div style={{ fontSize: 10 }}><Badge label={user.role} variant={roleVariant(user.role)} size="xs" /></div>
        </div>
      </div>
    </div>
  );
}

// ─── VIEWS ────────────────────────────────────────────────────────────────────

function DashboardView({ user }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const recentActivity = [
    { icon: "◈", text: "TK-2041 received a reply from Sarah K.", time: "12m ago", color: C.primary },
    { icon: "◎", text: "SVC-003 moved to Client Review stage", time: "2h ago", color: C.success },
    { icon: "◉", text: "New announcement: Platform v3.2.0", time: "2d ago", color: C.warning },
    { icon: "◯", text: "Invoice #INV-0221 generated", time: "3d ago", color: C.primaryLight },
  ];

  const quickActions = [
    { icon: "✦", label: "New Ticket", desc: "Open a support request", color: C.primary },
    { icon: "◎", label: "View Services", desc: "Check project status", color: C.success },
    { icon: "◐", label: "Edit Profile", desc: "Update your details", color: C.warning },
    { icon: "◉", label: "Announcements", desc: "Platform news", color: "#8B5CF6" },
  ];

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.surface1} 0%, ${C.surface0} 100%)`,
        border: `1px solid ${C.border}`,
        borderRadius: 20, padding: 28, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `${C.primary}08`, filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -20, right: 80, width: 100, height: 100, borderRadius: "50%", background: `${C.primaryGlow}10`, filter: "blur(30px)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar initials={user.avatar} size={56} ring />
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-0.03em" }}>
                Good {time.getHours() < 12 ? "morning" : time.getHours() < 18 ? "afternoon" : "evening"}, {user.name.split(" ")[0]} 👋
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                <Badge label={user.role} variant={roleVariant(user.role)} />
                <span style={{ fontSize: 12, color: C.textMuted }}>Last seen {user.lastLogin}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard icon="◈" label="Total Tickets" value="12" change="+2" />
        <StatCard icon="◆" label="Active Tickets" value="3" variant="warning" />
        <StatCard icon="✓" label="Resolved" value="9" variant="success" change="+1" />
        <StatCard icon="◎" label="Active Services" value="4" />
        <StatCard icon="🔔" label="Unread Alerts" value="7" variant="error" />
        <StatCard icon="◑" label="Account Status" value="Active" variant="success" />
      </div>

      {/* Middle row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* Quick Actions */}
        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.primary }}>⚡</span> Quick Actions
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {quickActions.map((a, i) => (
              <QuickActionCard key={i} {...a} />
            ))}
          </div>
        </GlassCard>

        {/* Activity Feed */}
        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.success }}>◉</span> Activity
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${a.color}18`, border: `1px solid ${a.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: a.color, flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Tickets */}
      <GlassCard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: C.primary }}>◈</span> Recent Tickets</div>
          <Badge label="12 total" variant="primary" size="xs" />
        </div>
        <Table
          columns={[
            { key: "id", label: "ID", render: v => <span style={{ fontFamily: "monospace", color: C.primaryLight, fontWeight: 700, fontSize: 12 }}>{v}</span> },
            { key: "subject", label: "Subject", render: v => <span style={{ color: C.text, fontWeight: 500 }}>{v}</span> },
            { key: "priority", label: "Priority", render: v => <Badge label={v} variant={priorityVariant(v)} size="xs" /> },
            { key: "status", label: "Status", render: v => <Badge label={v} variant={statusVariant(v)} size="xs" /> },
            { key: "updated", label: "Updated" },
          ]}
          data={MOCK.tickets.slice(0, 5)}
        />
      </GlassCard>
    </div>
  );
}

function QuickActionCard({ icon, label, desc, color }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${color}12` : C.surface2,
        border: `1px solid ${hov ? color + "40" : C.border}`,
        borderRadius: 12, padding: "14px 16px", cursor: "pointer",
        transition: "all 0.2s",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ fontSize: 20, color, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{desc}</div>
    </div>
  );
}

function TicketsView({ onTicket }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "General Support", priority: "Medium", description: "" });

  const filtered = MOCK.tickets.filter(t => {
    const matchStatus = filter === "all" || t.status.toLowerCase().replace(/ /g, "") === filter;
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filterBtns = ["all", "open", "inprogress", "pending", "resolved"];

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      {creating ? (
        <CreateTicketForm form={form} setForm={setForm} onCancel={() => setCreating(false)} onSubmit={() => setCreating(false)} />
      ) : (
        <>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Support Tickets</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>Manage and track all your support requests</div>
            </div>
            <Btn icon="✦" onClick={() => setCreating(true)}>New Ticket</Btn>
          </div>

          {/* Filters */}
          <GlassCard style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Input placeholder="Search tickets…" value={search} onChange={setSearch} icon="⌕" style={{ maxWidth: 260 }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {filterBtns.map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s",
                    background: filter === f ? `${C.primary}20` : C.surface2,
                    border: `1px solid ${filter === f ? C.primary + "50" : C.border}`,
                    color: filter === f ? C.primaryLight : C.textMuted,
                  }}>{f === "all" ? "All" : f === "inprogress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Tickets */}
          <GlassCard>
            <Table
              columns={[
                { key: "id", label: "ID", render: v => <span style={{ fontFamily: "monospace", color: C.primaryLight, fontWeight: 700, fontSize: 12 }}>{v}</span> },
                { key: "subject", label: "Subject", render: (v, row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{v}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{row.category}</div>
                  </div>
                )},
                { key: "priority", label: "Priority", render: v => <Badge label={v} variant={priorityVariant(v)} size="xs" /> },
                { key: "status", label: "Status", render: v => <Badge label={v} variant={statusVariant(v)} size="xs" /> },
                { key: "assignee", label: "Assignee" },
                { key: "updated", label: "Updated" },
              ]}
              data={filtered}
              onRow={onTicket}
            />
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted, fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>◈</div>
                No tickets found
              </div>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
}

function CreateTicketForm({ form, setForm, onCancel, onSubmit }) {
  const cats = ["General Support","Website Development","Discord Development","Bot Development","Hosting Services","Billing","Technical Issues","Custom Projects","Partnership Requests"];
  return (
    <GlassCard glow>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Create Support Ticket</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>Our team typically responds within 4 hours</div>
        </div>
        <Btn variant="ghost" size="sm" onClick={onCancel}>✕ Cancel</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject *</label>
          <Input placeholder="Briefly describe your issue" value={form.subject} onChange={v => setForm({ ...form, subject: v })} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
          <Select value={form.category} onChange={v => setForm({ ...form, category: v })} style={{ width: "100%" }}
            options={cats.map(c => ({ value: c, label: c }))} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority</label>
          <Select value={form.priority} onChange={v => setForm({ ...form, priority: v })} style={{ width: "100%" }}
            options={["Low","Medium","High","Urgent"].map(p => ({ value: p, label: p }))} />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description *</label>
        <textarea
          placeholder="Provide as much detail as possible — steps to reproduce, error messages, screenshots…"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={6}
          style={{
            width: "100%", boxSizing: "border-box", background: C.surface2,
            border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
            padding: "12px 14px", fontSize: 14, outline: "none", resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* File drop zone */}
      <div style={{
        border: `2px dashed ${C.border}`, borderRadius: 12, padding: "20px",
        textAlign: "center", marginBottom: 24, background: C.surface2 + "40",
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
        <div style={{ fontSize: 13, color: C.textMuted }}>Drag & drop files here, or click to browse</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>PNG, JPG, PDF, ZIP — up to 25MB each</div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Btn onClick={onSubmit}>Submit Ticket</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </GlassCard>
  );
}

function TicketDetailView({ ticket, onBack }) {
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState(MOCK.messages);
  const [showInternal, setShowInternal] = useState(true);
  const [typing, setTyping] = useState(false);

  const send = () => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, {
      id: prev.length + 1, sender: MOCK.currentUser.name,
      role: MOCK.currentUser.role, content: msg, time: "Just now",
      isStaff: false, avatar: MOCK.currentUser.avatar,
    }]);
    setMsg("");
    setTyping(true);
    setTimeout(() => setTyping(false), 2000);
  };

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <span style={{ fontFamily: "monospace", color: C.primaryLight, fontSize: 14, fontWeight: 700 }}>{ticket.id}</span>
        <Badge label={ticket.status} variant={statusVariant(ticket.status)} />
        <Badge label={ticket.priority} variant={priorityVariant(ticket.priority)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Chat area */}
        <GlassCard style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface2 + "60" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{ticket.subject}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{ticket.category} · Assigned to {ticket.assignee}</div>
          </div>

          {/* Toggle internal */}
          <div style={{ padding: "8px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setShowInternal(!showInternal)} style={{
              fontSize: 11, color: showInternal ? C.warning : C.textMuted,
              background: showInternal ? "#F59E0B15" : C.surface2,
              border: `1px solid ${showInternal ? "#F59E0B40" : C.border}`,
              borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontWeight: 600,
            }}>◆ {showInternal ? "Hide" : "Show"} Internal Notes</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, minHeight: 300, maxHeight: 400 }}>
            {messages.filter(m => showInternal || !m.internal).map(m => (
              <ChatMessage key={m.id} msg={m} />
            ))}
            {typing && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials="SK" size={28} color={C.success} />
                <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 16px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.textMuted, animation: `pulse ${0.8 + i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply box */}
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, background: C.surface2 + "40" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                placeholder="Type your reply…"
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                style={{
                  flex: 1, background: C.surface1, border: `1px solid ${C.border}`,
                  borderRadius: 10, color: C.text, padding: "10px 14px",
                  fontSize: 14, outline: "none",
                }}
              />
              <Btn onClick={send}>Send ↵</Btn>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>Press Enter to send · Shift+Enter for newline</div>
          </div>
        </GlassCard>

        {/* Sidebar info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14 }}>Ticket Details</div>
            {[
              ["Status", <Badge label={ticket.status} variant={statusVariant(ticket.status)} size="xs" />],
              ["Priority", <Badge label={ticket.priority} variant={priorityVariant(ticket.priority)} size="xs" />],
              ["Category", ticket.category],
              ["Created", ticket.created],
              ["Updated", ticket.updated],
              ["Assignee", ticket.assignee],
              ["Client", ticket.user],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: C.textMuted }}>{k}</span>
                <span style={{ fontSize: 12, color: C.textDim, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </GlassCard>

          <GlassCard>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14 }}>Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn variant="subtle" size="sm" icon="✓">Mark Resolved</Btn>
              <Btn variant="subtle" size="sm" icon="↑">Escalate</Btn>
              <Btn variant="ghost" size="sm" icon="✕">Close Ticket</Btn>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isOwn = msg.sender === MOCK.currentUser.name;
  const roleColors = { OWNER: C.error, ADMIN: C.warning, MODERATOR: C.success, USER: C.primary };
  const color = roleColors[msg.role] || C.primary;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: isOwn ? "row-reverse" : "row" }}>
      <Avatar initials={msg.avatar} size={32} color={color} />
      <div style={{ maxWidth: "75%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexDirection: isOwn ? "row-reverse" : "row" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color }}>{msg.sender}</span>
          <Badge label={msg.role} variant={roleVariant(msg.role)} size="xs" />
          <span style={{ fontSize: 11, color: C.textMuted }}>{msg.time}</span>
        </div>
        <div style={{
          background: msg.internal ? `${C.warning}12` : isOwn ? `${C.primary}18` : C.surface2,
          border: `1px solid ${msg.internal ? "#F59E0B30" : isOwn ? C.primary + "30" : C.border}`,
          borderRadius: 12, padding: "12px 16px", fontSize: 13, color: C.text, lineHeight: 1.6,
        }}>
          {msg.internal && <div style={{ fontSize: 10, color: C.warning, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>🔒 Internal Note</div>}
          {msg.content}
        </div>
      </div>
    </div>
  );
}

function ServicesView() {
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Your Services</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {MOCK.services.map(svc => <ServiceCard key={svc.id} svc={svc} />)}
      </div>
    </div>
  );
}

function ServiceCard({ svc }) {
  const [hov, setHov] = useState(false);
  const statusColors = { "In Progress": C.primary, Completed: C.success, Review: C.warning, Active: C.success };
  const clr = statusColors[svc.status] || C.primary;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: `linear-gradient(135deg, ${C.surface1}ee, ${C.surface0}cc)`,
        border: `1px solid ${hov ? clr + "50" : C.border}`,
        borderRadius: 16, padding: 24, transition: "all 0.25s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 8px 32px ${clr}15` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{svc.id}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{svc.name}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{svc.category}</div>
        </div>
        <Badge label={svc.status} variant={svc.status === "Completed" || svc.status === "Active" ? "success" : svc.status === "Review" ? "warning" : "primary"} size="xs" />
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.textMuted }}>Progress</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: clr }}>{svc.progress}%</span>
        </div>
        <div style={{ height: 6, background: C.surface3, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${svc.progress}%`, background: `linear-gradient(90deg, ${clr}, ${clr}aa)`, borderRadius: 99, transition: "width 0.5s ease" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
        {[["Stage", svc.stage], ["Staff", svc.staff], ["Created", svc.created], ["Renewal", svc.renewal]].map(([k, v]) => (
          <div key={k} style={{ background: C.surface2 + "80", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ color: C.textMuted, marginBottom: 2, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</div>
            <div style={{ color: C.text, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsView() {
  const typeColors = {
    "Platform Updates": C.primary,
    "Maintenance Notices": C.warning,
    "News": C.success,
    "Security Alerts": C.error,
    "Service Updates": "#8B5CF6",
  };
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Announcements</div>
      {MOCK.announcements.map(ann => {
        const clr = typeColors[ann.type] || C.primary;
        return (
          <GlassCard key={ann.id} style={{ borderLeft: `3px solid ${clr}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  {ann.pinned && <Badge label="📌 Pinned" variant="warning" size="xs" />}
                  <Badge label={ann.type} size="xs" style={{ background: `${clr}18`, color: clr, border: `1px solid ${clr}30` }} />
                  <span style={{ fontSize: 11, color: C.textMuted }}>For: {ann.target}</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{ann.title}</div>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, whiteSpace: "nowrap" }}>{ann.date}</div>
            </div>
            <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.7, marginBottom: 12 }}>{ann.content}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Posted by <span style={{ color: C.textDim, fontWeight: 600 }}>{ann.author}</span></div>
          </GlassCard>
        );
      })}
    </div>
  );
}

function NotificationsView() {
  const [notifs, setNotifs] = useState(MOCK.notifications);
  const typeIcons = { reply: "◈", update: "◎", announcement: "◉", security: "🔐", service: "◆" };
  const typeColors = { reply: C.primary, update: C.success, announcement: C.warning, security: C.error, service: "#8B5CF6" };

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Notifications</div>
        <Btn variant="ghost" size="sm" onClick={() => setNotifs(notifs.map(n => ({ ...n, read: true })))}>Mark all read</Btn>
      </div>
      <GlassCard style={{ padding: 0, overflow: "hidden" }}>
        {notifs.map((n, i) => {
          const clr = typeColors[n.type] || C.primary;
          return (
            <div key={n.id} style={{
              display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 24px",
              borderBottom: i < notifs.length - 1 ? `1px solid ${C.border}40` : "none",
              background: n.read ? "transparent" : `${C.primary}06`,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${clr}18`, border: `1px solid ${clr}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: clr, flexShrink: 0 }}>{typeIcons[n.type]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{n.desc}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>{n.time}</span>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, boxShadow: `0 0 6px ${C.primary}` }} />}
              </div>
            </div>
          );
        })}
      </GlassCard>
    </div>
  );
}

function ProfileView({ user }) {
  const [tab, setTab] = useState("info");
  const tabs = [["info", "Profile Info"], ["security", "Security"], ["notif", "Notifications"], ["sessions", "Sessions"]];
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>My Profile</div>

      {/* Profile card */}
      <GlassCard style={{ background: `linear-gradient(135deg, ${C.surface1}f0, ${C.surface0}e0)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Avatar initials={user.avatar} size={72} ring />
            <button style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: C.primary, border: "2px solid " + C.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✎</button>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-0.03em" }}>{user.name}</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginTop: 2 }}>{user.email}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Badge label={user.role} variant={roleVariant(user.role)} />
              <Badge label="✓ Verified" variant="success" size="xs" />
              {user.twoFA && <Badge label="2FA On" variant="primary" size="xs" />}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.textMuted }}>Member since</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>{user.joined}</div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: "transparent", border: "none", color: tab === key ? C.primaryLight : C.textMuted,
            borderBottom: `2px solid ${tab === key ? C.primary : "transparent"}`,
            transition: "all 0.15s", marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {tab === "info" && (
        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>Personal Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              ["Full Name", user.name], ["Email", user.email],
              ["Role", user.role], ["Status", "Active"],
            ].map(([label, val]) => (
              <div key={label}>
                <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>{label}</label>
                <Input value={val} onChange={() => {}} />
              </div>
            ))}
          </div>
          <Btn>Save Changes</Btn>
        </GlassCard>
      )}

      {tab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Change Password</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {["Current Password", "New Password", "Confirm New Password"].map(p => (
                <div key={p}>
                  <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{p}</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              ))}
            </div>
            <Btn>Update Password</Btn>
          </GlassCard>
          <GlassCard>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Two-Factor Authentication</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>Add an extra layer of security to your account</div>
              </div>
              <div>
                <Badge label={user.twoFA ? "✓ Enabled" : "Disabled"} variant={user.twoFA ? "success" : "default"} />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "sessions" && (
        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Active Sessions</div>
          {[
            { device: "Chrome on macOS", loc: "San Francisco, CA", time: "Active now", current: true },
            { device: "Safari on iPhone 15", loc: "San Francisco, CA", time: "3 hours ago", current: false },
            { device: "Chrome on Windows", loc: "New York, NY", time: "2 days ago", current: false },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 2 ? `1px solid ${C.border}40` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💻</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.device}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{s.loc} · {s.time}</div>
                </div>
              </div>
              {s.current ? <Badge label="Current" variant="success" size="xs" /> : <Btn variant="ghost" size="sm">Revoke</Btn>}
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}

function ModeratorView() {
  const assignedTickets = MOCK.tickets.filter(t => t.assignee === "Sarah K." || t.assignee === "James L.");
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Moderation Panel</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>Manage assigned tickets and customer support</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard icon="◆" label="Assigned to Me" value="8" />
        <StatCard icon="⏳" label="Pending Response" value="3" variant="warning" />
        <StatCard icon="↑" label="Escalated" value="1" variant="error" />
        <StatCard icon="✓" label="Resolved Today" value="5" variant="success" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Ticket Queue */}
        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.primary }}>◈</span> My Ticket Queue
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {assignedTickets.map(t => (
              <div key={t.id} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: C.primaryLight, fontWeight: 700 }}>{t.id}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Badge label={t.priority} variant={priorityVariant(t.priority)} size="xs" />
                    <Badge label={t.status} variant={statusVariant(t.status)} size="xs" />
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{t.subject}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{t.user} · {t.updated}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Moderation tools */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["◈", "View Full Ticket Queue", C.primary],
                ["◎", "Browse Customer Profiles", C.success],
                ["↑", "Review Escalated Cases", C.error],
                ["📝", "Add Internal Notes", C.warning],
              ].map(([icon, label, clr]) => (
                <button key={label} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  background: C.surface2, border: `1px solid ${C.border}`,
                  borderRadius: 10, cursor: "pointer", color: C.text, fontSize: 13, fontWeight: 600,
                  transition: "all 0.15s",
                }}>
                  <span style={{ color: clr, fontSize: 16 }}>{icon}</span> {label}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Today's Activity</div>
            {[
              ["Closed 3 tickets", "9:15 AM"],
              ["Escalated TK-2041", "10:02 AM"],
              ["Added internal note", "10:07 AM"],
              ["Responded to 5 tickets", "11:30 AM"],
            ].map(([act, time]) => (
              <div key={act} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}30`, fontSize: 12 }}>
                <span style={{ color: C.textDim }}>{act}</span>
                <span style={{ color: C.textMuted }}>{time}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function AdminView() {
  const [tab, setTab] = useState("users");
  const tabs = [["users", "Users"], ["tickets", "Tickets"], ["announcements", "Announcements"], ["services", "Services"]];
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Admin Panel</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>Full platform administration and management</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard icon="👥" label="Total Users" value={MOCK.stats.totalUsers.toLocaleString()} change="+12" />
        <StatCard icon="◈" label="Open Tickets" value={MOCK.stats.openTickets} variant="warning" />
        <StatCard icon="✓" label="Resolved Today" value={MOCK.stats.resolvedToday} variant="success" change="+5" />
        <StatCard icon="★" label="Satisfaction" value={`${MOCK.stats.satisfaction}%`} variant="success" />
      </div>

      <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: "transparent", border: "none", color: tab === key ? C.primaryLight : C.textMuted,
            borderBottom: `2px solid ${tab === key ? C.primary : "transparent"}`,
            transition: "all 0.15s", marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {tab === "users" && (
        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>All Users</div>
            <div style={{ display: "flex", gap: 10 }}>
              <Input placeholder="Search users…" icon="⌕" style={{ width: 220 }} />
              <Btn size="sm">Export CSV</Btn>
            </div>
          </div>
          <Table
            columns={[
              { key: "avatar", label: "", render: (_, r) => <Avatar initials={r.avatar} size={28} /> },
              { key: "name", label: "Name", render: v => <span style={{ fontWeight: 700, color: C.text }}>{v}</span> },
              { key: "email", label: "Email", render: v => <span style={{ color: C.textMuted }}>{v}</span> },
              { key: "role", label: "Role", render: v => <Badge label={v} variant={roleVariant(v)} size="xs" /> },
              { key: "status", label: "Status", render: v => <Badge label={v} variant={v === "active" ? "success" : "error"} size="xs" /> },
              { key: "tickets", label: "Tickets", render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
              { key: "joined", label: "Joined" },
              { key: "id", label: "Actions", render: (_, r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn size="sm" variant="ghost">View</Btn>
                  <Btn size="sm" variant="ghost">Edit</Btn>
                </div>
              )},
            ]}
            data={MOCK.users}
          />
        </GlassCard>
      )}

      {tab === "tickets" && (
        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>All Tickets</div>
            <div style={{ display: "flex", gap: 10 }}>
              <Input placeholder="Search tickets…" icon="⌕" style={{ width: 220 }} />
              <Select value="all" onChange={() => {}} style={{ width: 160 }} options={[{value:"all",label:"All Statuses"},{value:"open",label:"Open"},{value:"resolved",label:"Resolved"}]} />
            </div>
          </div>
          <Table
            columns={[
              { key: "id", label: "ID", render: v => <span style={{ fontFamily: "monospace", color: C.primaryLight, fontWeight: 700, fontSize: 12 }}>{v}</span> },
              { key: "subject", label: "Subject" },
              { key: "user", label: "Client" },
              { key: "priority", label: "Priority", render: v => <Badge label={v} variant={priorityVariant(v)} size="xs" /> },
              { key: "status", label: "Status", render: v => <Badge label={v} variant={statusVariant(v)} size="xs" /> },
              { key: "assignee", label: "Assigned" },
              { key: "updated", label: "Updated" },
            ]}
            data={MOCK.tickets}
          />
        </GlassCard>
      )}

      {tab === "announcements" && (
        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Announcements</div>
            <Btn size="sm" icon="✦">Create Announcement</Btn>
          </div>
          {MOCK.announcements.map(ann => (
            <div key={ann.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${C.border}40` }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  {ann.pinned && <Badge label="📌 Pinned" variant="warning" size="xs" />}
                  <Badge label={ann.type} size="xs" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{ann.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{ann.date} · {ann.author}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn size="sm" variant="ghost">Edit</Btn>
                <Btn size="sm" variant="danger">Delete</Btn>
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}

function AnalyticsView() {
  const { tickets: tv, users: uv, months } = MOCK.chartData;
  const max_t = Math.max(...tv), max_u = Math.max(...uv);
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Analytics Center</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>Platform performance and growth metrics</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard icon="👥" label="Total Users" value={MOCK.stats.totalUsers.toLocaleString()} change="+12.3%" />
        <StatCard icon="◈" label="Tickets This Month" value="142" change="+8.7%" variant="warning" />
        <StatCard icon="$" label="Revenue" value={MOCK.stats.revenue} change={MOCK.stats.growth} variant="success" />
        <StatCard icon="★" label="Satisfaction" value={`${MOCK.stats.satisfaction}%`} change="+1.2%" variant="success" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Ticket Volume</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Last 12 months</div>
          <BarChart data={tv} months={months} color={C.primary} max={max_t} />
        </GlassCard>

        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>User Growth</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Cumulative registrations</div>
          <div style={{ height: 160 }}>
            <MiniChart data={uv} color={C.success} height={160} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {months.filter((_, i) => i % 3 === 0).map(m => (
              <span key={m} style={{ fontSize: 10, color: C.textMuted }}>{m}</span>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* KPIs */}
      <GlassCard>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Key Performance Indicators</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { label: "Avg. Resolution Time", value: "4.2h", target: "< 6h", ok: true },
            { label: "First Response Time", value: "47min", target: "< 2h", ok: true },
            { label: "Ticket Deflection Rate", value: "34%", target: "> 25%", ok: true },
            { label: "Active User Rate", value: "66%", target: "> 60%", ok: true },
            { label: "Churn Rate", value: "2.1%", target: "< 3%", ok: true },
            { label: "NPS Score", value: "72", target: "> 60", ok: true },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em" }}>{kpi.value}</div>
              <div style={{ fontSize: 11, marginTop: 6, color: kpi.ok ? C.success : C.error }}>
                {kpi.ok ? "✓" : "✗"} Target: {kpi.target}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function BarChart({ data, months, color, max }) {
  return (
    <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 6 }}>
      {data.map((v, i) => {
        const pct = (v / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: `linear-gradient(180deg, ${color}, ${color}88)`, height: `${pct}%`, minHeight: 4, transition: "height 0.5s ease", position: "relative" }}>
              <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: C.textMuted, whiteSpace: "nowrap" }}>{v}</div>
            </div>
            <span style={{ fontSize: 9, color: C.textMuted }}>{months[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

function OwnerView() {
  const [tab, setTab] = useState("overview");
  const tabs = [["overview", "Overview"], ["settings", "Settings"], ["roles", "Roles"], ["audit", "Audit Logs"], ["monitoring", "Monitoring"]];
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.error}18`, border: `1px solid ${C.error}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✦</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Owner Control Center</div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Full system access and platform oversight</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Badge label="OWNER ACCESS" variant="error" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${C.border}` }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: "transparent", border: "none", color: tab === key ? C.primaryLight : C.textMuted,
            borderBottom: `2px solid ${tab === key ? C.primary : "transparent"}`,
            transition: "all 0.15s", marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <StatCard icon="👥" label="Total Users" value={MOCK.stats.totalUsers.toLocaleString()} change="+12.3%" />
            <StatCard icon="🎫" label="Total Tickets" value={MOCK.stats.totalTickets.toLocaleString()} />
            <StatCard icon="$" label="Revenue" value={MOCK.stats.revenue} change={MOCK.stats.growth} variant="success" />
            <StatCard icon="★" label="Satisfaction" value={`${MOCK.stats.satisfaction}%`} variant="success" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "System Health", value: "99.98%", icon: "◎", color: C.success, desc: "All systems operational" },
              { label: "API Response Time", value: "142ms", icon: "⚡", color: C.primary, desc: "p95 response time" },
              { label: "Active Sessions", value: "847", icon: "◯", color: C.warning, desc: "Concurrent users" },
            ].map(s => (
              <GlassCard key={s.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: s.color }}>{s.icon}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{s.label}</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.text }}>{s.value}</div>
                <div style={{ fontSize: 12, color: s.color, marginTop: 4 }}>{s.desc}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { title: "Site Settings", icon: "⚙️", items: ["Site Name", "Domain", "Support Email", "Timezone"] },
            { title: "Brand Settings", icon: "🎨", items: ["Primary Color", "Logo URL", "Favicon", "Brand Name"] },
            { title: "Email Settings", icon: "📧", items: ["SMTP Host", "SMTP Port", "From Address", "Reply-To"] },
            { title: "Security Policies", icon: "🔐", items: ["Password Policy", "Session Timeout", "Rate Limits", "2FA Enforcement"] },
          ].map(s => (
            <GlassCard key={s.title}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{s.icon}</span> {s.title}
              </div>
              {s.items.map(item => (
                <div key={item} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item}</label>
                  <Input placeholder={`Enter ${item.toLowerCase()}…`} />
                </div>
              ))}
              <Btn size="sm">Save {s.title}</Btn>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === "roles" && (
        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Permission Matrix</div>
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: C.textMuted, borderBottom: `1px solid ${C.border}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>Permission</th>
                  {["USER","MODERATOR","ADMIN","OWNER"].map(r => (
                    <th key={r} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>
                      <Badge label={r} variant={roleVariant(r)} size="xs" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Create Tickets", true, true, true, true],
                  ["View Own Tickets", true, true, true, true],
                  ["Respond to Tickets", false, true, true, true],
                  ["Close Tickets", false, true, true, true],
                  ["Manage All Users", false, false, true, true],
                  ["Create Announcements", false, false, true, true],
                  ["View Analytics", false, false, true, true],
                  ["System Settings", false, false, false, true],
                  ["Audit Logs", false, false, false, true],
                  ["Manage Admins", false, false, false, true],
                ].map(([perm, ...roles]) => (
                  <tr key={perm} style={{ borderBottom: `1px solid ${C.border}30` }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.textDim }}>{perm}</td>
                    {roles.map((has, i) => (
                      <td key={i} style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontSize: 16, color: has ? C.success : C.textMuted }}>{has ? "✓" : "·"}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {tab === "audit" && (
        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Audit Log</div>
            <div style={{ display: "flex", gap: 10 }}>
              <Input placeholder="Filter logs…" icon="⌕" style={{ width: 200 }} />
              <Btn size="sm" variant="ghost">Export</Btn>
            </div>
          </div>
          {[
            { user: "Alex Rivera", role: "OWNER", action: "Updated system settings", target: "Site Config", time: "09:14:22", ip: "192.168.1.1", severity: "info" },
            { user: "Emma Wilson", role: "ADMIN", action: "Suspended user account", target: "User #5 (Tom Nguyen)", time: "08:42:11", ip: "10.0.0.4", severity: "warning" },
            { user: "Sarah Kim", role: "MODERATOR", action: "Closed ticket TK-2037", target: "TK-2037", time: "08:15:44", ip: "10.0.0.3", severity: "info" },
            { user: "System", role: "SYSTEM", action: "Scheduled maintenance triggered", target: "Database", time: "02:00:00", ip: "internal", severity: "info" },
            { user: "Unknown", role: "UNKNOWN", action: "Failed login attempt", target: "Auth System", time: "01:23:55", ip: "45.33.22.11", severity: "error" },
          ].map((log, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
              borderBottom: `1px solid ${C.border}30`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: { info: C.success, warning: C.warning, error: C.error }[log.severity],
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                  <span style={{ color: C.primaryLight, fontWeight: 700 }}>{log.user}</span> {log.action}
                  <span style={{ color: C.textMuted }}> → {log.target}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>IP: {log.ip}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge label={log.role} variant={roleVariant(log.role)} size="xs" />
                <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>{log.time}</span>
              </div>
            </div>
          ))}
        </GlassCard>
      )}

      {tab === "monitoring" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { name: "Web Server", status: "Healthy", uptime: "99.99%", color: C.success },
              { name: "Database", status: "Healthy", uptime: "99.97%", color: C.success },
              { name: "File Storage", status: "Healthy", uptime: "100%", color: C.success },
              { name: "WebSocket Server", status: "Healthy", uptime: "99.95%", color: C.success },
              { name: "Email Service", status: "Degraded", uptime: "98.2%", color: C.warning },
              { name: "CDN", status: "Healthy", uptime: "100%", color: C.success },
            ].map(s => (
              <GlassCard key={s.name} style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.name}</div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                </div>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 6 }}>{s.status}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Uptime: {s.uptime}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AUTH VIEWS ───────────────────────────────────────────────────────────────
function LoginView({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Left panel */}
      <div style={{
        flex: 1, background: `linear-gradient(135deg, ${C.surface0} 0%, ${C.bg} 100%)`,
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: `${C.primary}08`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "5%", width: 200, height: 200, borderRadius: "50%", background: `${C.primaryGlow}06`, filter: "blur(60px)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 60 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 0 24px ${C.primary}44` }}>⬡</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>CrazeByte</div>
              <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Dev Studio</div>
            </div>
          </div>

          <div style={{ fontSize: 40, fontWeight: 900, color: C.text, letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 20 }}>
            Your projects,<br /><span style={{ color: C.primaryLight }}>one portal.</span>
          </div>
          <div style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.7, maxWidth: 360 }}>
            Track projects, manage tickets, and communicate with our team — all in one enterprise-grade platform.
          </div>

          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              ["◈", "Real-time ticket communication"],
              ["◎", "Live project progress tracking"],
              ["◆", "Enterprise-grade security"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${C.primary}18`, border: `1px solid ${C.primary}25`, display: "flex", alignItems: "center", justifyContent: "center", color: C.primary }}>{icon}</div>
                <span style={{ fontSize: 14, color: C.textDim }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – form */}
      <div style={{ width: 460, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 60px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", marginBottom: 8 }}>Sign in</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>Welcome back. Enter your credentials to continue.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email address</label>
            <Input type="email" placeholder="you@company.com" value={email} onChange={setEmail} icon="@" />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
              <span style={{ fontSize: 12, color: C.primaryLight, cursor: "pointer" }}>Forgot?</span>
            </div>
            <Input type="password" placeholder="••••••••" value={pass} onChange={setPass} />
          </div>
        </div>

        <Btn onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15 }}>
          {loading ? "Signing in…" : "Sign in →"}
        </Btn>

        <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 12, color: C.textMuted }}>or demo any role</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {["USER", "MODERATOR", "ADMIN", "OWNER"].map(r => (
            <button key={r} onClick={onLogin} style={{
              padding: "9px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700,
              background: C.surface2, border: `1px solid ${C.border}`, color: C.textMuted, transition: "all 0.15s",
            }}>{r}</button>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: "center", fontSize: 13, color: C.textMuted }}>
          No account? <span style={{ color: C.primaryLight, cursor: "pointer" }}>Request access →</span>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const user = MOCK.currentUser;

  if (!authed) return <LoginView onLogin={() => setAuthed(true)} />;

  const handleTicket = (ticket) => {
    setActiveTicket(ticket);
    setView("ticket-detail");
  };

  const handleSetView = (v) => {
    setActiveTicket(null);
    setView(v);
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: C.bg, color: C.text,
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      fontSize: 14,
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.surface0}; }
        ::-webkit-scrollbar-thumb { background: ${C.surface3}; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.textMuted}; }
        input::placeholder, textarea::placeholder { color: ${C.textMuted}; }
        select option { background: ${C.surface1}; color: ${C.text}; }
        @keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
      `}</style>

      <Sidebar active={view} setActive={handleSetView} role={user.role} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          user={user}
          notifCount={MOCK.notifications.filter(n => !n.read).length}
          onNotif={() => setShowNotif(!showNotif)}
          onSearch={setSearch}
          searchVal={search}
          view={view}
        />

        {/* Notification drawer */}
        {showNotif && (
          <div style={{
            position: "fixed", top: 64, right: 0, width: 360, maxHeight: "calc(100vh - 64px)",
            background: C.surface0, borderLeft: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
            overflow: "auto", zIndex: 100, boxShadow: `-8px 4px 40px ${C.bg}88`,
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, color: C.text }}>Notifications</div>
              <button onClick={() => setShowNotif(false)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            {MOCK.notifications.map((n, i) => {
              const typeIcons = { reply: "◈", update: "◎", announcement: "◉", security: "🔐", service: "◆" };
              const typeColors = { reply: C.primary, update: C.success, announcement: C.warning, security: C.error, service: "#8B5CF6" };
              const clr = typeColors[n.type] || C.primary;
              return (
                <div key={n.id} style={{
                  display: "flex", gap: 12, padding: "14px 20px",
                  borderBottom: `1px solid ${C.border}30`,
                  background: n.read ? "transparent" : `${C.primary}05`,
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${clr}18`, border: `1px solid ${clr}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: clr, flexShrink: 0 }}>{typeIcons[n.type]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{n.desc}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{n.time}</div>
                  </div>
                  {!n.read && <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: C.primary, flexShrink: 0, marginTop: 4 }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {view === "dashboard" && <DashboardView user={user} />}
          {view === "tickets" && <TicketsView onTicket={handleTicket} />}
          {view === "ticket-detail" && activeTicket && <TicketDetailView ticket={activeTicket} onBack={() => handleSetView("tickets")} />}
          {view === "services" && <ServicesView />}
          {view === "announcements" && <AnnouncementsView />}
          {view === "notifications" && <NotificationsView />}
          {view === "profile" && <ProfileView user={user} />}
          {view === "moderator" && <ModeratorView />}
          {view === "admin" && <AdminView />}
          {view === "analytics" && <AnalyticsView />}
          {view === "owner" && <OwnerView />}
        </div>
      </div>
    </div>
  );
}
