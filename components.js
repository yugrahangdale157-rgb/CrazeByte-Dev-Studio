/* ==========================================================================
   CrazeByte Dev Studio — components.js
   Reusable UI component builders. Pure functions that return DOM nodes
   or HTML strings, used across every page via app.js.
   ========================================================================== */

(function (global) {
  "use strict";

  const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "grid", min: "USER" },
    { key: "tickets", label: "Tickets", href: "tickets.html", icon: "ticket", min: "USER" },
    { key: "chat", label: "Messages", href: "chat.html", icon: "chat", min: "USER" },
    { key: "admin", label: "Admin Panel", href: "admin.html", icon: "shield", min: "MODERATOR" },
    { key: "profile", label: "Profile", href: "profile.html", icon: "user", min: "USER" }
  ];

  const ICONS = {
    grid: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9Z" stroke="currentColor" stroke-width="1.7"/><path d="M9 7v10" stroke="currentColor" stroke-width="1.7" stroke-dasharray="2 2"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" stroke="currentColor" stroke-width="1.7"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3 4.5 6v6c0 4.5 3.2 7.4 7.5 9 4.3-1.6 7.5-4.5 7.5-9V6L12 3Z" stroke="currentColor" stroke-width="1.7"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 1 1 12 0c0 3 1 4.5 1.5 5.5H4.5C5 13.5 6 12 6 9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.7"/><path d="m20 20-4.3-4.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="m16 17 5-5-5-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6 18 18M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none"><path d="M22 2 11 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none"><path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1A2 2 0 0 1 14.2 21H9.8a2 2 0 0 1-2-1.9L7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    logo: '<svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="9" fill="url(#cbz-g)"/><path d="M10 21V11l6 5 6-5v10" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="cbz-g" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs></svg>'
  };

  function icon(name, cls) {
    return `<span class="icon ${cls || ""}">${ICONS[name] || ""}</span>`;
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  /* ---------------------------------------------------------------------
     Shell: Sidebar + Topbar
     --------------------------------------------------------------------- */
  function renderShell(activeKey, user) {
    const sidebar = document.getElementById("appSidebar");
    const topbar = document.getElementById("appTopbar");
    if (sidebar) sidebar.outerHTML = buildSidebar(activeKey, user);
    if (topbar) topbar.outerHTML = buildTopbar(user);
  }

  function buildSidebar(activeKey, user) {
    const items = NAV_ITEMS.filter((i) => window.CBZ.hasRole(user, i.min));
    const links = items
      .map(
        (i) => `
        <a href="${i.href}" class="nav-link ${i.key === activeKey ? "active" : ""}" data-nav="${i.key}">
          ${icon(i.icon)}
          <span>${i.label}</span>
        </a>`
      )
      .join("");

    return `
      <aside class="sidebar" id="appSidebar">
        <div class="brand">
          ${icon("logo", "brand-mark")}
          <div class="brand-text">
            <strong>CrazeByte</strong>
            <span>Dev Studio</span>
          </div>
        </div>
        <nav class="sidebar-nav">${links}</nav>
        <div class="sidebar-footer">
          <div class="role-pill role-${user.role.toLowerCase()}">${user.role}</div>
          <button class="btn-ghost btn-logout" id="logoutBtn">
            ${icon("logout")}<span>Sign out</span>
          </button>
        </div>
      </aside>`;
  }

  function buildTopbar(user) {
    return `
      <header class="topbar" id="appTopbar">
        <button class="icon-btn mobile-only" id="mobileMenuBtn" aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="global-search">
          ${icon("search")}
          <input type="text" id="globalSearchInput" placeholder="Search tickets, services${window.CBZ.hasRole(user, "MODERATOR") ? ", users" : ""}…" autocomplete="off" />
          <div class="search-results" id="globalSearchResults" hidden></div>
        </div>
        <div class="topbar-actions">
          <button class="icon-btn" id="notifBtn" aria-label="Notifications">
            ${icon("bell")}
            <span class="badge" id="notifBadge" hidden>0</span>
          </button>
          <div class="user-chip" id="userChip">
            <div class="avatar" style="background:${user.avatarColor || "#3B82F6"}">${window.CBZ.initials(user.name)}</div>
            <div class="user-chip-text">
              <strong>${escapeHtml(user.name)}</strong>
              <span>${escapeHtml(user.company || "")}</span>
            </div>
          </div>
        </div>
        <div class="notif-panel" id="notifPanel" hidden>
          <div class="notif-panel-head">
            <h4>Notifications</h4>
            <button class="link-btn" id="markAllReadBtn">Mark all as read</button>
          </div>
          <div class="notif-list" id="notifList"></div>
        </div>
      </header>`;
  }

  /* ---------------------------------------------------------------------
     Notifications panel content
     --------------------------------------------------------------------- */
  function renderNotifications(user) {
    const list = document.getElementById("notifList");
    const badge = document.getElementById("notifBadge");
    if (!list) return;
    const items = window.CBZ.getNotificationsForUser(user.id);
    const unread = items.filter((n) => !n.read).length;

    if (badge) {
      if (unread > 0) {
        badge.hidden = false;
        badge.textContent = unread > 9 ? "9+" : unread;
      } else {
        badge.hidden = true;
      }
    }

    if (!items.length) {
      list.innerHTML = `<div class="empty-state small">
        ${icon("bell")}
        <p>You're all caught up.</p>
      </div>`;
      return;
    }

    list.innerHTML = items
      .map(
        (n) => `
        <button class="notif-item ${n.read ? "" : "unread"}" data-id="${n.id}">
          <span class="notif-dot type-${n.type}"></span>
          <span class="notif-body">
            <strong>${escapeHtml(n.title)}</strong>
            <span>${escapeHtml(n.body)}</span>
            <time>${window.CBZ.timeAgo(n.createdAt)}</time>
          </span>
        </button>`
      )
      .join("");
  }

  /* ---------------------------------------------------------------------
     Toasts
     --------------------------------------------------------------------- */
  function ensureToastHost() {
    let host = document.getElementById("toastHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "toastHost";
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(message, variant) {
    const host = ensureToastHost();
    const el = document.createElement("div");
    el.className = `toast toast-${variant || "info"}`;
    el.innerHTML = `<span>${escapeHtml(message)}</span>`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 250);
    }, 3200);
  }

  /* ---------------------------------------------------------------------
     Modal
     --------------------------------------------------------------------- */
  function openModal(title, bodyHtml, opts) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "activeModal";
    overlay.innerHTML = `
      <div class="modal-card glass ${opts && opts.wide ? "wide" : ""}">
        <div class="modal-head">
          <h3>${escapeHtml(title)}</h3>
          <button class="icon-btn" id="modalCloseBtn">${icon("close")}</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("show"));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
    document.addEventListener("keydown", escCloseHandler);
    return overlay;
  }

  function escCloseHandler(e) {
    if (e.key === "Escape") closeModal();
  }

  function closeModal() {
    const overlay = document.getElementById("activeModal");
    if (overlay) {
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 200);
    }
    document.removeEventListener("keydown", escCloseHandler);
  }

  /* ---------------------------------------------------------------------
     Skeleton loaders
     --------------------------------------------------------------------- */
  function skeletonRows(count, height) {
    let html = "";
    for (let i = 0; i < count; i++) {
      html += `<div class="skeleton" style="height:${height || 64}px"></div>`;
    }
    return html;
  }

  function skeletonCards(count) {
    let html = "";
    for (let i = 0; i < count; i++) {
      html += `<div class="skeleton-card glass"><div class="skeleton sk-line w60"></div><div class="skeleton sk-line w90"></div><div class="skeleton sk-line w40"></div></div>`;
    }
    return html;
  }

  function withSkeleton(container, skeletonHtml, renderFn, delay) {
    container.innerHTML = skeletonHtml;
    setTimeout(() => {
      container.innerHTML = renderFn();
    }, delay || 380);
  }

  /* ---------------------------------------------------------------------
     Status / priority chips
     --------------------------------------------------------------------- */
  function statusChip(status) {
    const map = { Open: "open", "In Progress": "progress", Closed: "closed", Queued: "queued", Completed: "completed" };
    return `<span class="chip chip-${map[status] || "open"}">${escapeHtml(status)}</span>`;
  }

  function priorityChip(priority) {
    const map = { High: "high", Medium: "medium", Low: "low" };
    return `<span class="chip chip-priority chip-${map[priority] || "medium"}">${escapeHtml(priority)}</span>`;
  }

  function roleChip(role) {
    return `<span class="chip chip-role role-${role.toLowerCase()}">${role}</span>`;
  }

  /* ---------------------------------------------------------------------
     Empty states
     --------------------------------------------------------------------- */
  function emptyState(iconName, title, body, actionHtml) {
    return `
      <div class="empty-state">
        ${icon(iconName)}
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(body)}</p>
        ${actionHtml || ""}
      </div>`;
  }

  /* ---------------------------------------------------------------------
     Mini sparkline / bar chart renderer (pure SVG, no libs)
     --------------------------------------------------------------------- */
  function lineChart(series, opts) {
    const o = Object.assign({ width: 640, height: 220, color: "#3B82F6", padding: 28 }, opts || {});
    const values = series.map((p) => p.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const stepX = (o.width - o.padding * 2) / (series.length - 1 || 1);

    const points = series.map((p, i) => {
      const x = o.padding + i * stepX;
      const y = o.height - o.padding - ((p.value - min) / range) * (o.height - o.padding * 2);
      return [x, y];
    });

    const pathD = points
      .map((pt, i) => (i === 0 ? `M${pt[0]},${pt[1]}` : `L${pt[0]},${pt[1]}`))
      .join(" ");

    const areaD =
      `M${points[0][0]},${o.height - o.padding} ` +
      points.map((pt) => `L${pt[0]},${pt[1]}`).join(" ") +
      ` L${points[points.length - 1][0]},${o.height - o.padding} Z`;

    const gridLines = [0.25, 0.5, 0.75].map(
      (f) =>
        `<line x1="${o.padding}" x2="${o.width - o.padding}" y1="${o.padding + f * (o.height - o.padding * 2)}" y2="${o.padding + f * (o.height - o.padding * 2)}" class="chart-grid"/>`
    ).join("");

    const dots = points
      .map(
        (pt) => `<circle cx="${pt[0]}" cy="${pt[1]}" r="3.5" fill="${o.color}" class="chart-dot"/>`
      )
      .join("");

    const labels = series
      .map((p, i) => {
        if (series.length > 8 && i % 2 !== 0) return "";
        return `<text x="${points[i][0]}" y="${o.height - 6}" class="chart-label" text-anchor="middle">${escapeHtml(p.label)}</text>`;
      })
      .join("");

    return `
      <svg viewBox="0 0 ${o.width} ${o.height}" class="line-chart" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${o.color}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${o.color}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaD}" fill="url(#areaFill)" stroke="none"/>
        <path d="${pathD}" fill="none" stroke="${o.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-line"/>
        ${dots}
        ${labels}
      </svg>`;
  }

  function donutChart(segments, opts) {
    const o = Object.assign({ size: 160, thickness: 18 }, opts || {});
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const r = (o.size - o.thickness) / 2;
    const c = o.size / 2;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    const circles = segments
      .map((seg) => {
        const frac = seg.value / total;
        const len = frac * circumference;
        const dash = `${len} ${circumference - len}`;
        const rotation = (offset / total) * 360 - 90;
        offset += seg.value;
        return `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${o.thickness}" stroke-dasharray="${dash}" transform="rotate(${rotation} ${c} ${c})" stroke-linecap="butt" class="donut-seg"/>`;
      })
      .join("");

    return `
      <svg viewBox="0 0 ${o.size} ${o.size}" class="donut-chart">
        <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="${o.thickness}"/>
        ${circles}
      </svg>`;
  }

  function barChart(series, opts) {
    const o = Object.assign({ width: 640, height: 200, color: "#3B82F6", padding: 24 }, opts || {});
    const max = Math.max(...series.map((p) => p.value), 1);
    const gap = 10;
    const barW = (o.width - o.padding * 2) / series.length - gap;

    const bars = series
      .map((p, i) => {
        const h = ((p.value / max) * (o.height - o.padding * 2)) || 2;
        const x = o.padding + i * (barW + gap);
        const y = o.height - o.padding - h;
        return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${o.color}" class="chart-bar" style="animation-delay:${i * 35}ms"/>
                <text x="${x + barW / 2}" y="${o.height - 6}" class="chart-label" text-anchor="middle">${escapeHtml(p.label)}</text>`;
      })
      .join("");

    return `<svg viewBox="0 0 ${o.width} ${o.height}" class="bar-chart" preserveAspectRatio="xMidYMid meet">${bars}</svg>`;
  }

  /* ---------------------------------------------------------------------
     Public API
     --------------------------------------------------------------------- */
  global.CBZComponents = {
    NAV_ITEMS,
    icon,
    escapeHtml,
    renderShell,
    buildSidebar,
    buildTopbar,
    renderNotifications,
    toast,
    openModal,
    closeModal,
    skeletonRows,
    skeletonCards,
    withSkeleton,
    statusChip,
    priorityChip,
    roleChip,
    emptyState,
    lineChart,
    donutChart,
    barChart
  };
})(window);
