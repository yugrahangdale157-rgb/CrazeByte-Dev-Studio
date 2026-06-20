/* ==========================================================================
   CrazeByte Dev Studio — data.js
   Fake backend / data layer. Everything is persisted to localStorage.
   No external services. No network calls. Pure simulation.
   ========================================================================== */

(function (global) {
  "use strict";

  const NS = "cbz_";
  const KEYS = {
    USERS: NS + "users",
    SESSION: NS + "session",
    TICKETS: NS + "tickets",
    MESSAGES: NS + "messages",
    SERVICES: NS + "services",
    NOTIFICATIONS: NS + "notifications",
    ACTIVITY: NS + "activity",
    SEEDED: NS + "seeded_v1"
  };

  const ROLES = ["USER", "MODERATOR", "ADMIN", "OWNER"];
  const ROLE_RANK = { USER: 0, MODERATOR: 1, ADMIN: 2, OWNER: 3 };

  /* ---------------------------------------------------------------------
     Low level storage helpers
     --------------------------------------------------------------------- */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[data.js] read failed for", key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("[data.js] write failed for", key, e);
      return false;
    }
  }

  function uid(prefix) {
    return (
      (prefix || "id") +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 9)
    );
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 5) return "just now";
    if (sec < 60) return sec + "s ago";
    const min = Math.floor(sec / 60);
    if (min < 60) return min + "m ago";
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + "h ago";
    const day = Math.floor(hr / 24);
    if (day < 30) return day + "d ago";
    const mo = Math.floor(day / 30);
    if (mo < 12) return mo + "mo ago";
    return Math.floor(mo / 12) + "y ago";
  }

  /* simple deterministic hash — NOT real security, this is a frontend
     simulation only. Good enough to avoid storing raw plaintext directly. */
  function hashPassword(pw) {
    let h = 0;
    const str = "cbz::" + pw + "::salt";
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return "h" + Math.abs(h).toString(36) + str.length;
  }

  function initials(name) {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /* ---------------------------------------------------------------------
     Seed data — runs once
     --------------------------------------------------------------------- */
  function seedIfNeeded() {
    if (read(KEYS.SEEDED, false)) return;

    const users = [
      {
        id: uid("usr"),
        name: "Avery Stone",
        email: "owner@crazebyte.dev",
        password: hashPassword("Owner@123"),
        role: "OWNER",
        company: "CrazeByte Dev Studio",
        title: "Founder & CEO",
        phone: "+1 (415) 555-0199",
        avatarColor: "#3B82F6",
        createdAt: nowISO(),
        bio: "Founder of CrazeByte Dev Studio. Building the future of client experience."
      },
      {
        id: uid("usr"),
        name: "Jordan Pierce",
        email: "admin@crazebyte.dev",
        password: hashPassword("Admin@123"),
        role: "ADMIN",
        company: "CrazeByte Dev Studio",
        title: "Head of Operations",
        phone: "+1 (415) 555-0142",
        avatarColor: "#8B5CF6",
        createdAt: nowISO(),
        bio: "Keeps the studio running. Tickets, billing, and client success."
      },
      {
        id: uid("usr"),
        name: "Riley Chen",
        email: "mod@crazebyte.dev",
        password: hashPassword("Mod@12345"),
        role: "MODERATOR",
        company: "CrazeByte Dev Studio",
        title: "Support Lead",
        phone: "+1 (415) 555-0173",
        avatarColor: "#22D3EE",
        createdAt: nowISO(),
        bio: "First line of support. Triage, replies, and escalations."
      },
      {
        id: uid("usr"),
        name: "Morgan Lee",
        email: "client@acme.com",
        password: hashPassword("Client@123"),
        role: "USER",
        company: "Acme Industries",
        title: "Product Manager",
        phone: "+1 (212) 555-0118",
        avatarColor: "#F59E0B",
        createdAt: nowISO(),
        bio: "Product manager at Acme Industries. Working with CrazeByte on the new platform build."
      }
    ];
    write(KEYS.USERS, users);

    const clientId = users[3].id;
    const modId = users[2].id;
    const adminId = users[1].id;

    const tickets = [
      {
        id: uid("tkt"),
        subject: "Production checkout flow returning 502 intermittently",
        description:
          "Around 3-5% of checkout sessions are failing with a 502 during peak traffic windows (6-9pm EST). Need this prioritized before the holiday push.",
        category: "Bug Report",
        priority: "High",
        status: "In Progress",
        createdBy: clientId,
        assignedTo: modId,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
      },
      {
        id: uid("tkt"),
        subject: "Request: add SSO support for enterprise tier",
        description:
          "We'd like to roll out SAML-based SSO for our enterprise customers in Q3. Can the team scope this out?",
        category: "Feature Request",
        priority: "Medium",
        status: "Open",
        createdBy: clientId,
        assignedTo: adminId,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString()
      },
      {
        id: uid("tkt"),
        subject: "Invoice #CB-1042 shows incorrect tax amount",
        description:
          "The latest invoice has a tax line that doesn't match our state rate. Can someone take a look at the billing config?",
        category: "Billing",
        priority: "Low",
        status: "Closed",
        createdBy: clientId,
        assignedTo: adminId,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 190).toISOString()
      },
      {
        id: uid("tkt"),
        subject: "Dashboard analytics widget loading blank on Safari",
        description:
          "The revenue chart on the dashboard renders empty on Safari 17. Works fine on Chrome and Firefox.",
        category: "Bug Report",
        priority: "Medium",
        status: "Open",
        createdBy: clientId,
        assignedTo: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      }
    ];
    write(KEYS.TICKETS, tickets);

    const messages = [];
    messages.push({
      id: uid("msg"),
      ticketId: tickets[0].id,
      senderId: clientId,
      text: "Hey team, this is becoming urgent — we're seeing complaints from customers about failed checkouts.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString()
    });
    messages.push({
      id: uid("msg"),
      ticketId: tickets[0].id,
      senderId: modId,
      text: "Thanks for flagging — I can see elevated 502s on the payment gateway proxy. Looking into the load balancer config now.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    });
    messages.push({
      id: uid("msg"),
      ticketId: tickets[0].id,
      senderId: modId,
      text: "Found it — connection pool was exhausting under burst traffic. Deploying a fix to staging first.",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    });
    messages.push({
      id: uid("msg"),
      ticketId: tickets[0].id,
      senderId: clientId,
      text: "Appreciate the fast turnaround. Let us know once it's live on prod.",
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
    });
    messages.push({
      id: uid("msg"),
      ticketId: tickets[1].id,
      senderId: adminId,
      text: "We can scope SSO for Q3. I'll set up a call to walk through your IdP requirements.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString()
    });
    write(KEYS.MESSAGES, messages);

    const services = [
      {
        id: uid("svc"),
        name: "Platform Modernization",
        description: "Migrating the core platform to a modern microservices architecture.",
        status: "In Progress",
        progress: 68,
        owner: "Riley Chen",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString()
      },
      {
        id: uid("svc"),
        name: "Mobile App — iOS & Android",
        description: "Native client apps with offline sync and push notifications.",
        status: "In Progress",
        progress: 42,
        owner: "Jordan Pierce",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString()
      },
      {
        id: uid("svc"),
        name: "Security & Compliance Audit",
        description: "SOC 2 readiness assessment and remediation plan.",
        status: "Completed",
        progress: 100,
        owner: "Avery Stone",
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      },
      {
        id: uid("svc"),
        name: "Brand Refresh & Design System",
        description: "New visual identity and a shared component library.",
        status: "Queued",
        progress: 8,
        owner: "Jordan Pierce",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 52).toISOString()
      }
    ];
    write(KEYS.SERVICES, services);

    const notifications = [
      {
        id: uid("ntf"),
        userId: clientId,
        title: "Ticket update",
        body: "Riley Chen replied to “Production checkout flow returning 502 intermittently”.",
        type: "ticket",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
      },
      {
        id: uid("ntf"),
        userId: clientId,
        title: "Invoice closed",
        body: "Invoice #CB-1042 has been corrected and marked resolved.",
        type: "billing",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 190).toISOString()
      },
      {
        id: uid("ntf"),
        userId: clientId,
        title: "Service milestone reached",
        body: "Platform Modernization crossed 65% completion.",
        type: "service",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
      },
      {
        id: uid("ntf"),
        userId: clientId,
        title: "Welcome to CrazeByte Portal",
        body: "Your client workspace is ready. Explore your dashboard to get started.",
        type: "system",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString()
      }
    ];
    write(KEYS.NOTIFICATIONS, notifications);

    const activity = [
      {
        id: uid("act"),
        userId: clientId,
        text: "opened ticket “Dashboard analytics widget loading blank on Safari”",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      },
      {
        id: uid("act"),
        userId: modId,
        text: "replied to ticket “Production checkout flow returning 502 intermittently”",
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
      },
      {
        id: uid("act"),
        userId: adminId,
        text: "closed ticket “Invoice #CB-1042 shows incorrect tax amount”",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 190).toISOString()
      },
      {
        id: uid("act"),
        userId: clientId,
        text: "logged in to the client portal",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString()
      }
    ];
    write(KEYS.ACTIVITY, activity);

    write(KEYS.SEEDED, true);
  }

  /* ---------------------------------------------------------------------
     Users / Auth
     --------------------------------------------------------------------- */
  function getUsers() {
    return read(KEYS.USERS, []);
  }

  function saveUsers(users) {
    write(KEYS.USERS, users);
  }

  function findUserByEmail(email) {
    if (!email) return null;
    const e = email.trim().toLowerCase();
    return getUsers().find((u) => u.email.toLowerCase() === e) || null;
  }

  function getUserById(id) {
    return getUsers().find((u) => u.id === id) || null;
  }

  function registerUser({ name, email, password, role, company }) {
    if (!name || !email || !password) {
      return { ok: false, error: "All fields are required." };
    }
    if (findUserByEmail(email)) {
      return { ok: false, error: "An account with that email already exists." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    const safeRole = ROLES.includes(role) ? role : "USER";
    const users = getUsers();
    const user = {
      id: uid("usr"),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashPassword(password),
      role: safeRole,
      company: company && company.trim() ? company.trim() : "Independent",
      title: "",
      phone: "",
      avatarColor: pickColor(users.length),
      createdAt: nowISO(),
      bio: ""
    };
    users.push(user);
    saveUsers(users);

    addActivity(user.id, "created an account and joined the portal");
    addNotification(
      user.id,
      "Welcome to CrazeByte Portal",
      "Your account is set up. Take a look around your new dashboard.",
      "system"
    );

    return { ok: true, user: sanitizeUser(user) };
  }

  function pickColor(index) {
    const palette = ["#3B82F6", "#8B5CF6", "#22D3EE", "#F59E0B", "#10B981", "#F472B6"];
    return palette[index % palette.length];
  }

  function login(email, password) {
    const user = findUserByEmail(email);
    if (!user) return { ok: false, error: "No account found with that email." };
    if (user.password !== hashPassword(password)) {
      return { ok: false, error: "Incorrect password. Try again." };
    }
    const session = { userId: user.id, loggedInAt: nowISO() };
    write(KEYS.SESSION, session);
    addActivity(user.id, "logged in to the client portal");
    return { ok: true, user: sanitizeUser(user) };
  }

  function logout() {
    localStorage.removeItem(KEYS.SESSION);
  }

  function getSession() {
    return read(KEYS.SESSION, null);
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    const user = getUserById(session.userId);
    return user ? sanitizeUser(user) : null;
  }

  function getCurrentUserRaw() {
    const session = getSession();
    if (!session) return null;
    return getUserById(session.userId);
  }

  function sanitizeUser(u) {
    if (!u) return null;
    const copy = Object.assign({}, u);
    delete copy.password;
    return copy;
  }

  function updateUser(userId, patch) {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { ok: false, error: "User not found." };
    if (patch.email) {
      const existing = findUserByEmail(patch.email);
      if (existing && existing.id !== userId) {
        return { ok: false, error: "That email is already in use." };
      }
      patch.email = patch.email.trim().toLowerCase();
    }
    users[idx] = Object.assign({}, users[idx], patch);
    saveUsers(users);
    return { ok: true, user: sanitizeUser(users[idx]) };
  }

  function changePassword(userId, currentPassword, newPassword) {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { ok: false, error: "User not found." };
    if (users[idx].password !== hashPassword(currentPassword)) {
      return { ok: false, error: "Current password is incorrect." };
    }
    if (!newPassword || newPassword.length < 6) {
      return { ok: false, error: "New password must be at least 6 characters." };
    }
    users[idx].password = hashPassword(newPassword);
    saveUsers(users);
    addActivity(userId, "changed their account password");
    return { ok: true };
  }

  function setUserRole(userId, role) {
    if (!ROLES.includes(role)) return { ok: false, error: "Invalid role." };
    return updateUser(userId, { role });
  }

  function deleteUser(userId) {
    let users = getUsers();
    users = users.filter((u) => u.id !== userId);
    saveUsers(users);
    return { ok: true };
  }

  function hasRole(user, minRole) {
    if (!user) return false;
    return ROLE_RANK[user.role] >= ROLE_RANK[minRole];
  }

  /* ---------------------------------------------------------------------
     Tickets
     --------------------------------------------------------------------- */
  function getTickets() {
    return read(KEYS.TICKETS, []);
  }

  function saveTickets(t) {
    write(KEYS.TICKETS, t);
  }

  function getTicketById(id) {
    return getTickets().find((t) => t.id === id) || null;
  }

  function getTicketsForUser(userId, role) {
    const all = getTickets();
    if (role && ROLE_RANK[role] >= ROLE_RANK.MODERATOR) return all;
    return all.filter((t) => t.createdBy === userId);
  }

  function createTicket({ subject, description, category, priority, createdBy }) {
    if (!subject || !subject.trim()) {
      return { ok: false, error: "Subject is required." };
    }
    const tickets = getTickets();
    const ticket = {
      id: uid("tkt"),
      subject: subject.trim(),
      description: (description || "").trim(),
      category: category || "General",
      priority: priority || "Medium",
      status: "Open",
      createdBy,
      assignedTo: null,
      createdAt: nowISO(),
      updatedAt: nowISO()
    };
    tickets.unshift(ticket);
    saveTickets(tickets);

    const user = getUserById(createdBy);
    addActivity(createdBy, `opened ticket "${ticket.subject}"`);
    notifyStaff(
      "New ticket submitted",
      `${user ? user.name : "A client"} opened "${ticket.subject}".`,
      "ticket"
    );
    return { ok: true, ticket };
  }

  function updateTicketStatus(ticketId, status, actingUser) {
    const tickets = getTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return { ok: false, error: "Ticket not found." };
    tickets[idx].status = status;
    tickets[idx].updatedAt = nowISO();
    saveTickets(tickets);

    const ticket = tickets[idx];
    if (actingUser) addActivity(actingUser.id, `marked ticket "${ticket.subject}" as ${status}`);
    addNotification(
      ticket.createdBy,
      "Ticket status updated",
      `"${ticket.subject}" is now ${status}.`,
      "ticket"
    );
    return { ok: true, ticket };
  }

  function assignTicket(ticketId, assigneeId) {
    const tickets = getTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return { ok: false, error: "Ticket not found." };
    tickets[idx].assignedTo = assigneeId || null;
    tickets[idx].updatedAt = nowISO();
    saveTickets(tickets);
    return { ok: true, ticket: tickets[idx] };
  }

  function deleteTicket(ticketId) {
    let tickets = getTickets();
    tickets = tickets.filter((t) => t.id !== ticketId);
    saveTickets(tickets);
    let messages = getMessages();
    messages = messages.filter((m) => m.ticketId !== ticketId);
    write(KEYS.MESSAGES, messages);
    return { ok: true };
  }

  /* ---------------------------------------------------------------------
     Messages (chat)
     --------------------------------------------------------------------- */
  function getMessages() {
    return read(KEYS.MESSAGES, []);
  }

  function getMessagesForTicket(ticketId) {
    return getMessages()
      .filter((m) => m.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  function sendMessage(ticketId, senderId, text) {
    if (!text || !text.trim()) return { ok: false, error: "Message cannot be empty." };
    const messages = getMessages();
    const msg = {
      id: uid("msg"),
      ticketId,
      senderId,
      text: text.trim(),
      createdAt: nowISO()
    };
    messages.push(msg);
    write(KEYS.MESSAGES, messages);

    const tickets = getTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      tickets[idx].updatedAt = nowISO();
      saveTickets(tickets);

      const ticket = tickets[idx];
      const sender = getUserById(senderId);
      const recipients = new Set();
      if (ticket.createdBy && ticket.createdBy !== senderId) recipients.add(ticket.createdBy);
      if (ticket.assignedTo && ticket.assignedTo !== senderId) recipients.add(ticket.assignedTo);
      recipients.forEach((rid) => {
        addNotification(
          rid,
          "New message",
          `${sender ? sender.name : "Someone"} replied on "${ticket.subject}".`,
          "chat"
        );
      });
    }
    return { ok: true, message: msg };
  }

  /* ---------------------------------------------------------------------
     Services
     --------------------------------------------------------------------- */
  function getServices() {
    return read(KEYS.SERVICES, []);
  }

  function saveServices(s) {
    write(KEYS.SERVICES, s);
  }

  function updateServiceProgress(serviceId, progress) {
    const services = getServices();
    const idx = services.findIndex((s) => s.id === serviceId);
    if (idx === -1) return { ok: false };
    services[idx].progress = Math.max(0, Math.min(100, progress));
    if (services[idx].progress >= 100) services[idx].status = "Completed";
    saveServices(services);
    return { ok: true, service: services[idx] };
  }

  /* ---------------------------------------------------------------------
     Notifications
     --------------------------------------------------------------------- */
  function getNotifications() {
    return read(KEYS.NOTIFICATIONS, []);
  }

  function getNotificationsForUser(userId) {
    return getNotifications()
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function addNotification(userId, title, body, type) {
    if (!userId) return;
    const notifications = getNotifications();
    notifications.unshift({
      id: uid("ntf"),
      userId,
      title,
      body,
      type: type || "system",
      read: false,
      createdAt: nowISO()
    });
    write(KEYS.NOTIFICATIONS, notifications.slice(0, 200));
  }

  function notifyStaff(title, body, type) {
    getUsers()
      .filter((u) => ROLE_RANK[u.role] >= ROLE_RANK.MODERATOR)
      .forEach((u) => addNotification(u.id, title, body, type));
  }

  function markNotificationRead(id) {
    const notifications = getNotifications();
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      notifications[idx].read = true;
      write(KEYS.NOTIFICATIONS, notifications);
    }
  }

  function markAllNotificationsRead(userId) {
    const notifications = getNotifications().map((n) =>
      n.userId === userId ? Object.assign({}, n, { read: true }) : n
    );
    write(KEYS.NOTIFICATIONS, notifications);
  }

  function unreadNotificationCount(userId) {
    return getNotificationsForUser(userId).filter((n) => !n.read).length;
  }

  /* ---------------------------------------------------------------------
     Activity feed
     --------------------------------------------------------------------- */
  function getActivity() {
    return read(KEYS.ACTIVITY, []);
  }

  function addActivity(userId, text) {
    const activity = getActivity();
    activity.unshift({ id: uid("act"), userId, text, createdAt: nowISO() });
    write(KEYS.ACTIVITY, activity.slice(0, 300));
  }

  function getActivityForUser(userId, limit) {
    const all = getActivity()
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return limit ? all.slice(0, limit) : all;
  }

  function getRecentActivity(limit) {
    const all = getActivity().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return limit ? all.slice(0, limit) : all;
  }

  /* ---------------------------------------------------------------------
     Analytics (derived / simulated)
     --------------------------------------------------------------------- */
  function getAnalyticsSnapshot() {
    const tickets = getTickets();
    const services = getServices();
    const open = tickets.filter((t) => t.status === "Open").length;
    const inProgress = tickets.filter((t) => t.status === "In Progress").length;
    const closed = tickets.filter((t) => t.status === "Closed").length;

    // deterministic-ish pseudo-random 14 day series seeded by date
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const seed = d.getDate() + d.getMonth() * 31;
      const base = 8 + (seed % 9);
      const wave = Math.round(4 * Math.sin(seed / 2));
      days.push({
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        tickets: Math.max(1, base + wave - 4 + (tickets.length % 3)),
        satisfaction: Math.min(100, 78 + ((seed * 3) % 18))
      });
    }

    const avgProgress = services.length
      ? Math.round(services.reduce((sum, s) => sum + s.progress, 0) / services.length)
      : 0;

    return {
      totals: { open, inProgress, closed, totalTickets: tickets.length },
      series: days,
      avgServiceProgress: avgProgress,
      activeServices: services.filter((s) => s.status !== "Completed").length,
      users: getUsers().length
    };
  }

  /* ---------------------------------------------------------------------
     Global search
     --------------------------------------------------------------------- */
  function globalSearch(query, currentUser) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return { tickets: [], services: [], users: [] };

    const visibleTickets = getTicketsForUser(currentUser.id, currentUser.role);
    const tickets = visibleTickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );

    const services = getServices().filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );

    let users = [];
    if (ROLE_RANK[currentUser.role] >= ROLE_RANK.MODERATOR) {
      users = getUsers().filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.company || "").toLowerCase().includes(q)
      );
    }

    return { tickets, services, users };
  }

  /* ---------------------------------------------------------------------
     Public API
     --------------------------------------------------------------------- */
  global.CBZ = {
    KEYS,
    ROLES,
    ROLE_RANK,
    seedIfNeeded,
    uid,
    nowISO,
    timeAgo,
    initials,
    hashPassword,
    // users / auth
    getUsers,
    saveUsers,
    findUserByEmail,
    getUserById,
    registerUser,
    login,
    logout,
    getSession,
    getCurrentUser,
    getCurrentUserRaw,
    sanitizeUser,
    updateUser,
    changePassword,
    setUserRole,
    deleteUser,
    hasRole,
    // tickets
    getTickets,
    getTicketById,
    getTicketsForUser,
    createTicket,
    updateTicketStatus,
    assignTicket,
    deleteTicket,
    // messages
    getMessages,
    getMessagesForTicket,
    sendMessage,
    // services
    getServices,
    saveServices,
    updateServiceProgress,
    // notifications
    getNotifications,
    getNotificationsForUser,
    addNotification,
    notifyStaff,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationCount,
    // activity
    addActivity,
    getActivityForUser,
    getRecentActivity,
    // analytics
    getAnalyticsSnapshot,
    // search
    globalSearch
  };
})(window);
