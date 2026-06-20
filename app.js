/* ==========================================================================
   CrazeByte Dev Studio — app.js
   Application controller. Boots auth, wires the shell (sidebar/topbar),
   and runs page-specific logic based on document.body.dataset.page.
   ========================================================================== */

(function () {
  "use strict";

  const C = window.CBZComponents;
  const D = window.CBZ;

  document.addEventListener("DOMContentLoaded", () => {
    D.seedIfNeeded();
    const page = document.body.dataset.page;

    if (page === "auth") {
      initAuthPage();
      return;
    }

    const user = D.getCurrentUser();
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    C.renderShell(page, user);
    wireShell(user);
    routePage(page, user);
  });

  /* ---------------------------------------------------------------------
     Shell wiring shared across all authenticated pages
     --------------------------------------------------------------------- */
  function wireShell(user) {
    const sidebar = document.getElementById("appSidebar");
    if (sidebar) {
      sidebar.addEventListener("click", (e) => {
        const btn = e.target.closest("#logoutBtn");
        if (btn) {
          D.logout();
          window.location.href = "index.html";
        }
      });
    }

    document.body.addEventListener("click", (e) => {
      if (e.target.closest("#mobileMenuBtn")) {
        document.getElementById("appSidebar").classList.toggle("open");
      } else if (!e.target.closest(".sidebar") && !e.target.closest("#mobileMenuBtn")) {
        const sb = document.getElementById("appSidebar");
        if (sb && sb.classList.contains("open") && window.innerWidth < 980) sb.classList.remove("open");
      }
    });

    const notifBtn = document.getElementById("notifBtn");
    const notifPanel = document.getElementById("notifPanel");
    if (notifBtn && notifPanel) {
      C.renderNotifications(user);
      notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notifPanel.hidden = !notifPanel.hidden;
        if (!notifPanel.hidden) C.renderNotifications(user);
      });
      document.addEventListener("click", (e) => {
        if (!notifPanel.hidden && !e.target.closest("#notifPanel") && !e.target.closest("#notifBtn")) {
          notifPanel.hidden = true;
        }
      });
      notifPanel.addEventListener("click", (e) => {
        const item = e.target.closest(".notif-item");
        if (item) {
          D.markNotificationRead(item.dataset.id);
          C.renderNotifications(user);
        }
        const markAll = e.target.closest("#markAllReadBtn");
        if (markAll) {
          D.markAllNotificationsRead(user.id);
          C.renderNotifications(user);
          C.toast("All notifications marked as read.", "success");
        }
      });
    }

    wireGlobalSearch(user);
  }

  function wireGlobalSearch(user) {
    const input = document.getElementById("globalSearchInput");
    const results = document.getElementById("globalSearchResults");
    if (!input || !results) return;

    let debounceTimer = null;
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      const q = input.value;
      debounceTimer = setTimeout(() => runSearch(q), 120);
    });

    input.addEventListener("focus", () => {
      if (input.value.trim()) results.hidden = false;
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".global-search")) results.hidden = true;
    });

    function runSearch(q) {
      if (!q.trim()) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }
      const r = D.globalSearch(q, user);
      const sections = [];

      if (r.tickets.length) {
        sections.push(
          `<div class="search-group"><span>Tickets</span>${r.tickets
            .slice(0, 5)
            .map(
              (t) =>
                `<a class="search-row" href="tickets.html?ticket=${t.id}">${C.icon("ticket")}<span>${C.escapeHtml(t.subject)}</span></a>`
            )
            .join("")}</div>`
        );
      }
      if (r.services.length) {
        sections.push(
          `<div class="search-group"><span>Services</span>${r.services
            .slice(0, 5)
            .map(
              (s) =>
                `<a class="search-row" href="dashboard.html#services">${C.icon("grid")}<span>${C.escapeHtml(s.name)}</span></a>`
            )
            .join("")}</div>`
        );
      }
      if (r.users.length) {
        sections.push(
          `<div class="search-group"><span>Users</span>${r.users
            .slice(0, 5)
            .map(
              (u) =>
                `<a class="search-row" href="admin.html?user=${u.id}">${C.icon("user")}<span>${C.escapeHtml(u.name)} — ${C.escapeHtml(u.email)}</span></a>`
            )
            .join("")}</div>`
        );
      }

      if (!sections.length) {
        results.innerHTML = `<div class="search-empty">No matches for "${C.escapeHtml(q)}"</div>`;
      } else {
        results.innerHTML = sections.join("");
      }
      results.hidden = false;
    }
  }

  function routePage(page, user) {
    if (page === "dashboard") initDashboard(user);
    if (page === "tickets") initTickets(user);
    if (page === "chat") initChat(user);
    if (page === "admin") initAdmin(user);
    if (page === "profile") initProfile(user);
  }

  /* =======================================================================
     AUTH PAGE (index.html)
     ======================================================================= */
  function initAuthPage() {
    const existing = D.getCurrentUser();
    if (existing) {
      window.location.href = "dashboard.html";
      return;
    }

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const errorBox = document.getElementById("authError");

    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.hidden = false;
    }
    function clearError() {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }

    function setTab(which) {
      clearError();
      if (which === "login") {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        loginForm.hidden = false;
        registerForm.hidden = true;
      } else {
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        registerForm.hidden = false;
        loginForm.hidden = true;
      }
    }

    tabLogin.addEventListener("click", () => setTab("login"));
    tabRegister.addEventListener("click", () => setTab("register"));

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearError();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      const submitBtn = loginForm.querySelector("button[type=submit]");
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      setTimeout(() => {
        const res = D.login(email, password);
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        if (!res.ok) {
          showError(res.error);
          return;
        }
        window.location.href = "dashboard.html";
      }, 450);
    });

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearError();
      const name = document.getElementById("regName").value;
      const email = document.getElementById("regEmail").value;
      const company = document.getElementById("regCompany").value;
      const password = document.getElementById("regPassword").value;
      const role = document.querySelector('input[name="regRole"]:checked').value;
      const submitBtn = registerForm.querySelector("button[type=submit]");
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      setTimeout(() => {
        const res = D.registerUser({ name, email, password, role, company });
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        if (!res.ok) {
          showError(res.error);
          return;
        }
        D.login(email, password);
        window.location.href = "dashboard.html";
      }, 450);
    });

    document.querySelectorAll(".demo-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        setTab("login");
        document.getElementById("loginEmail").value = chip.dataset.email;
        document.getElementById("loginPassword").value = chip.dataset.password;
      });
    });
  }

  /* =======================================================================
     DASHBOARD
     ======================================================================= */
  function initDashboard(user) {
    document.getElementById("welcomeName").textContent = user.name.split(" ")[0];
    document.getElementById("welcomeRole").textContent = user.role;

    const statsEl = document.getElementById("statsGrid");
    C.withSkeleton(statsEl, C.skeletonCards(4), () => renderStats(user), 320);

    const feedEl = document.getElementById("activityFeed");
    C.withSkeleton(feedEl, C.skeletonRows(5, 56), () => renderActivityFeed(user), 420);

    const servicesEl = document.getElementById("servicesPreview");
    C.withSkeleton(servicesEl, C.skeletonCards(3), () => renderServicesPreview(), 500);

    const chartEl = document.getElementById("dashboardChart");
    setTimeout(() => renderDashboardChart(chartEl), 560);

    document.getElementById("newTicketQuickBtn").addEventListener("click", () => {
      window.location.href = "tickets.html?new=1";
    });
  }

  function renderStats(user) {
    const tickets = D.getTicketsForUser(user.id, user.role);
    const open = tickets.filter((t) => t.status === "Open").length;
    const inProgress = tickets.filter((t) => t.status === "In Progress").length;
    const services = D.getServices();
    const activeServices = services.filter((s) => s.status !== "Completed").length;
    const unread = D.unreadNotificationCount(user.id);

    const cards = [
      { label: "Open Tickets", value: open, hint: "Awaiting first response", color: "#3B82F6" },
      { label: "In Progress", value: inProgress, hint: "Actively being worked", color: "#8B5CF6" },
      { label: "Active Services", value: activeServices, hint: `${services.length} total engagements`, color: "#22D3EE" },
      { label: "Unread Alerts", value: unread, hint: "In your notification center", color: "#F59E0B" }
    ];

    return cards
      .map(
        (c) => `
        <div class="stat-card glass">
          <div class="stat-top">
            <span class="stat-label">${c.label}</span>
            <span class="stat-dot" style="background:${c.color}"></span>
          </div>
          <div class="stat-value">${c.value}</div>
          <div class="stat-hint">${c.hint}</div>
        </div>`
      )
      .join("");
  }

  function renderActivityFeed(user) {
    const items = D.hasRole(user, "MODERATOR") ? D.getRecentActivity(8) : D.getActivityForUser(user.id, 8);
    if (!items.length) {
      return C.emptyState("grid", "No activity yet", "Once you start working in the portal, your activity will show up here.");
    }
    return `<ul class="feed-list">${items
      .map((a) => {
        const actor = D.getUserById(a.userId);
        return `<li class="feed-item">
          <div class="avatar small" style="background:${actor ? actor.avatarColor : "#3B82F6"}">${D.initials(actor ? actor.name : "?")}</div>
          <div class="feed-text">
            <span><strong>${C.escapeHtml(actor ? actor.name : "Someone")}</strong> ${C.escapeHtml(a.text)}</span>
            <time>${D.timeAgo(a.createdAt)}</time>
          </div>
        </li>`;
      })
      .join("")}</ul>`;
  }

  function renderServicesPreview() {
    const services = D.getServices().slice(0, 3);
    return services
      .map(
        (s) => `
        <div class="service-card glass">
          <div class="service-head">
            <h4>${C.escapeHtml(s.name)}</h4>
            ${C.statusChip(s.status)}
          </div>
          <p>${C.escapeHtml(s.description)}</p>
          <div class="progress-track">
            <div class="progress-fill" style="width:${s.progress}%"></div>
          </div>
          <div class="service-foot">
            <span>${s.progress}% complete</span>
            <span>Owner: ${C.escapeHtml(s.owner)}</span>
          </div>
        </div>`
      )
      .join("");
  }

  function renderDashboardChart(container) {
    const snap = D.getAnalyticsSnapshot();
    const series = snap.series.map((d) => ({ label: d.label, value: d.tickets }));
    container.innerHTML = C.lineChart(series, { color: "#3B82F6" });
  }

  /* =======================================================================
     TICKETS
     ======================================================================= */
  function initTickets(user) {
    let activeFilter = "All";
    let searchTerm = "";

    const listEl = document.getElementById("ticketsList");
    const filterBar = document.getElementById("ticketFilters");
    const searchInput = document.getElementById("ticketSearchInput");
    const newBtn = document.getElementById("newTicketBtn");

    function draw() {
      C.withSkeleton(
        listEl,
        C.skeletonRows(4, 92),
        () => buildTicketRows(user, activeFilter, searchTerm),
        260
      );
    }

    draw();

    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      draw();
    });

    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value;
      draw();
    });

    newBtn.addEventListener("click", () => openNewTicketModal(user, draw));

    listEl.addEventListener("click", (e) => {
      const row = e.target.closest(".ticket-row");
      const statusBtn = e.target.closest("[data-status-action]");
      if (statusBtn) {
        e.stopPropagation();
        const ticketId = statusBtn.closest(".ticket-row").dataset.id;
        D.updateTicketStatus(ticketId, statusBtn.dataset.statusAction, user);
        C.toast(`Ticket marked as ${statusBtn.dataset.statusAction}.`, "success");
        draw();
        return;
      }
      if (row) {
        window.location.href = "chat.html?ticket=" + row.dataset.id;
      }
    });

    if (new URLSearchParams(window.location.search).get("new") === "1") {
      openNewTicketModal(user, draw);
    }
  }

  function buildTicketRows(user, filter, search) {
    let tickets = D.getTicketsForUser(user.id, user.role);
    if (filter !== "All") tickets = tickets.filter((t) => t.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      tickets = tickets.filter(
        (t) => t.subject.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }
    tickets = tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    if (!tickets.length) {
      return C.emptyState(
        "ticket",
        "No tickets found",
        "Try a different filter or search term, or create a new ticket to get started.",
        `<button class="btn-primary" id="emptyNewTicketBtn">${C.icon("plus")}<span>New ticket</span></button>`
      );
    }

    const isStaff = D.hasRole(user, "MODERATOR");

    return tickets
      .map((t) => {
        const creator = D.getUserById(t.createdBy);
        const msgCount = D.getMessagesForTicket(t.id).length;
        const actions =
          t.status !== "Closed"
            ? `<div class="row-actions">
                ${t.status !== "In Progress" ? `<button class="mini-btn" data-status-action="In Progress">Start</button>` : ""}
                <button class="mini-btn mini-btn-danger" data-status-action="Closed">Close</button>
              </div>`
            : `<div class="row-actions"><button class="mini-btn" data-status-action="Open">Reopen</button></div>`;

        return `
        <div class="ticket-row glass" data-id="${t.id}">
          <div class="ticket-row-main">
            <div class="ticket-row-top">
              <span class="ticket-id">#${t.id.slice(-6).toUpperCase()}</span>
              ${C.statusChip(t.status)}
              ${C.priorityChip(t.priority)}
              <span class="chip chip-category">${C.escapeHtml(t.category)}</span>
            </div>
            <h4>${C.escapeHtml(t.subject)}</h4>
            <div class="ticket-row-meta">
              ${isStaff ? `<span>${C.escapeHtml(creator ? creator.name : "Unknown")}</span><span>·</span>` : ""}
              <span>${msgCount} message${msgCount === 1 ? "" : "s"}</span>
              <span>·</span>
              <span>Updated ${D.timeAgo(t.updatedAt)}</span>
            </div>
          </div>
          ${isStaff || t.createdBy === user.id ? actions : ""}
        </div>`;
      })
      .join("");
  }

  function openNewTicketModal(user, onCreated) {
    const overlay = C.openModal(
      "Create a new ticket",
      `
      <form id="newTicketForm" class="form">
        <label>Subject
          <input type="text" id="ntSubject" placeholder="Briefly describe the issue" required maxlength="120" />
        </label>
        <label>Description
          <textarea id="ntDescription" placeholder="Add as much detail as you can — steps to reproduce, expected behavior, links, etc." rows="4"></textarea>
        </label>
        <div class="form-row">
          <label>Category
            <select id="ntCategory">
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Billing</option>
              <option>General</option>
            </select>
          </label>
          <label>Priority
            <select id="ntPriority">
              <option>Low</option>
              <option selected>Medium</option>
              <option>High</option>
            </select>
          </label>
        </div>
        <button type="submit" class="btn-primary full">${C.icon("plus")}<span>Create ticket</span></button>
      </form>`
    );

    overlay.querySelector("#newTicketForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const subject = overlay.querySelector("#ntSubject").value;
      const description = overlay.querySelector("#ntDescription").value;
      const category = overlay.querySelector("#ntCategory").value;
      const priority = overlay.querySelector("#ntPriority").value;
      const res = D.createTicket({ subject, description, category, priority, createdBy: user.id });
      if (!res.ok) {
        C.toast(res.error, "error");
        return;
      }
      C.toast("Ticket created successfully.", "success");
      C.closeModal();
      onCreated();
    });
  }

  /* =======================================================================
     CHAT
     ======================================================================= */
  function initChat(user) {
    const listEl = document.getElementById("chatTicketList");
    const bubblesEl = document.getElementById("chatBubbles");
    const emptyEl = document.getElementById("chatEmptyState");
    const headerEl = document.getElementById("chatHeader");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");

    let activeTicketId = new URLSearchParams(window.location.search).get("ticket");

    function drawList() {
      const tickets = D.getTicketsForUser(user.id, user.role).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      if (!tickets.length) {
        listEl.innerHTML = C.emptyState("chat", "No conversations", "Create a ticket to start a conversation with the team.");
        return;
      }
      listEl.innerHTML = tickets
        .map((t) => {
          const msgs = D.getMessagesForTicket(t.id);
          const last = msgs[msgs.length - 1];
          return `
          <button class="chat-list-item ${t.id === activeTicketId ? "active" : ""}" data-id="${t.id}">
            <div class="chat-list-top">
              <strong>${C.escapeHtml(t.subject)}</strong>
              ${C.statusChip(t.status)}
            </div>
            <p>${last ? C.escapeHtml(last.text).slice(0, 64) : "No messages yet"}</p>
            <time>${last ? D.timeAgo(last.createdAt) : D.timeAgo(t.createdAt)}</time>
          </button>`;
        })
        .join("");
    }

    function drawThread() {
      if (!activeTicketId) {
        emptyEl.hidden = false;
        form.hidden = true;
        headerEl.innerHTML = "";
        bubblesEl.innerHTML = "";
        return;
      }
      const ticket = D.getTicketById(activeTicketId);
      if (!ticket) {
        emptyEl.hidden = false;
        form.hidden = true;
        headerEl.innerHTML = "";
        bubblesEl.innerHTML = "";
        return;
      }
      emptyEl.hidden = true;
      form.hidden = false;

      headerEl.innerHTML = `
        <div>
          <h3>${C.escapeHtml(ticket.subject)}</h3>
          <div class="chat-header-meta">
            ${C.statusChip(ticket.status)}
            ${C.priorityChip(ticket.priority)}
            <span class="chip chip-category">${C.escapeHtml(ticket.category)}</span>
          </div>
        </div>`;

      const messages = D.getMessagesForTicket(ticket.id);
      if (!messages.length) {
        bubblesEl.innerHTML = C.emptyState("chat", "No messages yet", "Send the first message to start the conversation.");
      } else {
        bubblesEl.innerHTML = messages
          .map((m) => {
            const sender = D.getUserById(m.senderId);
            const mine = m.senderId === user.id;
            return `
            <div class="bubble-row ${mine ? "mine" : ""}">
              <div class="avatar small" style="background:${sender ? sender.avatarColor : "#3B82F6"}">${D.initials(sender ? sender.name : "?")}</div>
              <div class="bubble">
                <div class="bubble-meta"><strong>${C.escapeHtml(sender ? sender.name : "Unknown")}</strong><time>${D.timeAgo(m.createdAt)}</time></div>
                <p>${C.escapeHtml(m.text)}</p>
              </div>
            </div>`;
          })
          .join("");
      }
      bubblesEl.scrollTop = bubblesEl.scrollHeight;
    }

    listEl.addEventListener("click", (e) => {
      const item = e.target.closest(".chat-list-item");
      if (!item) return;
      activeTicketId = item.dataset.id;
      const url = new URL(window.location);
      url.searchParams.set("ticket", activeTicketId);
      window.history.replaceState({}, "", url);
      drawList();
      drawThread();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!activeTicketId) return;
      const text = input.value;
      const res = D.sendMessage(activeTicketId, user.id, text);
      if (!res.ok) return;
      input.value = "";
      drawThread();
      drawList();
    });

    drawList();
    drawThread();
  }

  /* =======================================================================
     ADMIN
     ======================================================================= */
  function initAdmin(user) {
    if (!D.hasRole(user, "MODERATOR")) {
      document.getElementById("adminContent").innerHTML = C.emptyState(
        "shield",
        "Restricted area",
        "You don't have permission to view the admin panel."
      );
      return;
    }

    document.querySelectorAll(".admin-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".admin-pane").forEach((p) => (p.hidden = true));
        tab.classList.add("active");
        document.getElementById(tab.dataset.pane).hidden = false;
        if (tab.dataset.pane === "paneAnalytics") renderAnalyticsPane();
      });
    });

    renderUsersPane(user);
    renderAdminTicketsPane(user);
    renderAnalyticsPane();
  }

  function renderUsersPane(currentUser) {
    const el = document.getElementById("paneUsers");
    C.withSkeleton(el, C.skeletonRows(5, 70), () => buildUsersTable(currentUser), 300);
  }

  function buildUsersTable(currentUser) {
    const users = D.getUsers();
    const canManageRoles = D.hasRole(currentUser, "ADMIN");

    const rows = users
      .map((u) => {
        const ticketsCount = D.getTickets().filter((t) => t.createdBy === u.id).length;
        return `
        <tr data-id="${u.id}">
          <td>
            <div class="cell-user">
              <div class="avatar small" style="background:${u.avatarColor}">${D.initials(u.name)}</div>
              <div><strong>${C.escapeHtml(u.name)}</strong><span>${C.escapeHtml(u.email)}</span></div>
            </div>
          </td>
          <td>${C.escapeHtml(u.company || "—")}</td>
          <td>${canManageRoles && u.id !== currentUser.id
              ? `<select class="role-select" data-id="${u.id}">
                  ${D.ROLES.map((r) => `<option value="${r}" ${r === u.role ? "selected" : ""}>${r}</option>`).join("")}
                </select>`
              : C.roleChip(u.role)
            }</td>
          <td>${ticketsCount}</td>
          <td>${D.timeAgo(u.createdAt)}</td>
          <td>
            ${u.id !== currentUser.id && D.hasRole(currentUser, "ADMIN")
              ? `<button class="icon-btn danger" data-delete-user="${u.id}">${C.icon("trash")}</button>`
              : ""}
          </td>
        </tr>`;
      })
      .join("");

    setTimeout(() => {
      const table = document.getElementById("paneUsers");
      table.querySelectorAll(".role-select").forEach((sel) => {
        sel.addEventListener("change", () => {
          D.setUserRole(sel.dataset.id, sel.value);
          C.toast("Role updated.", "success");
        });
      });
      table.querySelectorAll("[data-delete-user]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Remove this user? This cannot be undone.")) {
            D.deleteUser(btn.dataset.deleteUser);
            C.toast("User removed.", "success");
            renderUsersPane(currentUser);
          }
        });
      });
    }, 0);

    return `
      <table class="data-table">
        <thead><tr><th>User</th><th>Company</th><th>Role</th><th>Tickets</th><th>Joined</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function renderAdminTicketsPane(currentUser) {
    const el = document.getElementById("paneTickets");
    C.withSkeleton(el, C.skeletonRows(5, 70), () => buildAdminTicketsTable(currentUser), 340);
  }

  function buildAdminTicketsTable(currentUser) {
    const tickets = D.getTickets().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    if (!tickets.length) return C.emptyState("ticket", "No tickets", "No tickets have been submitted yet.");

    const staff = D.getUsers().filter((u) => D.hasRole(u, "MODERATOR"));

    const rows = tickets
      .map((t) => {
        const creator = D.getUserById(t.createdBy);
        return `
        <tr data-id="${t.id}">
          <td><strong>${C.escapeHtml(t.subject)}</strong><span class="sub">${C.escapeHtml(creator ? creator.name : "Unknown")}</span></td>
          <td>${C.statusChip(t.status)}</td>
          <td>${C.priorityChip(t.priority)}</td>
          <td>
            <select class="assignee-select" data-id="${t.id}">
              <option value="">Unassigned</option>
              ${staff.map((s) => `<option value="${s.id}" ${s.id === t.assignedTo ? "selected" : ""}>${C.escapeHtml(s.name)}</option>`).join("")}
            </select>
          </td>
          <td>
            <select class="status-select" data-id="${t.id}">
              ${["Open", "In Progress", "Closed"].map((s) => `<option ${s === t.status ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </td>
          <td><button class="icon-btn danger" data-delete-ticket="${t.id}">${C.icon("trash")}</button></td>
        </tr>`;
      })
      .join("");

    setTimeout(() => {
      const pane = document.getElementById("paneTickets");
      pane.querySelectorAll(".status-select").forEach((sel) => {
        sel.addEventListener("change", () => {
          D.updateTicketStatus(sel.dataset.id, sel.value, currentUser);
          C.toast("Ticket status updated.", "success");
        });
      });
      pane.querySelectorAll(".assignee-select").forEach((sel) => {
        sel.addEventListener("change", () => {
          D.assignTicket(sel.dataset.id, sel.value || null);
          C.toast("Ticket assignment updated.", "success");
        });
      });
      pane.querySelectorAll("[data-delete-ticket]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Delete this ticket and all its messages?")) {
            D.deleteTicket(btn.dataset.deleteTicket);
            C.toast("Ticket deleted.", "success");
            renderAdminTicketsPane(currentUser);
          }
        });
      });
    }, 0);

    return `
      <table class="data-table">
        <thead><tr><th>Ticket</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Update status</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function renderAnalyticsPane() {
    const snap = D.getAnalyticsSnapshot();

    document.getElementById("kpiTotalTickets").textContent = snap.totals.totalTickets;
    document.getElementById("kpiOpenTickets").textContent = snap.totals.open;
    document.getElementById("kpiAvgProgress").textContent = snap.avgServiceProgress + "%";
    document.getElementById("kpiUsers").textContent = snap.users;

    document.getElementById("analyticsLineChart").innerHTML = C.lineChart(
      snap.series.map((d) => ({ label: d.label, value: d.satisfaction })),
      { color: "#22D3EE" }
    );

    document.getElementById("analyticsBarChart").innerHTML = C.barChart(
      snap.series.slice(-7).map((d) => ({ label: d.label, value: d.tickets })),
      { color: "#8B5CF6" }
    );

    document.getElementById("analyticsDonutChart").innerHTML = C.donutChart([
      { value: snap.totals.open, color: "#3B82F6" },
      { value: snap.totals.inProgress, color: "#8B5CF6" },
      { value: snap.totals.closed, color: "#22D3EE" }
    ]);
  }

  /* =======================================================================
     PROFILE
     ======================================================================= */
  function initProfile(user) {
    const raw = D.getCurrentUserRaw();
    document.getElementById("profileAvatar").style.background = raw.avatarColor;
    document.getElementById("profileAvatar").textContent = D.initials(raw.name);
    document.getElementById("profileName").textContent = raw.name;
    document.getElementById("profileRole").innerHTML = C.roleChip(raw.role);
    document.getElementById("profileCompany").textContent = raw.company || "Independent";

    document.getElementById("infoName").value = raw.name || "";
    document.getElementById("infoEmail").value = raw.email || "";
    document.getElementById("infoCompany").value = raw.company || "";
    document.getElementById("infoTitle").value = raw.title || "";
    document.getElementById("infoPhone").value = raw.phone || "";
    document.getElementById("infoBio").value = raw.bio || "";

    document.getElementById("infoForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const patch = {
        name: document.getElementById("infoName").value,
        email: document.getElementById("infoEmail").value,
        company: document.getElementById("infoCompany").value,
        title: document.getElementById("infoTitle").value,
        phone: document.getElementById("infoPhone").value,
        bio: document.getElementById("infoBio").value
      };
      const res = D.updateUser(raw.id, patch);
      if (!res.ok) {
        C.toast(res.error, "error");
        return;
      }
      C.toast("Profile updated.", "success");
      document.getElementById("profileName").textContent = patch.name;
      document.getElementById("profileCompany").textContent = patch.company || "Independent";
    });

    document.getElementById("passwordForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const current = document.getElementById("currentPassword").value;
      const next = document.getElementById("newPassword").value;
      const confirmPw = document.getElementById("confirmPassword").value;
      if (next !== confirmPw) {
        C.toast("New passwords do not match.", "error");
        return;
      }
      const res = D.changePassword(raw.id, current, next);
      if (!res.ok) {
        C.toast(res.error, "error");
        return;
      }
      C.toast("Password changed successfully.", "success");
      document.getElementById("passwordForm").reset();
    });

    const activityEl = document.getElementById("profileActivity");
    C.withSkeleton(activityEl, C.skeletonRows(4, 50), () => {
      const items = D.getActivityForUser(raw.id, 10);
      if (!items.length) return C.emptyState("user", "No activity yet", "Your account activity will appear here.");
      return `<ul class="feed-list">${items
        .map(
          (a) => `<li class="feed-item">
            <div class="avatar small" style="background:${raw.avatarColor}">${D.initials(raw.name)}</div>
            <div class="feed-text"><span>${C.escapeHtml(a.text)}</span><time>${D.timeAgo(a.createdAt)}</time></div>
          </li>`
        )
        .join("")}</ul>`;
    }, 320);
  }
})();
