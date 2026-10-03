/**
 * Campus360 - Main Application Controller & View Renderers
 * Integrates all 19 ERP modules, Chart.js analytics, role dashboards, and AI interactions.
 */

const CampusApp = (function () {
  let currentView = "dashboard";
  let chartInstances = {};

  function init() {
    setupEventListeners();
    updateUserInterface();
    renderCurrentView();
  }

  function setupEventListeners() {
    // Delegated click handling for role switchers
    document.addEventListener("click", (e) => {
      const roleBtn = e.target.closest("[data-switch-role]");
      if (roleBtn) {
        e.preventDefault();
        const role = roleBtn.getAttribute("data-switch-role");
        if (role) {
          CampusAuth.loginAsRole(role);
          toggleMobileSidebar(false);
        }
        return;
      }

      // Delegated click handling for sidebar and in-app navigation items
      const navItem = e.target.closest("[data-view]");
      if (navItem && !navItem.classList.contains("demo-account-chip") && !navItem.classList.contains("role-tab-btn")) {
        // If it's inside authenticated workspace nav or links
        const view = navItem.getAttribute("data-view");
        if (view) {
          e.preventDefault();
          navigateTo(view);
          return;
        }
      }

      // Delegated click handling for AI triggers
      const aiBtn = e.target.closest(".trigger-ai-chat");
      if (aiBtn) {
        e.preventDefault();
        openAIChatModal();
        return;
      }
    });

    // Listen for auth events
    window.addEventListener("campus:user-changed", (e) => {
      updateUserInterface();
      renderCurrentView();
      showToast(`Switched view to ${e.detail.name} (${e.detail.role.toUpperCase()})`, "success");
    });

    window.addEventListener("campus:logged-out", () => {
      if (typeof showLoginScreen === 'function') {
        showLoginScreen();
      } else {
        showLandingPage();
      }
    });

    // Global Search Keypress & input
    const searchInput = document.getElementById("global-search-input");
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const val = e.target.value.trim();
          if (val.length >= 2) {
            handleGlobalSearch(val);
          }
        }, 300);
      });
      searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter" && e.target.value.trim()) {
          handleGlobalSearch(e.target.value.trim());
        }
      });
    }
  }

  function toggleMobileSidebar(forceState) {
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar) return;

    const isOpen = typeof forceState === 'boolean' ? forceState : !sidebar.classList.contains("open");
    if (isOpen) {
      sidebar.classList.add("open");
      if (backdrop) backdrop.classList.add("active");
    } else {
      sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("active");
    }
  }

  function navigateTo(viewName) {
    currentView = viewName;
    
    // Auto-close mobile sidebar if open
    toggleMobileSidebar(false);

    // If navigating away from transport, clear GPS interval to conserve CPU/battery
    if (viewName !== 'transport' && gpsSimulationInterval) {
      clearInterval(gpsSimulationInterval);
      gpsSimulationInterval = null;
    }

    // Update active nav state in sidebar
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
      if (item.getAttribute("data-view") === viewName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update active state in mobile bottom bar
    document.querySelectorAll(".mobile-bottom-nav .mobile-nav-item").forEach(item => {
      if (item.getAttribute("data-view") === viewName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateUserInterface() {
    const user = CampusAuth.getCurrentUser();
    if (!user) return;

    // Update Topbar User info
    const topUserAvatar = document.getElementById("top-user-avatar");
    const topUserName = document.getElementById("top-user-name");
    const topUserRole = document.getElementById("top-user-role");

    if (topUserAvatar) topUserAvatar.src = user.avatar;
    if (topUserName) topUserName.textContent = user.name;
    if (topUserRole) topUserRole.textContent = user.role.toUpperCase();

    // Update Sidebar User info
    const sideUserAvatar = document.getElementById("side-user-avatar");
    const sideUserName = document.getElementById("side-user-name");
    const sideUserRole = document.getElementById("side-user-role");

    if (sideUserAvatar) sideUserAvatar.src = user.avatar;
    if (sideUserName) sideUserName.textContent = user.name;
    if (sideUserRole) sideUserRole.textContent = user.department || user.role.toUpperCase();

    // Update role pill active state in topbar
    document.querySelectorAll(".role-pill-btn").forEach(btn => {
      if (btn.getAttribute("data-switch-role") === user.role) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Render persona-specific sidebar links
    renderSidebarNav(user);
  }

  function renderSidebarNav(user) {
    const navContainer = document.getElementById("sidebar-nav-container");
    if (!navContainer || !user) return;

    let navHtml = '';

    if (user.role === 'student') {
      navHtml = `
        <div class="nav-section-title">My Academics</div>
        <a href="#" class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
          <i class="fa-solid fa-gauge-high"></i> <span>My Dashboard</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'academics' ? 'active' : ''}" data-view="academics">
          <i class="fa-solid fa-book-open"></i> <span>Courses & Timetable</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'attendance' ? 'active' : ''}" data-view="attendance">
          <i class="fa-solid fa-user-check"></i> <span>Attendance & Forecast</span>
          <span class="nav-badge" style="background:#ef4444;">72%</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'examinations' ? 'active' : ''}" data-view="examinations">
          <i class="fa-solid fa-file-signature"></i> <span>Exams & Hall Ticket</span>
        </a>

        <div class="nav-section-title">Campus Life & Services</div>
        <a href="#" class="nav-item ${currentView === 'fees' ? 'active' : ''}" data-view="fees">
          <i class="fa-solid fa-receipt"></i> <span>My Fee Ledger</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'library' ? 'active' : ''}" data-view="library">
          <i class="fa-solid fa-book-bookmark"></i> <span>Digital Library</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'hostel' ? 'active' : ''}" data-view="hostel">
          <i class="fa-solid fa-hotel"></i> <span>My Hostel & Room</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'transport' ? 'active' : ''}" data-view="transport">
          <i class="fa-solid fa-bus"></i> <span>Live Bus GPS (Bhadradri)</span>
          <span class="nav-badge" style="background:#06b6d4;">LIVE</span>
        </a>

        <div class="nav-section-title">Career & Support</div>
        <a href="#" class="nav-item ${currentView === 'placements' ? 'active' : ''}" data-view="placements">
          <i class="fa-solid fa-briefcase"></i> <span>Placement Drives</span>
          <span class="nav-badge" style="background:#10b981;">5 Drives</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'internships' ? 'active' : ''}" data-view="internships">
          <i class="fa-solid fa-laptop-code"></i> <span>Internships Hub</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'complaints' ? 'active' : ''}" data-view="complaints">
          <i class="fa-solid fa-headset"></i> <span>Student Grievance</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'communication' ? 'active' : ''}" data-view="communication">
          <i class="fa-solid fa-bullhorn"></i> <span>Circulars & Notices</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'ai-center' ? 'active' : ''}" data-view="ai-center" style="color:var(--brand-cyan);">
          <i class="fa-solid fa-wand-magic-sparkles"></i> <span>Campus360 AI Assistant</span>
        </a>
      `;
    } else if (user.role === 'parent') {
      navHtml = `
        <div class="nav-section-title">Ward Monitoring (Aarav Sharma)</div>
        <a href="#" class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
          <i class="fa-solid fa-gauge-high"></i> <span>Ward 360° Overview</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'attendance' ? 'active' : ''}" data-view="attendance">
          <i class="fa-solid fa-user-check"></i> <span>Ward Attendance & Alerts</span>
          <span class="nav-badge" style="background:#ef4444;">Warning</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'examinations' ? 'active' : ''}" data-view="examinations">
          <i class="fa-solid fa-file-signature"></i> <span>Ward Results & Marks</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'academics' ? 'active' : ''}" data-view="academics">
          <i class="fa-solid fa-book-open"></i> <span>Curriculum & Schedule</span>
        </a>

        <div class="nav-section-title">Safety & Payments</div>
        <a href="#" class="nav-item ${currentView === 'fees' ? 'active' : ''}" data-view="fees">
          <i class="fa-solid fa-credit-card"></i> <span>Pay College Fees Online</span>
          <span class="nav-badge" style="background:#10b981;">₹0 Due</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'transport' ? 'active' : ''}" data-view="transport">
          <i class="fa-solid fa-bus"></i> <span>Ward Bus GPS (Bhadradri)</span>
          <span class="nav-badge" style="background:#06b6d4;">LIVE</span>
        </a>

        <div class="nav-section-title">Parent Support & Connect</div>
        <a href="#" class="nav-item ${currentView === 'communication' ? 'active' : ''}" data-view="communication">
          <i class="fa-solid fa-comments"></i> <span>Mentor Connect & Notices</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'complaints' ? 'active' : ''}" data-view="complaints">
          <i class="fa-solid fa-headset"></i> <span>Parent Helpline / Grievance</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'ai-center' ? 'active' : ''}" data-view="ai-center" style="color:var(--brand-cyan);">
          <i class="fa-solid fa-wand-magic-sparkles"></i> <span>Ward Advisor AI</span>
        </a>
      `;
    } else if (user.role === 'faculty') {
      navHtml = `
        <div class="nav-section-title">Faculty Workspace</div>
        <a href="#" class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
          <i class="fa-solid fa-gauge-high"></i> <span>Faculty Dashboard</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'students' ? 'active' : ''}" data-view="students">
          <i class="fa-solid fa-user-graduate"></i> <span>My Class Students</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'attendance' ? 'active' : ''}" data-view="attendance">
          <i class="fa-solid fa-user-check"></i> <span>Mark Class Attendance</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'examinations' ? 'active' : ''}" data-view="examinations">
          <i class="fa-solid fa-file-signature"></i> <span>Enter Internal Marks</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'academics' ? 'active' : ''}" data-view="academics">
          <i class="fa-solid fa-book-open"></i> <span>Lecture Schedule & Labs</span>
        </a>

        <div class="nav-section-title">Department & Resources</div>
        <a href="#" class="nav-item ${currentView === 'library' ? 'active' : ''}" data-view="library">
          <i class="fa-solid fa-book-bookmark"></i> <span>Library & Journals</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'complaints' ? 'active' : ''}" data-view="complaints">
          <i class="fa-solid fa-headset"></i> <span>Student Counseling</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'communication' ? 'active' : ''}" data-view="communication">
          <i class="fa-solid fa-bullhorn"></i> <span>Department Notices</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'ai-center' ? 'active' : ''}" data-view="ai-center" style="color:var(--brand-cyan);">
          <i class="fa-solid fa-wand-magic-sparkles"></i> <span>AI Academic Assistant</span>
        </a>
      `;
    } else {
      // Admin / Management / TPO
      navHtml = `
        <div class="nav-section-title">Institutional Governance</div>
        <a href="#" class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
          <i class="fa-solid fa-gauge-high"></i> <span>Executive Dashboard</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'students' ? 'active' : ''}" data-view="students">
          <i class="fa-solid fa-user-graduate"></i> <span>Student Directory (8,420)</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'faculty' ? 'active' : ''}" data-view="faculty">
          <i class="fa-solid fa-chalkboard-user"></i> <span>Faculty Roster (426)</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'academics' ? 'active' : ''}" data-view="academics">
          <i class="fa-solid fa-book-open"></i> <span>Academics & Curricula</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'attendance' ? 'active' : ''}" data-view="attendance">
          <i class="fa-solid fa-user-check"></i> <span>Campus Attendance Audit</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'examinations' ? 'active' : ''}" data-view="examinations">
          <i class="fa-solid fa-file-signature"></i> <span>Examination Cell</span>
        </a>

        <div class="nav-section-title">Finance & Campus Services</div>
        <a href="#" class="nav-item ${currentView === 'fees' ? 'active' : ''}" data-view="fees">
          <i class="fa-solid fa-receipt"></i> <span>Fees & Finance (₹49.8 Cr)</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'library' ? 'active' : ''}" data-view="library">
          <i class="fa-solid fa-book-bookmark"></i> <span>Library Catalog</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'hostel' ? 'active' : ''}" data-view="hostel">
          <i class="fa-solid fa-hotel"></i> <span>Hostel & Rooms</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'transport' ? 'active' : ''}" data-view="transport">
          <i class="fa-solid fa-bus"></i> <span>Transport Fleet GPS</span>
          <span class="nav-badge" style="background:#06b6d4;">LIVE</span>
        </a>

        <div class="nav-section-title">Careers & Intelligence</div>
        <a href="#" class="nav-item ${currentView === 'placements' ? 'active' : ''}" data-view="placements">
          <i class="fa-solid fa-briefcase"></i> <span>Placements (TPO)</span>
          <span class="nav-badge" style="background:#10b981;">5 Drives</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'internships' ? 'active' : ''}" data-view="internships">
          <i class="fa-solid fa-laptop-code"></i> <span>Internships</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'complaints' ? 'active' : ''}" data-view="complaints">
          <i class="fa-solid fa-headset"></i> <span>Grievance Redressal</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'events' ? 'active' : ''}" data-view="events">
          <i class="fa-solid fa-calendar-star"></i> <span>Events & Clubs</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'documents' ? 'active' : ''}" data-view="documents">
          <i class="fa-solid fa-folder-open"></i> <span>Documents Vault</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'communication' ? 'active' : ''}" data-view="communication">
          <i class="fa-solid fa-bullhorn"></i> <span>Circulars & Broadcast</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'analytics' ? 'active' : ''}" data-view="analytics">
          <i class="fa-solid fa-chart-line"></i> <span>Analytics Center</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'ai-center' ? 'active' : ''}" data-view="ai-center" style="color:var(--brand-cyan);">
          <i class="fa-solid fa-wand-magic-sparkles"></i> <span>AI Command Center</span>
        </a>
        <a href="#" class="nav-item ${currentView === 'settings' ? 'active' : ''}" data-view="settings">
          <i class="fa-solid fa-sliders"></i> <span>ERP Settings</span>
        </a>
      `;
    }

    navContainer.innerHTML = navHtml;

    // Attach click listeners to newly rendered items
    navContainer.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = e.currentTarget.getAttribute("data-view");
        if (view) {
          navigateTo(view);
        }
      });
    });
  }

  function renderCurrentView() {
    const mainContainer = document.getElementById("main-content-body");
    if (!mainContainer) return;

    // Destroy existing charts to prevent memory leaks
    Object.values(chartInstances).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') chart.destroy();
    });
    chartInstances = {};

    const user = CampusAuth.getCurrentUser();

    switch (currentView) {
      case "dashboard":
        renderRoleDashboard(mainContainer, user);
        break;
      case "students":
        renderStudentsView(mainContainer);
        break;
      case "faculty":
        renderFacultyView(mainContainer);
        break;
      case "academics":
        renderAcademicsView(mainContainer);
        break;
      case "attendance":
        renderAttendanceView(mainContainer, user);
        break;
      case "examinations":
        renderExaminationsView(mainContainer, user);
        break;
      case "fees":
        renderFeesView(mainContainer, user);
        break;
      case "library":
        renderLibraryView(mainContainer);
        break;
      case "hostel":
        renderHostelView(mainContainer, user);
        break;
      case "transport":
        renderTransportView(mainContainer);
        break;
      case "placements":
        renderPlacementsView(mainContainer, user);
        break;
      case "internships":
        renderInternshipsView(mainContainer);
        break;
      case "complaints":
        renderComplaintsView(mainContainer, user);
        break;
      case "events":
        renderEventsView(mainContainer);
        break;
      case "documents":
        renderDocumentsView(mainContainer, user);
        break;
      case "communication":
        renderCommunicationView(mainContainer);
        break;
      case "analytics":
        renderAnalyticsView(mainContainer);
        break;
      case "ai-center":
        renderAICenterView(mainContainer);
        break;
      case "settings":
        renderSettingsView(mainContainer);
        break;
      default:
        renderRoleDashboard(mainContainer, user);
    }
  }

  /* ========================================================================
     1. Role-Specific Dashboards
     ======================================================================== */
  function renderRoleDashboard(container, user) {
    if (user.role === "student") {
      renderStudentDashboard(container, user);
    } else if (user.role === "faculty") {
      renderFacultyDashboard(container, user);
    } else if (user.role === "admin") {
      renderAdminDashboard(container, user);
    } else if (user.role === "management") {
      renderManagementDashboard(container, user);
    } else if (user.role === "placement") {
      renderPlacementDashboard(container, user);
    } else if (user.role === "parent") {
      renderParentDashboard(container, user);
    }
  }

  // 1A. Student Dashboard
  function renderStudentDashboard(container, user) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Welcome back, ${user.name}! 👋</h1>
          <p>${user.department} • Semester ${user.semester} • Section ${user.section} • Reg: <strong>${user.regNo}</strong></p>
        </div>
        <button class="btn btn-ai trigger-ai-chat">
          <i class="fa-solid fa-sparkles"></i> Ask Campus360 AI
        </button>
      </div>

      <!-- AI Real-Time Insight Alert -->
      <div class="card" style="background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; margin-bottom: 1.5rem; border: 1px solid rgba(6,182,212,0.4);">
        <div class="flex items-center justify-between" style="flex-wrap:wrap; gap:1rem;">
          <div class="flex items-center gap-3">
            <div style="width:40px; height:40px; border-radius:8px; background:rgba(6,182,212,0.2); display:flex; align-items:center; justify-content:center; color:#06b6d4; font-size:1.2rem;">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="badge badge-teal">CAMPUS360 ADVISOR INSIGHT</span>
                <span class="text-xs text-muted" style="color:#94a3b8;">Updated 10m ago</span>
              </div>
              <p style="margin-top:0.25rem; font-size:0.925rem; color:#e2e8f0;">
                Your attendance in <strong>CS604 Applied Statistics</strong> is currently at <strong>72%</strong>. Attending the next <strong>3 classes</strong> will elevate you safely above the 75% exam eligibility threshold.
              </p>
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="CampusApp.askAI('How to improve my statistics grade and attendance?')">
            View Remediation Plan
          </button>
        </div>
      </div>

      <!-- Student KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue">
          <div>
            <div class="kpi-label">Overall Attendance</div>
            <div class="kpi-value">${user.attendanceOverall}%</div>
            <div class="kpi-trend text-success"><i class="fa-solid fa-arrow-up"></i> +1.4% this month</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-user-check"></i></div>
        </div>

        <div class="kpi-card kpi-teal">
          <div>
            <div class="kpi-label">Cumulative CGPA</div>
            <div class="kpi-value">${user.cgpa}</div>
            <div class="kpi-trend text-cyan"><i class="fa-solid fa-award"></i> Top 12% in Class</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-graduation-cap"></i></div>
        </div>

        <div class="kpi-card kpi-purple">
          <div>
            <div class="kpi-label">Credits Earned</div>
            <div class="kpi-value">${user.creditsEarned} <span style="font-size:1rem; color:var(--text-muted);">/ ${user.totalCredits}</span></div>
            <div class="kpi-trend text-primary"><i class="fa-solid fa-check"></i> On Track (Sem 6)</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-book-bookmark"></i></div>
        </div>

        <div class="kpi-card kpi-green">
          <div>
            <div class="kpi-label">Placement Readiness</div>
            <div class="kpi-value">${user.placementReadiness}%</div>
            <div class="kpi-trend text-success"><i class="fa-solid fa-briefcase"></i> 3 Matched Drives</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-rocket"></i></div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
        
        <!-- Left: Today's Schedule & Academic Trajectory -->
        <div class="flex flex-col gap-4">
          <!-- Timetable Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fa-solid fa-clock text-primary"></i> Today's Schedule (Wednesday)</div>
              <button class="btn btn-sm btn-secondary" onclick="CampusApp.navigateTo('academics')">Full Timetable</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${CAMPUS_DATA.timetableToday.map(t => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1rem; background: ${t.isCurrent ? 'var(--brand-blue-light)' : 'var(--bg-surface-secondary)'}; border-radius:var(--radius-md); border-left:4px solid ${t.isCurrent ? 'var(--brand-blue)' : (t.status==='Completed' ? 'var(--accent-emerald)' : 'var(--border-medium)')};">
                  <div>
                    <div style="font-weight:700; font-size:0.9rem; color:var(--text-main);">${t.subject}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-user-tie"></i> ${t.faculty} • <i class="fa-solid fa-location-dot"></i> ${t.room}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:0.8rem; font-weight:600; color:var(--text-main);">${t.time}</div>
                    <span class="badge ${t.isCurrent ? 'badge-blue' : (t.status==='Completed' ? 'badge-green' : 'badge-navy')}">${t.status}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Academic Performance Chart -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fa-solid fa-chart-line text-cyan"></i> Semester-wise GPA Progression</div>
              <span class="badge badge-green">Dean's Honor List</span>
            </div>
            <div style="height: 240px; position: relative;">
              <canvas id="student-gpa-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Right: Upcoming Exams & Placement Alerts -->
        <div class="flex flex-col gap-4">
          <!-- Upcoming Exams Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fa-solid fa-file-pen text-danger"></i> Mid-Term 2 Exams</div>
              <span class="badge badge-rose">Oct 12-21</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.65rem;">
              ${CAMPUS_DATA.upcomingExams.slice(0, 3).map(exam => `
                <div style="padding:0.65rem 0.85rem; background:var(--bg-surface-secondary); border-radius:var(--radius-md);">
                  <div style="font-weight:700; font-size:0.85rem;">${exam.subject}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-top:0.25rem;">
                    <span><i class="fa-regular fa-calendar"></i> ${exam.date}</span>
                    <span><i class="fa-solid fa-door-open"></i> ${exam.room}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-sm btn-outline-primary" style="width:100%; margin-top:0.85rem;" onclick="CampusApp.navigateTo('examinations')">
              View Hall Ticket & Exam Guide
            </button>
          </div>

          <!-- Placement Quick Drives -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fa-solid fa-briefcase text-success"></i> Matched Job Drives</div>
              <span class="badge badge-blue">TPO Portal</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.65rem;">
              ${CAMPUS_DATA.placementsList.slice(0, 2).map(p => `
                <div style="padding:0.65rem 0.85rem; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
                  <div class="flex justify-between items-center">
                    <strong style="font-size:0.85rem;">${p.company}</strong>
                    <span class="badge badge-green">${p.package}</span>
                  </div>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${p.role}</div>
                  <div style="font-size:0.72rem; color:var(--brand-blue); margin-top:4px;">Deadline: ${p.deadline}</div>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-sm btn-primary" style="width:100%; margin-top:0.85rem;" onclick="CampusApp.navigateTo('placements')">
              Explore All Drives
            </button>
          </div>

          <!-- My Assigned Bus GPS Quick Telemetry Card -->
          <div class="card" style="border-left:4px solid var(--brand-cyan); background:linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-secondary) 100%);">
            <div class="card-header">
              <div class="card-title"><i class="fa-solid fa-van-shuttle text-cyan"></i> Live Campus Bus (Bhadradri GPS)</div>
              <span class="badge badge-green"><span class="status-dot active pulse"></span> LIVE</span>
            </div>
            <div style="font-size:0.825rem; color:var(--text-main);">
              <div>Assigned: <strong>Route R01 (TS-28-U-1008)</strong></div>
              <div style="margin-top:3px; color:var(--text-muted);">Current Loc: <strong class="text-primary">Rudrampur X-Roads</strong></div>
              <div style="margin-top:3px; color:var(--text-muted);">Next Stop: <strong>Paloncha Town Center (4 Mins)</strong></div>
            </div>
            <div class="flex justify-between items-center" style="margin-top:0.85rem; padding-top:0.75rem; border-top:1px solid var(--border-subtle);">
              <button class="btn btn-sm btn-secondary" onclick="CampusApp.openBusPassModal('${user.id}')">
                <i class="fa-solid fa-qrcode"></i> NFC Pass
              </button>
              <button class="btn btn-sm btn-primary" onclick="CampusApp.navigateTo('transport')">
                <i class="fa-solid fa-crosshairs"></i> Live Radar
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    // Render Student GPA Chart
    setTimeout(() => {
      const ctx = document.getElementById('student-gpa-chart');
      if (ctx) {
        chartInstances['student_gpa'] = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6 (Proj)'],
            datasets: [{
              label: 'SGPA Progression',
              data: [7.90, 8.15, 8.30, 8.25, 8.60, 8.75],
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#2563eb',
              pointRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { min: 6.0, max: 10.0, grid: { color: 'rgba(0,0,0,0.05)' } },
              x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    }, 50);
  }

  // 1B. Faculty Dashboard
  function renderFacultyDashboard(container, user) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Faculty Workspace — ${user.name}</h1>
          <p>${user.designation} • Dept of ${user.department} • Emp ID: ${user.empId}</p>
        </div>
        <button class="btn btn-ai trigger-ai-chat">
          <i class="fa-solid fa-sparkles"></i> Faculty AI Assistant
        </button>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue">
          <div>
            <div class="kpi-label">Assigned Subjects</div>
            <div class="kpi-value">3 Courses</div>
            <div class="kpi-trend text-primary">16 Teaching Hrs/Wk</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-book-open"></i></div>
        </div>

        <div class="kpi-card kpi-amber">
          <div>
            <div class="kpi-label">Today's Lectures</div>
            <div class="kpi-value">4 Classes</div>
            <div class="kpi-trend text-warning"><i class="fa-solid fa-triangle-exclamation"></i> 1 Attendance Pending</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-chalkboard-user"></i></div>
        </div>

        <div class="kpi-card kpi-teal">
          <div>
            <div class="kpi-label">Class Avg Attendance</div>
            <div class="kpi-value">84.8%</div>
            <div class="kpi-trend text-cyan">Batch CSE-3A</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-users"></i></div>
        </div>

        <div class="kpi-card kpi-purple">
          <div>
            <div class="kpi-label">Faculty Feedback Rating</div>
            <div class="kpi-value">${user.rating} <span style="font-size:1rem; color:var(--text-muted);">/ 5.0</span></div>
            <div class="kpi-trend text-success"><i class="fa-solid fa-star"></i> Top Tier Rating</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-ranking-star"></i></div>
        </div>
      </div>

      <!-- Quick Actions for Faculty -->
      <div class="card" style="margin-bottom:1.5rem; background:var(--brand-teal-light); border-color:rgba(13,148,136,0.3);">
        <div class="flex items-center justify-between" style="flex-wrap:wrap; gap:1rem;">
          <div>
            <h4 style="font-size:1rem; font-weight:700; color:var(--brand-teal);"><i class="fa-solid fa-clipboard-check"></i> Action Required: Mark Class Attendance</h4>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">CS601 Machine Learning lecture (09:00 AM) attendance has not yet been submitted to ERP.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-primary" onclick="CampusApp.openAttendanceMarkerModal('CS601')">
              <i class="fa-solid fa-check"></i> Mark Attendance Now
            </button>
            <button class="btn btn-sm btn-secondary" onclick="CampusApp.askAI('Show students in CSE-3A whose attendance is below 75%')">
              <i class="fa-solid fa-sparkles"></i> Run AI Attendance Check
            </button>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Grid -->
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem;">
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fa-solid fa-chart-bar text-primary"></i> Subject-wise Class Attendance & Marks Distribution</div>
            <span class="badge badge-teal">Spring 2026</span>
          </div>
          <div style="height:260px; position:relative;">
            <canvas id="faculty-class-chart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fa-solid fa-triangle-exclamation text-danger"></i> At-Risk Mentees</div>
            <span class="badge badge-rose">Requires Action</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <div style="padding:0.65rem; border-left:3px solid var(--accent-rose); background:var(--bg-surface-secondary); border-radius:var(--radius-sm);">
              <div class="flex justify-between"><strong>Rohan V. Kulkarni</strong> <span class="badge badge-rose">71.5%</span></div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">2 Backlogs • Low Internal Marks</div>
            </div>
            <div style="padding:0.65rem; border-left:3px solid var(--accent-amber); background:var(--bg-surface-secondary); border-radius:var(--radius-sm);">
              <div class="flex justify-between"><strong>Aarav Sharma</strong> <span class="badge badge-amber">72.0% (Stats)</span></div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Overall 87% • Needs 3 Stats classes</div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-primary" style="width:100%; margin-top:1rem;" onclick="CampusApp.navigateTo('students')">
            Manage All Mentees
          </button>
        </div>
      </div>
    `;

    // Render Faculty Chart
    setTimeout(() => {
      const ctx = document.getElementById('faculty-class-chart');
      if (ctx) {
        chartInstances['faculty_chart'] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Machine Learning', 'Database Systems', 'AI Lab', 'Compiler Design'],
            datasets: [
              { label: 'Attendance %', data: [88, 86, 95, 82], backgroundColor: '#2563eb' },
              { label: 'Avg Internal Score (Out of 30)', data: [24.5, 23.2, 27.8, 22.0], backgroundColor: '#06b6d4' }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
          }
        });
      }
    }, 50);
  }

  // 1C. Admin Dashboard
  function renderAdminDashboard(container, user) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>University Administration Overview</h1>
          <p>Institutional Operations Dashboard • Term: Spring 2026 • Autonomous Governance</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="CampusApp.navigateTo('analytics')"><i class="fa-solid fa-chart-pie"></i> Deep Analytics</button>
          <button class="btn btn-ai trigger-ai-chat"><i class="fa-solid fa-sparkles"></i> AI Admin Agent</button>
        </div>
      </div>

      <!-- Campus Admin KPI Matrix -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue">
          <div>
            <div class="kpi-label">Total Enrolled Students</div>
            <div class="kpi-value">8,420</div>
            <div class="kpi-trend text-primary">12 Departments</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-users"></i></div>
        </div>

        <div class="kpi-card kpi-teal">
          <div>
            <div class="kpi-label">Total Faculty Members</div>
            <div class="kpi-value">426</div>
            <div class="kpi-trend text-cyan">1:19.7 Faculty-Student Ratio</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-chalkboard-user"></i></div>
        </div>

        <div class="kpi-card kpi-green">
          <div>
            <div class="kpi-label">Institutional Attendance</div>
            <div class="kpi-value">82.4%</div>
            <div class="kpi-trend text-success"><i class="fa-solid fa-arrow-up"></i> +0.8% vs Fall '25</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-user-check"></i></div>
        </div>

        <div class="kpi-card kpi-purple">
          <div>
            <div class="kpi-label">Fee Realization Rate</div>
            <div class="kpi-value">91.88%</div>
            <div class="kpi-trend text-primary">₹49.80 Cr Collected</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-receipt"></i></div>
        </div>
      </div>

      <!-- Alerts & Actions Priority Banner -->
      <div class="card" style="margin-bottom:1.5rem; border-left:4px solid var(--accent-rose);">
        <div class="card-header" style="margin-bottom:0.75rem; padding-bottom:0.5rem;">
          <div class="card-title text-danger"><i class="fa-solid fa-bell"></i> Critical Institutional Alerts & Actions</div>
          <span class="badge badge-rose">4 High Priority Items</span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
          <div style="background:var(--bg-surface-secondary); padding:0.75rem; border-radius:var(--radius-md);">
            <div style="font-size:0.8rem; color:var(--text-muted);">Low Attendance Risk</div>
            <div style="font-size:1.15rem; font-weight:800; color:var(--accent-rose);">142 Students</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Below 75% Eligibility</div>
          </div>
          <div style="background:var(--bg-surface-secondary); padding:0.75rem; border-radius:var(--radius-md);">
            <div style="font-size:0.8rem; color:var(--text-muted);">Unresolved Grievances</div>
            <div style="font-size:1.15rem; font-weight:800; color:var(--accent-amber);">37 Tickets</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">4 High Severity (Hostel/IT)</div>
          </div>
          <div style="background:var(--bg-surface-secondary); padding:0.75rem; border-radius:var(--radius-md);">
            <div style="font-size:0.8rem; color:var(--text-muted);">Outstanding Dues</div>
            <div style="font-size:1.15rem; font-weight:800; color:var(--brand-blue);">₹4.40 Crore</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">242 Pending Accounts</div>
          </div>
          <div style="background:var(--bg-surface-secondary); padding:0.75rem; border-radius:var(--radius-md);">
            <div style="font-size:0.8rem; color:var(--text-muted);">Placement Rate</div>
            <div style="font-size:1.15rem; font-weight:800; color:var(--accent-emerald);">87.2%</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">1,082 Offers Issued</div>
          </div>
        </div>
      </div>

      <!-- Department Performance Chart & Quick Audit -->
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem;">
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fa-solid fa-building-columns text-primary"></i> Department-Wise Attendance vs Placement Benchmark</div>
            <span class="badge badge-blue">Comparative Metric</span>
          </div>
          <div style="height:260px; position:relative;">
            <canvas id="admin-dept-chart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fa-solid fa-bolt text-warning"></i> Rapid Administrative Tasks</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.65rem;">
            <button class="btn btn-secondary" style="justify-content:flex-start;" onclick="CampusApp.navigateTo('communication')">
              <i class="fa-solid fa-bullhorn text-primary"></i> Publish Campus Circular
            </button>
            <button class="btn btn-secondary" style="justify-content:flex-start;" onclick="CampusApp.navigateTo('examinations')">
              <i class="fa-solid fa-graduation-cap text-cyan"></i> Verify Examination Transcripts
            </button>
            <button class="btn btn-secondary" style="justify-content:flex-start;" onclick="CampusApp.askAI('Which department has the lowest attendance?')">
              <i class="fa-solid fa-sparkles text-warning"></i> Ask AI for Department Rankings
            </button>
            <button class="btn btn-secondary" style="justify-content:flex-start;" onclick="CampusApp.navigateTo('complaints')">
              <i class="fa-solid fa-headset text-danger"></i> Inspect Escalated Grievances
            </button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const ctx = document.getElementById('admin-dept-chart');
      if (ctx) {
        chartInstances['admin_dept'] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['CSE', 'AI-DS', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE', 'MBA'],
            datasets: [
              { label: 'Attendance %', data: [84.8, 86.1, 81.4, 83.2, 79.5, 76.8, 80.2, 88.4], backgroundColor: '#2563eb' },
              { label: 'Placement Rate %', data: [94.2, 92.5, 88.0, 91.8, 78.4, 72.1, 83.6, 89.2], backgroundColor: '#10b981' }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 60, max: 100 } }
          }
        });
      }
    }, 50);
  }

  // 1D. Management Dashboard
  function renderManagementDashboard(container, user) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Executive Management & Trustee Cockpit</h1>
          <p>Strategic Institutional Intelligence • Financial Health • NIRF/NAAC Readiness</p>
        </div>
        <button class="btn btn-ai trigger-ai-chat"><i class="fa-solid fa-sparkles"></i> AI Executive Briefing</button>
      </div>

      <!-- Financial & Strategic KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-green">
          <div>
            <div class="kpi-label">Total Realized Revenue</div>
            <div class="kpi-value">₹49.80 Cr</div>
            <div class="kpi-trend text-success"><i class="fa-solid fa-arrow-up"></i> +11.2% YoY Growth</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-vault"></i></div>
        </div>

        <div class="kpi-card kpi-blue">
          <div>
            <div class="kpi-label">Annual Operating Expenses</div>
            <div class="kpi-value">₹38.50 Cr</div>
            <div class="kpi-trend text-primary">Budget Variance: -2.4%</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-chart-pie"></i></div>
        </div>

        <div class="kpi-card kpi-purple">
          <div>
            <div class="kpi-label">Highest Compensation</div>
            <div class="kpi-value">₹44.0 LPA</div>
            <div class="kpi-trend text-cyan">Google India Campus Drive</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-trophy"></i></div>
        </div>

        <div class="kpi-card kpi-teal">
          <div>
            <div class="kpi-label">Student Retention Rate</div>
            <div class="kpi-value">96.8%</div>
            <div class="kpi-trend text-success">NAAC Criteria 2 Compliant</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-shield-halved"></i></div>
        </div>
      </div>

      <!-- Predictive Intelligence Cards (Forecasts) -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem; margin-bottom:1.5rem;">
        
        <div class="card" style="border-top:4px solid var(--brand-cyan);">
          <div class="card-title text-cyan" style="font-size:0.95rem; margin-bottom:0.5rem;">
            <i class="fa-solid fa-arrow-trend-up"></i> Enrollment Forecast (2027)
          </div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--text-main);">+12.4% Anticipated</div>
          <p style="font-size:0.825rem; color:var(--text-muted); margin-top:0.35rem;">
            Demand for AI & Data Science and Cloud Infrastructure tracks is projected to rise by 28%. Recommended to add 60 seats in AI-DS.
          </p>
        </div>

        <div class="card" style="border-top:4px solid var(--accent-emerald);">
          <div class="card-title text-success" style="font-size:0.95rem; margin-bottom:0.5rem;">
            <i class="fa-solid fa-briefcase"></i> Placement Forecast
          </div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--text-main);">89.2% Final Rate</div>
          <p style="font-size:0.825rem; color:var(--text-muted); margin-top:0.35rem;">
            Average CTC projected at ₹8.5 LPA. Tier-1 product hiring is 14% higher compared to Spring 2025.
          </p>
        </div>

        <div class="card" style="border-top:4px solid var(--accent-amber);">
          <div class="card-title text-warning" style="font-size:0.95rem; margin-bottom:0.5rem;">
            <i class="fa-solid fa-triangle-exclamation"></i> Academic Risk Mitigation
          </div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--text-main);">214 Students Flagged</div>
          <p style="font-size:0.825rem; color:var(--text-muted); margin-top:0.35rem;">
            Early intervention AI has auto-routed customized study roadmaps to 18 faculty mentors, reducing predicted dropouts by 40%.
          </p>
        </div>

      </div>

      <!-- Revenue Breakdown Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fa-solid fa-chart-line text-primary"></i> 5-Year Institutional Financial Trajectory (in ₹ Crores)</div>
          <span class="badge badge-green">Audited Records</span>
        </div>
        <div style="height:280px; position:relative;">
          <canvas id="management-revenue-chart"></canvas>
        </div>
      </div>
    `;

    setTimeout(() => {
      const ctx = document.getElementById('management-revenue-chart');
      if (ctx) {
        chartInstances['management_rev'] = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['2022-23', '2023-24', '2024-25', '2025-26', '2026-27 (Est)'],
            datasets: [
              { label: 'Total Revenue (Cr)', data: [36.5, 41.2, 45.8, 49.8, 55.4], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.3 },
              { label: 'Operating Cost (Cr)', data: [29.1, 32.4, 35.1, 38.5, 41.8], borderColor: '#2563eb', fill: false, tension: 0.3 }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
    }, 50);
  }

  // 1E. Placement Officer Dashboard
  function renderPlacementDashboard(container, user) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Corporate Relations & Placement Command</h1>
          <p>TPO Operations • 2026-27 Campus Recruitment Cycle</p>
        </div>
        <button class="btn btn-ai trigger-ai-chat"><i class="fa-solid fa-sparkles"></i> AI Placement Matcher</button>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card kpi-green">
          <div>
            <div class="kpi-label">Total Offers Made</div>
            <div class="kpi-value">1,082</div>
            <div class="kpi-trend text-success">87.2% Batch Placed</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-handshake"></i></div>
        </div>

        <div class="kpi-card kpi-purple">
          <div>
            <div class="kpi-label">Highest Package</div>
            <div class="kpi-value">₹44.0 LPA</div>
            <div class="kpi-trend text-cyan">Google India</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-trophy"></i></div>
        </div>

        <div class="kpi-card kpi-blue">
          <div>
            <div class="kpi-label">Average Package</div>
            <div class="kpi-value">₹8.4 LPA</div>
            <div class="kpi-trend text-primary">CSE/IT Avg: ₹9.8 LPA</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-chart-simple"></i></div>
        </div>

        <div class="kpi-card kpi-teal">
          <div>
            <div class="kpi-label">Active Drives Ongoing</div>
            <div class="kpi-value">5 Companies</div>
            <div class="kpi-trend text-cyan">740 Students Shortlisted</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-building"></i></div>
        </div>
      </div>

      <!-- Active Recruitment Drives Table -->
      <div class="table-container" style="margin-bottom:1.5rem;">
        <div class="table-toolbar">
          <h3 style="font-size:1.05rem; font-weight:700;"><i class="fa-solid fa-briefcase text-primary"></i> Active Campus Recruitment Drives</h3>
          <button class="btn btn-sm btn-primary" onclick="CampusApp.navigateTo('placements')">Add New Company Drive</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role & Package</th>
              <th>Eligibility</th>
              <th>Applicants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${CAMPUS_DATA.placementsList.map(p => `
              <tr>
                <td><strong>${p.company}</strong></td>
                <td>
                  <div>${p.role}</div>
                  <span class="badge badge-green" style="margin-top:2px;">${p.package}</span>
                </td>
                <td><small>${p.eligibility}</small></td>
                <td><strong>${p.appliedCount}</strong> applied</td>
                <td><span class="badge badge-blue">${p.status}</span></td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="CampusApp.viewCompanyModal('${p.id}')">View Details</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // 1F. Parent Dashboard
  function renderParentDashboard(container, user) {
    const ward = CAMPUS_DATA.demoUsers[0]; // Aarav Sharma
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Parent Portal — ${user.name}</h1>
          <p>Linked Ward: <strong>${ward.name}</strong> (${ward.regNo}) • ${ward.department} (Semester ${ward.semester})</p>
        </div>
        <button class="btn btn-ai trigger-ai-chat"><i class="fa-solid fa-sparkles"></i> Ask Ward Advisor AI</button>
      </div>

      <!-- Ward KPI Overview -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue">
          <div>
            <div class="kpi-label">Ward Attendance</div>
            <div class="kpi-value">${ward.attendanceOverall}%</div>
            <div class="kpi-trend text-success"><i class="fa-solid fa-check"></i> Eligible for Exams</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-user-check"></i></div>
        </div>

        <div class="kpi-card kpi-teal">
          <div>
            <div class="kpi-label">Cumulative CGPA</div>
            <div class="kpi-value">${ward.cgpa}</div>
            <div class="kpi-trend text-cyan">First Class with Distinction</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-award"></i></div>
        </div>

        <div class="kpi-card kpi-green">
          <div>
            <div class="kpi-label">Fee Clearance Status</div>
            <div class="kpi-value">₹0.00 Dues</div>
            <div class="kpi-trend text-success"><i class="fa-solid fa-circle-check"></i> All Fees Paid</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-receipt"></i></div>
        </div>

        <div class="kpi-card kpi-purple">
          <div>
            <div class="kpi-label">Assigned Faculty Mentor</div>
            <div class="kpi-value" style="font-size:1.15rem;">${ward.mentor}</div>
            <div class="kpi-trend text-primary">Dept of CSE</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-user-tie"></i></div>
        </div>
      </div>

      <!-- Parent Ward Details Card -->
      <div style="display:grid; grid-template-columns:2fr 1fr; gap:1.5rem;">
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fa-solid fa-book-open text-primary"></i> Ward Subject-Wise Attendance & Marks</div>
            <span class="badge badge-teal">Semester 6</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Attendance</th>
                <th>Internal Score</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${CAMPUS_DATA.studentsList[0].subjects.map(s => `
                <tr>
                  <td><strong>${s.name}</strong> (${s.code})</td>
                  <td><span class="badge ${s.attendance < 75 ? 'badge-rose' : 'badge-green'}">${s.attendance}%</span></td>
                  <td><strong>${s.internal}</strong> / ${s.maxInternal}</td>
                  <td><span class="badge badge-blue">${s.grade}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="flex flex-col gap-4">
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fa-solid fa-comments text-cyan"></i> Faculty Mentor Note</div>
            </div>
            <p style="font-size:0.875rem; color:var(--text-main); line-height:1.6;">
              <em>"Aarav has been performing exceptionally well in Machine Learning and DevOps labs. Please encourage him to attend all upcoming Applied Statistics classes to keep his attendance above 75%."</em>
            </p>
            <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
              <small style="color:var(--text-muted);">- Dr. Meenakshi Sundaram</small>
              <button class="btn btn-sm btn-outline-primary" onclick="showToast('Message dispatched to Dr. Meenakshi Sundaram', 'success')">
                <i class="fa-regular fa-envelope"></i> Message Mentor
              </button>
            </div>
          </div>

          <!-- Ward Live Bus Radar Card -->
          <div class="card" style="border-left:4px solid var(--brand-blue); background:linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-secondary) 100%);">
            <div class="card-header">
              <div class="card-title"><i class="fa-solid fa-van-shuttle text-primary"></i> Ward Live Bus (Bhadradri GPS)</div>
              <span class="badge badge-green"><span class="status-dot active pulse"></span> LIVE</span>
            </div>
            <div style="font-size:0.825rem; color:var(--text-main);">
              <div>Route: <strong>Route R01 (TS-28-U-1008)</strong></div>
              <div style="margin-top:3px; color:var(--text-muted);">Current Stop: <strong class="text-primary">Rudrampur X-Roads</strong></div>
              <div style="margin-top:3px; color:var(--text-muted);">Boarding Status: <span class="badge badge-teal">Boarded (7:34 AM)</span></div>
            </div>
            <div class="flex justify-between items-center" style="margin-top:0.85rem; padding-top:0.75rem; border-top:1px solid var(--border-subtle);">
              <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-gauge"></i> 44 km/h • On Time</span>
              <button class="btn btn-sm btn-primary" onclick="CampusApp.navigateTo('transport')">
                <i class="fa-solid fa-map-location-dot"></i> Open Live Map
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ========================================================================
     2. Students Management Module
     ======================================================================== */
  function renderStudentsView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Student Directory & Lifecycle Management</h1>
          <p>Explore, filter, and review complete academic and behavioral profiles of students.</p>
        </div>
        <button class="btn btn-primary" onclick="CampusApp.openNewStudentModal()">
          <i class="fa-solid fa-user-plus"></i> Enroll New Student
        </button>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-filter-group">
            <input type="text" id="student-search-input" class="form-input" placeholder="Search by name, reg no, skill..." style="width:240px;" oninput="CampusApp.filterStudents()">
            
            <select id="student-dept-filter" class="filter-select" onchange="CampusApp.filterStudents()">
              <option value="ALL">All Departments</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="AI_DS">AI & Data Science</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="IT">Information Tech (IT)</option>
              <option value="MECH">Mechanical (MECH)</option>
              <option value="CIVIL">Civil Engineering</option>
              <option value="EEE">Electrical (EEE)</option>
            </select>

            <select id="student-risk-filter" class="filter-select" onchange="CampusApp.filterStudents()">
              <option value="ALL">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk (At-Risk)</option>
            </select>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-sm btn-secondary" onclick="showToast('Exported student directory CSV', 'success')">
              <i class="fa-solid fa-file-csv"></i> Export CSV
            </button>
          </div>
        </div>

        <table class="data-table" id="students-table">
          <thead>
            <tr>
              <th>Reg No & Name</th>
              <th>Department</th>
              <th>Sem & Sec</th>
              <th>CGPA</th>
              <th>Attendance</th>
              <th>Fee Status</th>
              <th>Placement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="students-table-body">
            ${renderStudentsTableRows(CAMPUS_DATA.studentsList)}
          </tbody>
        </table>

        <div class="table-pagination">
          <span>Showing 1 to ${CAMPUS_DATA.studentsList.length} of ${CAMPUS_DATA.studentsList.length} enrolled students</span>
          <div class="flex gap-1">
            <button class="btn btn-sm btn-secondary" disabled>Prev</button>
            <button class="btn btn-sm btn-primary">1</button>
            <button class="btn btn-sm btn-secondary" disabled>Next</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderStudentsTableRows(students) {
    return students.map(s => `
      <tr>
        <td>
          <div class="flex items-center gap-2">
            <div style="width:32px; height:32px; border-radius:50%; background:var(--brand-blue-light); color:var(--brand-blue); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem;">
              ${s.name.charAt(0)}
            </div>
            <div>
              <strong>${s.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${s.regNo}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-navy">${s.dept}</span></td>
        <td>Sem ${s.sem} - ${s.sec}</td>
        <td><strong>${s.cgpa}</strong></td>
        <td>
          <span class="badge ${s.attendance < 75 ? 'badge-rose' : (s.attendance < 80 ? 'badge-amber' : 'badge-green')}">
            ${s.attendance}%
          </span>
        </td>
        <td>
          <span class="badge ${s.feeStatus === 'Paid' ? 'badge-green' : (s.feeStatus === 'Partial' ? 'badge-amber' : 'badge-rose')}">
            ${s.feeStatus}
          </span>
        </td>
        <td><small>${s.placementStatus}</small></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="CampusApp.openStudentProfileModal('${s.id}')">
            <i class="fa-solid fa-eye"></i> Profile
          </button>
        </td>
      </tr>
    `).join('');
  }

  function filterStudents() {
    const query = (document.getElementById("student-search-input")?.value || "").toLowerCase();
    const dept = document.getElementById("student-dept-filter")?.value || "ALL";
    const risk = document.getElementById("student-risk-filter")?.value || "ALL";

    const filtered = CAMPUS_DATA.studentsList.filter(s => {
      const matchQuery = s.name.toLowerCase().includes(query) || s.regNo.toLowerCase().includes(query) || (s.skills && s.skills.some(sk => sk.toLowerCase().includes(query)));
      const matchDept = dept === "ALL" || s.dept === dept;
      const matchRisk = risk === "ALL" || s.riskLevel === risk;
      return matchQuery && matchDept && matchRisk;
    });

    const tbody = document.getElementById("students-table-body");
    if (tbody) {
      tbody.innerHTML = renderStudentsTableRows(filtered);
    }
  }

  /* ========================================================================
     3. Faculty Directory Module
     ======================================================================== */
  function renderFacultyView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Faculty Directory & Academic Workload</h1>
          <p>Profiles, research publications, subject allocations, and faculty ratings.</p>
        </div>
        <button class="btn btn-primary" onclick="showToast('Add Faculty modal opened', 'info')">
          <i class="fa-solid fa-plus"></i> Add Faculty Member
        </button>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem;">
        ${CAMPUS_DATA.facultyList.map(f => `
          <div class="card card-hover">
            <div class="flex items-start gap-3">
              <div style="width:54px; height:54px; border-radius:var(--radius-md); background:var(--brand-blue-light); color:var(--brand-blue); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:800; flex-shrink:0;">
                ${f.name.split(' ')[1] ? f.name.split(' ')[1].charAt(0) : f.name.charAt(0)}
              </div>
              <div style="flex:1;">
                <h3 style="font-size:1.05rem; font-weight:700;">${f.name}</h3>
                <div style="font-size:0.8rem; color:var(--brand-cyan); font-weight:600;">${f.designation}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${f.qualification}</div>
              </div>
            </div>

            <div style="margin:1rem 0; padding:0.75rem 0; border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle); font-size:0.825rem; display:flex; flex-direction:column; gap:0.35rem;">
              <div class="flex justify-between">
                <span class="text-muted">Workload:</span>
                <strong>${f.workload}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Assigned Subjects:</span>
                <strong>${f.subjects.length} Subjects</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Student Rating:</span>
                <span class="badge badge-green"><i class="fa-solid fa-star"></i> ${f.rating} / 5.0</span>
              </div>
            </div>

            <div class="flex gap-2">
              <button class="btn btn-sm btn-secondary" style="flex:1;" onclick="CampusApp.openFacultyProfileModal('${f.id}')">View Profile</button>
              <button class="btn btn-sm btn-primary" onclick="showToast('Workload Allocation planner opened for ${f.name}', 'info')">Assign Subject</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ========================================================================
     4. Academics Module
     ======================================================================== */
  function renderAcademicsView(container, user) {
    const isParent = user && user.role === 'parent';
    const isFaculty = user && user.role === 'faculty';
    const isStudent = user && user.role === 'student';

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <div class="flex items-center gap-2">
            <span class="badge ${isParent ? 'badge-yellow' : (isFaculty ? 'badge-blue' : 'badge-teal')}">
              ${isParent ? '👨‍👩‍👧 WARD CURRICULUM' : (isFaculty ? '👩‍🏫 FACULTY LECTURE SCHEDULE' : '👨‍🎓 STUDENT ACADEMIC SCHEDULE')}
            </span>
            <span style="font-size:0.8rem; color:var(--text-muted);">${isParent ? 'Aarav Sharma • CSE 3rd Year' : 'Dept of CSE • Spring 2026'}</span>
          </div>
          <h1 style="margin-top:0.35rem;">
            ${isParent ? 'Ward Academic Curriculum & Timetable' : (isFaculty ? 'Faculty Lecture & Lab Schedule' : 'My Courses & Weekly Timetable')}
          </h1>
          <p>
            ${isParent ? 'View Aarav\'s semester course structure, daily lecture timings, and lab schedules.' : (isFaculty ? 'Manage weekly lecture slots, syllabus milestones, and lab allocations.' : 'Curriculum structure, semester course allocations, and weekly schedule matrix.')}
          </p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="showToast('Syllabus tracker PDF downloaded', 'success')"><i class="fa-solid fa-download"></i> Course Syllabus</button>
          ${isFaculty ? `
            <button class="btn btn-primary" onclick="showToast('Timetable reschedule request opened', 'info')"><i class="fa-solid fa-clock"></i> Reschedule Slot</button>
          ` : `
            <button class="btn btn-primary" onclick="showToast('Academic calendar sync enabled', 'success')"><i class="fa-regular fa-calendar-check"></i> Sync to Calendar</button>
          `}
        </div>
      </div>

      <!-- Timetable Matrix Card -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title"><i class="fa-solid fa-calendar-days text-primary"></i> ${isParent ? 'Aarav\'s 6th Semester CSE - Master Weekly Timetable' : '6th Semester CSE - Master Weekly Timetable'}</div>
          <span class="badge badge-blue">Section A (Spring 2026)</span>
        </div>

        <div style="overflow-x:auto;">
          <table class="data-table" style="min-width:700px;">
            <thead>
              <tr>
                <th>Day</th>
                <th>09:00 - 10:00</th>
                <th>10:05 - 11:05</th>
                <th>11:20 - 12:20</th>
                <th>01:15 - 02:15</th>
                <th>02:20 - 04:20</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Monday</strong></td>
                <td>Machine Learning (LH-302)</td>
                <td>Compiler Design</td>
                <td>DevOps & Cloud</td>
                <td>Statistics</td>
                <td>Compiler Design Lab</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td><strong>Tuesday</strong></td>
                <td>Distributed Systems</td>
                <td>Machine Learning</td>
                <td>Open Elective</td>
                <td>Statistics</td>
                <td>Library / Sports</td>
              </tr>
              <tr style="background:var(--brand-blue-light);">
                <td><strong>Wednesday (Today)</strong></td>
                <td>Machine Learning ✅</td>
                <td>Compiler Design ✅</td>
                <td>DevOps (Live)</td>
                <td>Statistics</td>
                <td>AI & ML Lab (Lab 2)</td>
              </tr>
              <tr>
                <td><strong>Thursday</strong></td>
                <td>Cloud Computing</td>
                <td>Distributed Systems</td>
                <td>Machine Learning</td>
                <td>Statistics</td>
                <td>Project Work (Phase 1)</td>
              </tr>
              <tr>
                <td><strong>Friday</strong></td>
                <td>Statistics</td>
                <td>Compiler Design</td>
                <td>Distributed Systems</td>
                <td>DevOps</td>
                <td>Seminar / Mentorship</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ========================================================================
     5. Attendance Module & Predictive Simulator
     ======================================================================== */
  function renderAttendanceView(container, user) {
    const isParent = user.role === 'parent';
    const isFaculty = user.role === 'faculty';
    const isStudent = user.role === 'student';

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <div class="flex items-center gap-2">
            <span class="badge ${isParent ? 'badge-yellow' : (isFaculty ? 'badge-blue' : 'badge-teal')}">
              ${isParent ? '👨‍👩‍👧 PARENT ATTENDANCE RADAR' : (isFaculty ? '👩‍🏫 CLASS ROLL CALL DESK' : '👨‍🎓 STUDENT ATTENDANCE TELEMETRY')}
            </span>
            <span style="font-size:0.8rem; color:var(--text-muted);">${isParent ? 'Ward: Aarav Sharma (22CSE042)' : (isFaculty ? 'Class: B.Tech CSE 3rd Yr' : 'Term: Even 2026')}</span>
          </div>
          <h1 style="margin-top:0.35rem;">
            ${isParent ? 'Ward Attendance Telemetry & Shortage Alerts' : (isFaculty ? 'Faculty Class Attendance Marker' : 'My Attendance & Predictive Exam Forecast')}
          </h1>
          <p>
            ${isParent ? 'Track Aarav\'s live biometric attendance, subject-wise percentages, and exam eligibility.' : (isFaculty ? 'Record subject-wise class attendance, NFC badge taps, and mark leave permissions.' : 'Daily biometric logs, subject-wise attendance thresholds, and shortage mitigation simulator.')}
          </p>
        </div>
        <div class="flex gap-2">
          ${isFaculty ? `
            <button class="btn btn-primary" onclick="CampusApp.openAttendanceMarkerModal('CS601')">
              <i class="fa-solid fa-clipboard-check"></i> Mark Daily Attendance
            </button>
          ` : (isParent ? `
            <button class="btn btn-secondary" onclick="showToast('Attendance report dispatched to registered WhatsApp and Email', 'success')">
              <i class="fa-solid fa-file-pdf"></i> Download Ward Report
            </button>
            <button class="btn btn-primary" onclick="showToast('Message sent to Faculty Mentor Dr. Meenakshi Sundaram', 'info')">
              <i class="fa-regular fa-comment-dots"></i> Message Mentor
            </button>
          ` : `
            <button class="btn btn-primary" onclick="CampusApp.askAI('How to balance my CS604 attendance with hackathons?')">
              <i class="fa-solid fa-wand-magic-sparkles"></i> AI Attendance Advisor
            </button>
          `)}
        </div>
      </div>

      <!-- Predictive Attendance Forecast Simulator -->
      <div class="card" style="background: linear-gradient(135deg, #0f172a, #1e293b); color:#fff; margin-bottom:1.5rem; border:1px solid rgba(6,182,212,0.3);">
        <div class="card-header" style="border-bottom-color: rgba(255,255,255,0.1);">
          <div class="card-title" style="color:#fff;"><i class="fa-solid fa-wand-magic-sparkles text-cyan"></i> ${isParent ? 'Ward Exam Eligibility Shortage Simulator' : 'AI Attendance Shortage Simulator'}</div>
          <span class="badge badge-teal">Live Projection Model</span>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; align-items:center;">
          <div>
            <p style="font-size:0.875rem; color:#cbd5e1; margin-bottom:1rem;">
              ${isParent ? 'Simulate how attending upcoming classes will bring Aarav safely above the university mandatory 75% cutoff.' : 'Simulate how attending or missing future lectures affects your end-semester eligibility threshold (75%).'}
            </p>
            <div class="form-group">
              <label class="form-label" style="color:#94a3b8;">Select Subject to Simulate:</label>
              <select id="sim-subject-select" class="form-select" style="background:#1e293b; color:#fff; border-color:#334155;" onchange="CampusApp.runAttendanceSimulation()">
                <option value="CS604">CS604 - Applied Statistics (Currently 72.0% ⚠️ Shortage)</option>
                <option value="CS601">CS601 - Machine Learning (Currently 88.0%)</option>
                <option value="CS602">CS602 - Compiler Design (Currently 85.0%)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="color:#94a3b8;">Upcoming Lectures to Attend:</label>
              <input type="range" id="sim-attend-slider" min="0" max="10" value="3" style="width:100%;" oninput="CampusApp.runAttendanceSimulation()">
              <div class="flex justify-between text-xs" style="color:#94a3b8; margin-top:4px;">
                <span>0 Classes</span>
                <span id="sim-slider-val" style="color:#06b6d4; font-weight:700;">+3 Classes</span>
                <span>10 Classes</span>
              </div>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.05); padding:1.25rem; border-radius:var(--radius-lg); border:1px solid rgba(255,255,255,0.1); text-align:center;">
            <div style="font-size:0.8rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em;">Projected Attendance</div>
            <div id="sim-projected-pct" style="font-size:2.5rem; font-weight:800; color:#10b981; margin:0.35rem 0;">75.0%</div>
            <div id="sim-status-badge"><span class="badge badge-green">ELIGIBLE FOR EXAMS</span></div>
            <p id="sim-advice-text" style="font-size:0.8rem; color:#cbd5e1; margin-top:0.65rem;">
              Attending the next 3 consecutive classes will raise attendance to exactly 75.0%, restoring full examination eligibility.
            </p>
          </div>
        </div>
      </div>

      <!-- Subject-Wise Attendance Breakdown Table -->
      <div class="table-container">
        <div class="table-toolbar">
          <h3 style="font-size:1.05rem; font-weight:700;"><i class="fa-solid fa-list-check text-primary"></i> ${isParent ? 'Ward Current Subject-Wise Attendance Breakdown' : 'Current Semester Subject Attendance'}</h3>
          <span class="badge badge-blue">Academic Term: Even 2026</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Subject Code & Name</th>
              <th>Classes Held</th>
              <th>Classes Attended</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Action / Recommendation</th>
            </tr>
          </thead>
          <tbody>
            ${CAMPUS_DATA.studentsList[0].subjects.map(s => {
              const total = 25;
              const attended = Math.round((s.attendance / 100) * total);
              const isShort = s.attendance < 75;
              return `
                <tr>
                  <td><strong>${s.name}</strong> (${s.code})</td>
                  <td>${total}</td>
                  <td>${attended}</td>
                  <td><strong>${s.attendance}%</strong></td>
                  <td>
                    <span class="badge ${isShort ? 'badge-rose' : 'badge-green'}">
                      ${isShort ? 'SHORTAGE (< 75%)' : 'ELIGIBLE'}
                    </span>
                  </td>
                  <td>
                    ${isShort ? `
                      <button class="btn btn-sm btn-outline-primary" onclick="CampusApp.askAI('How to resolve my attendance shortage in ${s.name}?')">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> AI Action Plan
                      </button>
                    ` : '<span class="text-muted"><i class="fa-solid fa-check text-success"></i> Normal</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function runAttendanceSimulation() {
    const slider = document.getElementById("sim-attend-slider");
    const label = document.getElementById("sim-slider-val");
    const pctElem = document.getElementById("sim-projected-pct");
    const badgeElem = document.getElementById("sim-status-badge");
    const adviceElem = document.getElementById("sim-advice-text");

    if (!slider || !label || !pctElem) return;

    const addClasses = parseInt(slider.value);
    label.textContent = `+${addClasses} Classes`;

    // Baseline: 18 / 25 = 72%
    const newAttended = 18 + addClasses;
    const newTotal = 25 + addClasses;
    const newPct = ((newAttended / newTotal) * 100).toFixed(1);

    pctElem.textContent = `${newPct}%`;

    if (newPct >= 75.0) {
      pctElem.style.color = "#10b981";
      badgeElem.innerHTML = '<span class="badge badge-green">ELIGIBLE FOR EXAMS</span>';
      adviceElem.textContent = `Attending ${addClasses} additional class(es) securely elevates you to ${newPct}%, clearing university criteria.`;
    } else {
      pctElem.style.color = "#ef4444";
      badgeElem.innerHTML = '<span class="badge badge-rose">ATTENDANCE SHORTAGE</span>';
      adviceElem.textContent = `Attending ${addClasses} class(es) results in ${newPct}%, which remains below the mandatory 75% cutoff. You need at least 3 classes.`;
    }
  }

  /* ========================================================================
     6. Examinations Module
     ======================================================================== */
  function renderExaminationsView(container, user) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Examinations, Marks Entry & Digital Transcripts</h1>
          <p>Continuous Internal Assessments (CIA), Mid-Terms, Grade Cards & Hall Tickets.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="showToast('Hall ticket PDF generated and downloading...', 'success')">
            <i class="fa-solid fa-download"></i> Download Hall Ticket
          </button>
          <button class="btn btn-primary" onclick="CampusApp.openMarksEntryModal()">
            <i class="fa-solid fa-pen-to-square"></i> Enter Internal Marks
          </button>
        </div>
      </div>

      <!-- Exam Schedule Table -->
      <div class="table-container" style="margin-bottom:1.5rem;">
        <div class="table-toolbar">
          <h3 style="font-size:1.05rem; font-weight:700;"><i class="fa-solid fa-calendar-check text-primary"></i> Mid-Term 2 Examination Timetable (Oct 2026)</h3>
          <span class="badge badge-rose">Hall Ticket Verification Complete</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Subject</th>
              <th>Assessment Type</th>
              <th>Hall & Seat</th>
              <th>Max Marks</th>
            </tr>
          </thead>
          <tbody>
            ${CAMPUS_DATA.upcomingExams.map(ex => `
              <tr>
                <td><strong>${ex.date}</strong><br><small class="text-muted">${ex.time}</small></td>
                <td><strong>${ex.subject}</strong></td>
                <td><span class="badge badge-blue">${ex.type}</span></td>
                <td><i class="fa-solid fa-location-dot text-danger"></i> ${ex.room}</td>
                <td><strong>50 Marks</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Transcript & Grade Summary Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fa-solid fa-certificate text-warning"></i> Semester 5 Official Grade Transcript Summary</div>
          <span class="badge badge-green">SGPA: 8.60 • CGPA: 8.42</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Subject Name</th>
              <th>Credits</th>
              <th>Internal (30)</th>
              <th>End-Sem (70)</th>
              <th>Grade Point</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CS501</td>
              <td>Design & Analysis of Algorithms</td>
              <td>4</td>
              <td>28</td>
              <td>64</td>
              <td><span class="badge badge-green">O (10.0)</span></td>
            </tr>
            <tr>
              <td>CS502</td>
              <td>Operating Systems & Kernel Arch</td>
              <td>4</td>
              <td>26</td>
              <td>58</td>
              <td><span class="badge badge-blue">A+ (9.0)</span></td>
            </tr>
            <tr>
              <td>CS503</td>
              <td>Computer Networks</td>
              <td>4</td>
              <td>27</td>
              <td>60</td>
              <td><span class="badge badge-green">O (10.0)</span></td>
            </tr>
            <tr>
              <td>CS504</td>
              <td>Software Engineering & Agile</td>
              <td>3</td>
              <td>25</td>
              <td>55</td>
              <td><span class="badge badge-blue">A (8.0)</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========================================================================
     7. Fees & Finance Module
     ======================================================================== */
  /* ========================================================================
     7. Fees & Finance Module
     ======================================================================== */
  function renderFeesView(container, user) {
    const isParent = user.role === 'parent';
    const isStudent = user.role === 'student';
    const isAdmin = user.role === 'admin' || user.role === 'management';

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <div class="flex items-center gap-2">
            <span class="badge ${isParent ? 'badge-yellow' : (isAdmin ? 'badge-purple' : 'badge-green')}">
              ${isParent ? '👨‍👩‍👧 PARENT FEE PORTAL' : (isAdmin ? '🏛️ INSTITUTIONAL TREASURY' : '👨‍🎓 STUDENT FEE LEDGER')}
            </span>
            <span style="font-size:0.8rem; color:var(--text-muted);">${isParent ? 'Ward: Aarav Sharma (22CSE042)' : (isAdmin ? 'FY 2025-26 Operations' : 'Aarav Sharma • CSE')}</span>
          </div>
          <h1 style="margin-top:0.35rem;">
            ${isParent ? 'Ward College Fee Payment & Dues Desk' : (isAdmin ? 'Institutional Finance & Revenue Realization' : 'My Student Fee Ledger & Scholarship Credits')}
          </h1>
          <p>
            ${isParent ? 'View Aarav\'s semester fee breakdown, pending dues, digital receipts, and pay online.' : (isAdmin ? 'Real-time college revenue analytics, departmental fee collections, and defaulter tracking.' : 'Institutional fee billing, digital payments, scholarship credits, and receipt ledger.')}
          </p>
        </div>
        <div class="flex gap-2">
          ${isParent || isStudent ? `
            <button class="btn btn-secondary" onclick="showToast('Official Fee Receipt #RCP-2026-0841 downloaded', 'success')">
              <i class="fa-solid fa-download"></i> Download Fee Receipt
            </button>
            <button class="btn btn-primary" onclick="CampusApp.openFeePaymentModal()">
              <i class="fa-solid fa-credit-card"></i> Pay Online via UPI / NetBanking
            </button>
          ` : `
            <button class="btn btn-secondary" onclick="showToast('Fee reconciliation financial report exported to CSV/Excel', 'success')">
              <i class="fa-solid fa-file-invoice-dollar"></i> Export Financial Ledger
            </button>
          `}
        </div>
      </div>

      <!-- Financial Metrics Summary -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-green">
          <div>
            <div class="kpi-label">${isAdmin ? 'Total College Revenue (FY 25-26)' : 'Total Semester 6 Fee'}</div>
            <div class="kpi-value">${isAdmin ? '₹49.80 Cr' : '₹1,45,000'}</div>
            <div class="kpi-trend text-success"><i class="fa-solid fa-circle-check"></i> ${isAdmin ? '91.88% Realization' : 'Fully Cleared'}</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-wallet"></i></div>
        </div>

        <div class="kpi-card kpi-teal">
          <div>
            <div class="kpi-label">${isAdmin ? 'Scholarship Grants Disbursed' : 'Merit Scholarship Credit'}</div>
            <div class="kpi-value">${isAdmin ? '₹3.45 Cr' : '₹25,000'}</div>
            <div class="kpi-trend text-cyan">${isAdmin ? 'Telangana E-Pass & Merit' : 'Merit Grant Sanctioned'}</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-hand-holding-dollar"></i></div>
        </div>

        <div class="kpi-card kpi-blue">
          <div>
            <div class="kpi-label">${isAdmin ? 'Online Collections (Razorpay)' : 'Net Fee Paid (Online)'}</div>
            <div class="kpi-value">${isAdmin ? '₹46.35 Cr' : '₹1,20,000'}</div>
            <div class="kpi-trend text-primary">${isAdmin ? '93.2% Digital Adoption' : 'Receipt #RCP-2026-0841'}</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-receipt"></i></div>
        </div>

        <div class="kpi-card kpi-purple">
          <div>
            <div class="kpi-label">${isAdmin ? 'Outstanding Receivables' : 'Pending Fee Dues'}</div>
            <div class="kpi-value">${isAdmin ? '₹4.40 Cr' : '₹0.00'}</div>
            <div class="kpi-trend text-success">${isAdmin ? '8.12% Pending' : 'No Outstanding Balance'}</div>
          </div>
          <div class="kpi-icon"><i class="fa-solid fa-shield-check"></i></div>
        </div>
      </div>

      <!-- Transaction History Table -->
      <div class="table-container">
        <div class="table-toolbar">
          <h3 style="font-size:1.05rem; font-weight:700;"><i class="fa-solid fa-clock-rotate-left text-primary"></i> Fee Payment History & Tax Receipts</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Txn ID & Date</th>
              <th>Fee Component</th>
              <th>Amount</th>
              <th>Payment Mode</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            ${CAMPUS_DATA.feeLedger.transactions.map(t => `
              <tr>
                <td><strong>${t.id}</strong><br><small class="text-muted">${t.date}</small></td>
                <td>${t.component}</td>
                <td><strong>₹${t.amount.toLocaleString()}</strong></td>
                <td><span class="badge badge-navy">${t.type}</span></td>
                <td><span class="badge badge-green">${t.status}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" onclick="CampusApp.viewReceiptModal('${t.receipt}')">
                    <i class="fa-solid fa-file-pdf"></i> ${t.receipt}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========================================================================
     8. Library Module
     ======================================================================== */
  function renderLibraryView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Digital & Physical Library Catalog</h1>
          <p>Search over 45,000 academic titles, issue books, and manage return deadlines.</p>
        </div>
        <button class="btn btn-primary" onclick="showToast('Book Issue Scanner opened', 'info')">
          <i class="fa-solid fa-barcode"></i> Issue Book via Barcode
        </button>
      </div>

      <!-- Currently Issued Books -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title"><i class="fa-solid fa-book-bookmark text-primary"></i> Currently Borrowed Books (Aarav Sharma)</div>
          <span class="badge badge-green">2 Books Issued (0 Overdue)</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
          ${CAMPUS_DATA.issuedBooks.map(b => `
            <div style="padding:1rem; border:1px solid var(--border-subtle); border-radius:var(--radius-md); background:var(--bg-surface-secondary);">
              <div style="font-weight:700; font-size:0.95rem;">${b.title}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace; margin-top:2px;">ISBN: ${b.isbn}</div>
              <div style="font-size:0.8rem; margin-top:0.5rem; display:flex; justify-content:space-between;">
                <span>Issued: ${b.issueDate}</span>
                <span style="color:var(--brand-blue); font-weight:600;">Due: ${b.dueDate}</span>
              </div>
              <button class="btn btn-sm btn-secondary" style="width:100%; margin-top:0.75rem;" onclick="showToast('Renewed borrowing period by 14 days', 'success')">
                <i class="fa-solid fa-arrows-rotate"></i> Renew 14 Days
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Catalog Table -->
      <div class="table-container">
        <div class="table-toolbar">
          <h3 style="font-size:1.05rem; font-weight:700;"><i class="fa-solid fa-book-open text-primary"></i> Library Book Catalog</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Title & Author</th>
              <th>Category</th>
              <th>Rack Location</th>
              <th>Available Copies</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${CAMPUS_DATA.libraryCatalog.map(book => `
              <tr>
                <td><strong>${book.title}</strong><br><small class="text-muted">${book.author}</small></td>
                <td><span class="badge badge-blue">${book.category}</span></td>
                <td><code>${book.rack}</code></td>
                <td><strong>${book.available}</strong> / ${book.totalCopies}</td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick="showToast('Reserved copy of ${book.title}', 'success')">
                    Reserve Copy
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========================================================================
     9. Hostel Management
     ======================================================================== */
  function renderHostelView(container, user) {
    const room = CAMPUS_DATA.hostelDetails.studentRoom;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Hostel & Residential Accommodation</h1>
          <p>Hostel block occupancy, room allocations, mess menu, and maintenance requests.</p>
        </div>
        <button class="btn btn-primary" onclick="CampusApp.openNewComplaintModal('Hostel & Mess')">
          <i class="fa-solid fa-wrench"></i> Log Hostel Issue
        </button>
      </div>

      <!-- Student Room Card -->
      <div class="card" style="margin-bottom:1.5rem; background:var(--brand-blue-light); border-color:rgba(37,99,235,0.3);">
        <div class="card-header" style="border-bottom-color:rgba(37,99,235,0.15);">
          <div class="card-title text-primary"><i class="fa-solid fa-hotel"></i> Resident Allocation: ${room.block}</div>
          <span class="badge badge-blue">Room ${room.room}</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; font-size:0.875rem;">
          <div><span class="text-muted">Room Type:</span><br><strong>${room.type}</strong></div>
          <div><span class="text-muted">Roommate:</span><br><strong>${room.roommate}</strong></div>
          <div><span class="text-muted">Mess Subscription:</span><br><strong>${room.messPlan}</strong></div>
          <div><span class="text-muted">Hostel Dues:</span><br><strong class="text-success">₹0.00 (Cleared)</strong></div>
        </div>
      </div>

      <!-- Hostel Blocks Occupancy -->
      <div class="table-container">
        <div class="table-toolbar">
          <h3 style="font-size:1.05rem; font-weight:700;"><i class="fa-solid fa-building text-primary"></i> Campus Residential Blocks</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Hostel Block Name</th>
              <th>Total Capacity</th>
              <th>Occupied</th>
              <th>Occupancy Rate</th>
              <th>Chief Warden</th>
            </tr>
          </thead>
          <tbody>
            ${CAMPUS_DATA.hostelDetails.blocks.map(b => `
              <tr>
                <td><strong>${b.name}</strong></td>
                <td>${b.totalRooms} Rooms</td>
                <td>${b.occupied} Occupied</td>
                <td>
                  <span class="badge badge-teal">${((b.occupied/b.totalRooms)*100).toFixed(1)}%</span>
                </td>
                <td>${b.warden} (${b.contact})</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ==========================================================================
     10. Transport & Live Bus GPS Tracking System (Bhadradri Kothagudem Map)
     ========================================================================== */
  let activeTrackingRoute = "R01";
  let activeMapMode = "leaflet"; // "leaflet" or "radar"
  let leafletMapInstance = null;
  let busMarkerLayer = null;
  let routePathLayer = null;
  let stopsLayerGroup = null;
  let landmarksLayerGroup = null;
  let gpsSimulationInterval = null;
  let simWaypointIndex = 0;

  function renderTransportView(container) {
    const route = CAMPUS_DATA.transportRoutes.find(r => r.routeNo === activeTrackingRoute) || CAMPUS_DATA.transportRoutes[0];

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <div class="flex items-center gap-2">
            <span class="badge badge-teal"><i class="fa-solid fa-satellite-dish"></i> GPS RADAR ACTIVE</span>
            <span style="font-size:0.8rem; color:var(--text-muted);">District: Bhadradri Kothagudem (Telangana)</span>
          </div>
          <h1 style="margin-top:0.35rem;">KLR Campus Bus Fleet & Live GPS Tracking</h1>
          <p>Real-time vehicle telemetry, RFID passenger manifest, and interactive GIS mapping across <strong>Bhadradri Kothagudem District</strong>.</p>
        </div>
        <div class="flex gap-2" style="flex-wrap:wrap;">
          <div class="btn-group" style="display:inline-flex; background:var(--bg-surface-secondary); padding:3px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <button class="btn btn-sm ${activeMapMode === 'leaflet' ? 'btn-primary' : 'btn-ghost'}" onclick="CampusApp.toggleMapMode('leaflet')" style="padding:0.35rem 0.75rem; font-size:0.75rem;">
              <i class="fa-solid fa-map-location-dot"></i> GIS District Map
            </button>
            <button class="btn btn-sm ${activeMapMode === 'radar' ? 'btn-primary' : 'btn-ghost'}" onclick="CampusApp.toggleMapMode('radar')" style="padding:0.35rem 0.75rem; font-size:0.75rem;">
              <i class="fa-solid fa-crosshairs"></i> Vector Radar HUD
            </button>
          </div>
          <button class="btn btn-secondary" onclick="CampusApp.openPassengerManifestModal('${route.routeNo}')">
            <i class="fa-solid fa-users-viewfinder text-cyan"></i> Passenger Manifest (${route.assigned})
          </button>
          <button class="btn btn-danger" onclick="CampusApp.triggerBusSOS('${route.routeNo}')">
            <i class="fa-solid fa-triangle-exclamation"></i> SOS Emergency Relay
          </button>
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="stats-grid" style="margin-bottom:1.5rem;">
        <div class="stat-card">
          <div class="stat-icon-wrapper bg-blue-light text-primary">
            <i class="fa-solid fa-bus"></i>
          </div>
          <div>
            <div class="stat-label">Active Fleet on Road</div>
            <div class="stat-value">4 Buses</div>
            <div class="stat-caption text-success"><i class="fa-solid fa-circle-check"></i> 100% On-Time Index</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper bg-green-light text-success">
            <i class="fa-solid fa-id-card-clip"></i>
          </div>
          <div>
            <div class="stat-label">Boarded Students</div>
            <div class="stat-value">204 / 220</div>
            <div class="stat-caption text-primary">NFC Smart Passes Verified</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper bg-yellow-light text-warning">
            <i class="fa-solid fa-gauge-high"></i>
          </div>
          <div>
            <div class="stat-label">Fleet Avg Speed</div>
            <div class="stat-value">45 km/h</div>
            <div class="stat-caption text-muted">Bhadradri District NH-30 / SH</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper bg-purple-light text-secondary">
            <i class="fa-solid fa-school-flag"></i>
          </div>
          <div>
            <div class="stat-label">Destination Campus</div>
            <div class="stat-value">KLR Paloncha</div>
            <div class="stat-caption text-cyan">ETA: 08:25 AM (All Routes)</div>
          </div>
        </div>
      </div>

      <!-- Live Bus GPS Tracking Element with Bhadradri District Map -->
      <div class="bus-tracker-container">
        <!-- Left: Route Selector List -->
        <div class="bus-route-list">
          <div class="flex justify-between items-center" style="margin-bottom:0.35rem;">
            <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em;">
              <i class="fa-solid fa-route text-primary"></i> Bhadradri Routes:
            </span>
            <span class="badge badge-green" style="font-size:0.68rem;"><span class="status-dot active pulse"></span> 4 LIVE</span>
          </div>

          ${CAMPUS_DATA.transportRoutes.map(r => `
            <div class="bus-route-card ${r.routeNo === route.routeNo ? 'active' : ''}" onclick="CampusApp.switchTrackingRoute('${r.routeNo}')">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${r.routeColor || '#2563eb'};"></span>
                  <strong style="font-size:0.95rem;">Route ${r.routeNo}</strong>
                </div>
                <span class="badge ${r.routeNo === route.routeNo ? 'badge-blue' : 'badge-green'}">
                  <span class="status-dot active"></span> LIVE
                </span>
              </div>
              <div style="font-size:0.825rem; font-weight:700; color:var(--text-main); margin-top:5px;">
                <i class="fa-solid fa-van-shuttle" style="color:${r.routeColor}"></i> ${r.busNo}
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px; line-height:1.35;">${r.name}</div>
              
              <div class="flex justify-between items-center" style="margin-top:0.65rem; padding-top:0.5rem; border-top:1px solid var(--border-subtle); font-size:0.75rem;">
                <span><i class="fa-solid fa-location-crosshairs text-cyan"></i> ${r.currentLocation}</span>
                <span style="color:var(--brand-blue); font-weight:700;">ETA: ${r.etaNextStop}</span>
              </div>

              <div class="flex justify-between items-center" style="margin-top:0.4rem; font-size:0.72rem; color:var(--text-muted);">
                <span><i class="fa-solid fa-gauge text-yellow"></i> ${r.speed}</span>
                <span><i class="fa-solid fa-users text-purple"></i> ${r.assigned}/${r.capacity}</span>
              </div>
            </div>
          `).join('')}

          <!-- Driver hotline card -->
          <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:1rem; margin-top:0.5rem;">
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">
              <i class="fa-solid fa-headset text-primary"></i> Transport Cell Hotline
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); line-height:1.4;">
              KLR Transport Incharge: <strong>Prof. M. R. Sharma</strong><br>
              Direct Tel: <strong>+91 98480 99881</strong> (24/7 Control Room)
            </div>
            <button class="btn btn-sm btn-outline-primary" style="width:100%; margin-top:0.65rem;" onclick="showToast('Connecting to KLR Transport Control Room Paloncha...', 'info')">
              <i class="fa-solid fa-phone"></i> Call Transport Desk
            </button>
          </div>
        </div>

        <!-- Right: Real-time Bhadradri Kothagudem Interactive Map & Radar -->
        <div class="live-map-wrapper">
          <div class="live-map-grid-bg"></div>

          <!-- Top Telemetry Status Bar -->
          <div class="flex justify-between items-center" style="position:relative; z-index:5; flex-wrap:wrap; gap:0.75rem; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:0.75rem;">
            <div>
              <div class="flex items-center gap-2">
                <span class="badge badge-teal"><span class="status-dot active pulse"></span> BHADRADRI DISTRICT GPS LIVE</span>
                <span style="font-size:0.8rem; color:#94a3b8;">Active: <strong>Route ${route.routeNo}</strong> (${route.busNo})</span>
              </div>
              <div style="font-size:1.2rem; font-weight:800; margin-top:0.35rem; color:#fff; display:flex; align-items:center; gap:0.5rem;">
                <i class="fa-solid fa-location-dot text-danger"></i> Next Stop: <span id="telemetry-next-stop" style="color:#38bdf8;">${route.nextStop}</span>
              </div>
              <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">
                Current Position: <strong>${route.currentLocation}</strong> • GPS: 4G LTE Active
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div style="text-align:right; background:rgba(255,255,255,0.06); padding:0.4rem 0.85rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.1);">
                <div style="font-size:0.68rem; color:#94a3b8; letter-spacing:0.05em;">LIVE SPEED</div>
                <div id="telemetry-speed" style="font-size:1.2rem; font-weight:800; color:#06b6d4;">${route.speed}</div>
              </div>
              <div style="text-align:right; background:rgba(255,255,255,0.06); padding:0.4rem 0.85rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.1);">
                <div style="font-size:0.68rem; color:#94a3b8; letter-spacing:0.05em;">ETA TO NEXT STOP</div>
                <div id="telemetry-eta" style="font-size:1.2rem; font-weight:800; color:#10b981;">${route.etaNextStop}</div>
              </div>
              <div style="text-align:right; background:rgba(255,255,255,0.06); padding:0.4rem 0.85rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.1);">
                <div style="font-size:0.68rem; color:#94a3b8; letter-spacing:0.05em;">PASSENGERS</div>
                <div style="font-size:1.2rem; font-weight:800; color:#f59e0b;">${route.assigned}/${route.capacity}</div>
              </div>
            </div>
          </div>

          <!-- Map Container (Leaflet GIS or SVG Vector Radar) -->
          <div style="position:relative; z-index:2;">
            ${activeMapMode === 'leaflet' ? `
              <!-- Leaflet Map Container -->
              <div id="bhadradri-leaflet-map"></div>
            ` : `
              <!-- Bhadradri Kothagudem Vector District Map Canvas Simulation -->
              <div style="position:relative; height:380px; margin:0.85rem 0; background:rgba(15,23,42,0.7); border-radius:var(--radius-lg); border:1px solid rgba(255,255,255,0.08); overflow:hidden;">
                <svg style="position:absolute; top:0; left:0; width:100%; height:100%;" viewBox="0 0 750 380">
                  <!-- District Background Grid & Outline -->
                  <defs>
                    <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.12"/>
                      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
                    </radialGradient>
                  </defs>
                  
                  <rect width="100%" height="100%" fill="#0b1120"/>
                  <circle cx="390" cy="190" r="170" fill="url(#radar-glow)" stroke="rgba(6,182,212,0.15)" stroke-width="1" stroke-dasharray="3,3"/>
                  <circle cx="390" cy="190" r="110" fill="none" stroke="rgba(6,182,212,0.2)" stroke-width="1"/>
                  <circle cx="390" cy="190" r="50" fill="none" stroke="rgba(6,182,212,0.3)" stroke-width="1"/>

                  <!-- Godavari River representation -->
                  <path d="M 480,0 Q 530,120 620,200 T 750,330" fill="none" stroke="#0ea5e9" stroke-width="10" opacity="0.4"/>
                  <text x="590" y="110" fill="#38bdf8" font-size="11" font-weight="700" letter-spacing="1">GODAVARI RIVER (భద్రాచలం)</text>

                  <!-- Kinnerasani Reservoir & Dam -->
                  <path d="M 320,60 Q 340,90 380,80 T 410,120" fill="none" stroke="#10b981" stroke-width="4" opacity="0.3"/>
                  <text x="330" y="55" fill="#34d399" font-size="10" font-weight="600">🌲 Kinnerasani Sanctuary & Dam</text>

                  <!-- Secondary Route Lines -->
                  <path d="M 120,90 L 230,150 L 390,190" fill="none" stroke="rgba(16,185,129,0.35)" stroke-dasharray="4,4" stroke-width="2"/>
                  <path d="M 640,60 L 560,150 L 390,190" fill="none" stroke="rgba(139,92,246,0.35)" stroke-dasharray="4,4" stroke-width="2"/>
                  <path d="M 180,330 L 290,260 L 390,190" fill="none" stroke="rgba(245,158,11,0.35)" stroke-dasharray="4,4" stroke-width="2"/>

                  <!-- Active Route Highlight Line -->
                  <path d="M 160,260 Q 280,220 390,190" fill="none" stroke="#2563eb" stroke-width="4"/>

                  <!-- Towns / Landmark Nodes -->
                  <!-- Yellandu -->
                  <circle cx="120" cy="90" r="6" fill="#10b981"/>
                  <text x="95" y="78" fill="#cbd5e1" font-size="11" font-weight="600">Yellandu (ఇల్లందు)</text>

                  <!-- Kothagudem Depot -->
                  <circle cx="160" cy="260" r="7" fill="#2563eb"/>
                  <text x="100" y="285" fill="#60a5fa" font-size="12" font-weight="700">Kothagudem (కొత్తగూడెం Depot)</text>

                  <!-- Rudrampur -->
                  <circle cx="280" cy="220" r="6" fill="#f59e0b"/>
                  <text x="250" y="240" fill="#fcd34d" font-size="11" font-weight="600">Rudrampur</text>

                  <!-- Bhadrachalam -->
                  <circle cx="560" cy="150" r="7" fill="#a855f7"/>
                  <text x="545" y="172" fill="#d8b4fe" font-size="12" font-weight="700">Bhadrachalam (భద్రాచలం)</text>

                  <!-- Manuguru -->
                  <circle cx="640" cy="60" r="6" fill="#8b5cf6"/>
                  <text x="615" y="50" fill="#cbd5e1" font-size="11" font-weight="600">Manuguru (మణుగూరు)</text>

                  <!-- Sathupalli / Aswaraopeta -->
                  <circle cx="180" cy="330" r="6" fill="#f59e0b"/>
                  <text x="140" y="350" fill="#fcd34d" font-size="11" font-weight="600">Sathupalli / Dammapeta</text>

                  <!-- Paloncha (KLR CAMPUS) -->
                  <circle cx="390" cy="190" r="10" fill="#06b6d4" stroke="#ffffff" stroke-width="2.5"/>
                  <text x="310" y="170" fill="#38bdf8" font-size="13" font-weight="800">🏛️ KLR COLLEGE OF ENGG (Paloncha)</text>

                  <!-- Live Animated Bus Marker -->
                  <g transform="translate(270, 205)">
                    <circle cx="14" cy="14" r="18" fill="rgba(37,99,235,0.4)">
                      <animate attributeName="r" values="12;26;12" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <rect x="0" y="0" width="28" height="28" rx="7" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
                    <text x="6" y="20" fill="#ffffff" font-size="14">🚌</text>
                  </g>
                </svg>
              </div>
            `}
          </div>

          <!-- Stop Timeline Progression -->
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-lg); padding:0.85rem 1.25rem; margin:0.5rem 0;">
            <div class="flex justify-between items-center" style="margin-bottom:0.5rem;">
              <span style="font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase;">
                <i class="fa-solid fa-timeline text-primary"></i> Route ${route.routeNo} Stop Progression
              </span>
              <span style="font-size:0.75rem; color:#10b981; font-weight:600;">
                <i class="fa-solid fa-satellite"></i> Real-time Geofence GPS Synced
              </span>
            </div>

            <div class="stop-timeline-horizontal">
              ${route.stops.map(stop => `
                <div class="stop-node ${stop.passed ? 'passed' : (stop.isNext ? 'active' : '')}">
                  <div class="stop-dot">
                    ${stop.passed ? '<i class="fa-solid fa-check"></i>' : (stop.isNext ? '<i class="fa-solid fa-bus"></i>' : '')}
                  </div>
                  <div style="font-size:0.75rem; font-weight:700; color:${stop.isNext ? '#38bdf8' : (stop.passed ? '#10b981' : '#94a3b8')};">
                    ${stop.name}
                  </div>
                  <div style="font-size:0.68rem; color:#64748b; margin-top:2px;">
                    ${stop.time} ${stop.boarded ? `(${stop.boarded} on)` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Bottom Driver & Emergency Telemetry Bar -->
          <div class="flex justify-between items-center" style="position:relative; z-index:5; border-top:1px solid rgba(255,255,255,0.12); padding-top:0.75rem; flex-wrap:wrap; gap:1rem;">
            <div class="flex items-center gap-3">
              <img src="${route.driverPhoto || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}" alt="${route.driver}" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:2px solid #06b6d4;">
              <div>
                <div style="font-size:0.9rem; font-weight:700; color:#fff;">Driver: ${route.driver}</div>
                <div style="font-size:0.75rem; color:#94a3b8;">
                  Phone: <strong>${route.contact}</strong> • Engine Health: <span style="color:#10b981;">${route.engineHealth || 'Optimal'}</span> • Fuel: <span style="color:#f59e0b;">${route.fuelLevel || '78%'}</span>
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <button class="btn btn-sm btn-secondary" style="background:rgba(255,255,255,0.1); color:#fff; border-color:rgba(255,255,255,0.2);" onclick="showToast('Calling driver ${route.driver} (${route.contact})...', 'info')">
                <i class="fa-solid fa-phone"></i> Call Driver
              </button>
              <button class="btn btn-sm btn-outline-primary" style="color:#38bdf8; border-color:#0284c7;" onclick="CampusApp.sendParentBusSMS('${route.routeNo}')">
                <i class="fa-solid fa-paper-plane"></i> Parent SMS Alert
              </button>
              <button class="btn btn-sm btn-primary" onclick="showToast('Live Bhadradri District bus tracking link copied to clipboard & shared to WhatsApp!', 'success')">
                <i class="fa-solid fa-share-nodes"></i> Share Live Location
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Route Fleet Table -->
      <div class="table-container">
        <div class="table-toolbar">
          <div class="flex justify-between items-center" style="width:100%;">
            <div>
              <h3 style="font-size:1.05rem; font-weight:700;"><i class="fa-solid fa-list-check text-primary"></i> KLR College Bus Fleet Schedule (Bhadradri Region)</h3>
              <p style="font-size:0.75rem; color:var(--text-muted);">Real-time tracking of all 4 major transport corridors in Bhadradri Kothagudem District.</p>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="CampusApp.openBusPassModal('STU001')">
              <i class="fa-solid fa-qrcode text-primary"></i> View My Smart Bus Pass
            </button>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Route Code</th>
              <th>Bus Plate</th>
              <th>Driver & Contact</th>
              <th>Current Loc & Live Speed</th>
              <th>Next Stop & ETA</th>
              <th>Status</th>
              <th>Live Actions</th>
            </tr>
          </thead>
          <tbody>
            ${CAMPUS_DATA.transportRoutes.map(r => `
              <tr style="${r.routeNo === route.routeNo ? 'background:var(--brand-blue-light); font-weight:600;' : ''}">
                <td>
                  <div class="flex items-center gap-2">
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${r.routeColor || '#2563eb'};"></span>
                    <strong>Route ${r.routeNo}</strong>
                  </div>
                  <small class="text-muted">${r.name}</small>
                </td>
                <td><span class="badge badge-blue"><strong>${r.busNo}</strong></span></td>
                <td>${r.driver}<br><small class="text-muted"><i class="fa-solid fa-phone" style="font-size:10px;"></i> ${r.contact}</small></td>
                <td>
                  <strong>${r.currentLocation}</strong><br>
                  <span style="font-size:0.75rem; color:var(--brand-cyan);"><i class="fa-solid fa-gauge"></i> ${r.speed}</span>
                </td>
                <td>
                  <strong style="color:var(--brand-blue);">${r.nextStop}</strong><br>
                  <small class="text-success"><i class="fa-solid fa-clock"></i> In ${r.etaNextStop}</small>
                </td>
                <td><span class="badge badge-green"><span class="status-dot active"></span> ${r.status}</span></td>
                <td>
                  <div class="flex gap-1">
                    <button class="btn btn-sm btn-outline-primary" onclick="CampusApp.switchTrackingRoute('${r.routeNo}')" title="Track on Map">
                      <i class="fa-solid fa-crosshairs"></i> Track
                    </button>
                    <button class="btn btn-sm btn-ghost" onclick="CampusApp.openPassengerManifestModal('${r.routeNo}')" title="Passenger Manifest">
                      <i class="fa-solid fa-users"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Initialize Leaflet Map if active
    if (activeMapMode === 'leaflet') {
      setTimeout(() => {
        initBhadradriLeafletMap(route);
      }, 100);
    }
  }

  function initBhadradriLeafletMap(route) {
    const mapContainer = document.getElementById("bhadradri-leaflet-map");
    if (!mapContainer || typeof L === 'undefined') return;

    if (leafletMapInstance) {
      leafletMapInstance.remove();
      leafletMapInstance = null;
    }

    // Centered around Paloncha / Bhadradri Kothagudem District
    const centerCoords = route.currentCoords || [17.5968, 80.6865];
    leafletMapInstance = L.map('bhadradri-leaflet-map', {
      center: centerCoords,
      zoom: 12,
      zoomControl: true
    });

    // Dark/Voyager CartoDB Tile Layer for modern SaaS theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(leafletMapInstance);

    stopsLayerGroup = L.layerGroup().addTo(leafletMapInstance);
    landmarksLayerGroup = L.layerGroup().addTo(leafletMapInstance);

    // 1. Add District Landmarks
    CAMPUS_DATA.districtLandmarks.forEach(lm => {
      if (lm.type === 'campus') {
        const campusIcon = L.divIcon({
          className: 'leaflet-bus-div-icon',
          html: `<div class="custom-campus-pin"><i class="fa-solid ${lm.icon}"></i> ${lm.name}</div>`,
          iconSize: [220, 30],
          iconAnchor: [110, 15]
        });
        L.marker([lm.lat, lm.lng], { icon: campusIcon })
          .bindPopup(`<strong>🏛️ ${lm.name}</strong><br>Paloncha, Bhadradri Kothagudem<br><span style="color:#06b6d4; font-weight:700;">Affiliated to JNTUH • Estd. 2008</span>`)
          .addTo(landmarksLayerGroup);
      } else {
        const landmarkIcon = L.divIcon({
          className: 'leaflet-bus-div-icon',
          html: `<div class="custom-landmark-pin"><i class="fa-solid ${lm.icon}" style="color:${lm.color}"></i> ${lm.name}</div>`,
          iconSize: [160, 24],
          iconAnchor: [80, 12]
        });
        L.marker([lm.lat, lm.lng], { icon: landmarkIcon })
          .bindPopup(`<strong>${lm.name}</strong><br>Bhadradri Kothagudem Landmark`)
          .addTo(landmarksLayerGroup);
      }
    });

    // 2. Draw Polyline for All Routes
    CAMPUS_DATA.transportRoutes.forEach(r => {
      const isSelected = r.routeNo === route.routeNo;
      const polyline = L.polyline(r.waypoints, {
        color: r.routeColor || '#2563eb',
        weight: isSelected ? 5 : 3,
        opacity: isSelected ? 0.9 : 0.4,
        dashArray: isSelected ? null : '6, 6'
      }).addTo(leafletMapInstance);

      if (isSelected) {
        routePathLayer = polyline;
      }
    });

    // 3. Add Stops for Active Route
    route.stops.forEach((st, idx) => {
      const stopIcon = L.divIcon({
        className: 'leaflet-bus-div-icon',
        html: `<div class="custom-stop-pin ${st.passed ? 'passed' : (st.isNext ? 'upcoming' : '')}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      L.marker([st.lat, st.lng], { icon: stopIcon })
        .bindPopup(`
          <div style="font-family:sans-serif; font-size:12px;">
            <strong>Stop #${idx+1}: ${st.name}</strong><br>
            Time: <strong>${st.time}</strong><br>
            Status: <span style="color:${st.passed ? '#10b981' : (st.isNext ? '#f59e0b' : '#64748b')}; font-weight:700;">
              ${st.passed ? '✅ Passed' : (st.isNext ? '⏳ NEXT STOP' : 'Upcoming')}
            </span><br>
            Boarded: <strong>${st.boarded || 0} Students</strong>
          </div>
        `)
        .addTo(stopsLayerGroup);
    });

    // 4. Add Moving Bus Marker with Pulse Radar
    const busIcon = L.divIcon({
      className: 'leaflet-bus-div-icon',
      html: `
        <div class="custom-bus-marker-pin">
          <div class="radar-pulse"></div>
          <div class="bus-core-badge" style="background:${route.routeColor || '#2563eb'}">
            <i class="fa-solid fa-bus"></i>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    busMarkerLayer = L.marker(route.currentCoords, { icon: busIcon })
      .bindPopup(`
        <div style="font-family:sans-serif; font-size:12px; min-width:180px;">
          <div style="font-weight:800; font-size:13px; color:#2563eb;">Route ${route.routeNo} • ${route.busNo}</div>
          <div>Driver: <strong>${route.driver}</strong> (${route.contact})</div>
          <div>Speed: <strong style="color:#06b6d4;">${route.speed}</strong></div>
          <div>Next: <strong>${route.nextStop}</strong> (ETA: ${route.etaNextStop})</div>
          <div>Occupancy: <strong>${route.assigned} / ${route.capacity} Students</strong></div>
          <button class="btn btn-sm btn-primary" style="margin-top:6px; width:100%;" onclick="CampusApp.sendParentBusSMS('${route.routeNo}')">
            <i class="fa-solid fa-paper-plane"></i> Send Parent Alert
          </button>
        </div>
      `)
      .addTo(leafletMapInstance);

    // Fit map bounds to show full route
    if (route.waypoints && route.waypoints.length > 0) {
      leafletMapInstance.fitBounds(L.polyline(route.waypoints).getBounds(), { padding: [40, 40] });
    }

    // Start Live GPS Simulation Ticker
    startGpsLiveSimulation(route);
  }

  function startGpsLiveSimulation(route) {
    if (gpsSimulationInterval) {
      clearInterval(gpsSimulationInterval);
      gpsSimulationInterval = null;
    }

    simWaypointIndex = 0;
    const waypoints = route.waypoints;
    if (!waypoints || waypoints.length === 0) return;

    gpsSimulationInterval = setInterval(() => {
      simWaypointIndex = (simWaypointIndex + 1) % waypoints.length;
      const nextPos = waypoints[simWaypointIndex];

      // Update bus marker on Leaflet map if available
      if (busMarkerLayer && leafletMapInstance) {
        busMarkerLayer.setLatLng(nextPos);
      }

      // Vary speed randomly between 40-52 km/h for realistic telemetry
      const randomSpeed = Math.floor(40 + Math.random() * 12);
      const speedEl = document.getElementById("telemetry-speed");
      if (speedEl) speedEl.innerText = `${randomSpeed} km/h`;

      // Update ETA dynamically
      const etaEl = document.getElementById("telemetry-eta");
      if (etaEl) {
        const remainingMins = Math.max(1, 5 - (simWaypointIndex % 4));
        etaEl.innerText = `${remainingMins} Mins`;
      }
    }, 2800);
  }

  function switchTrackingRoute(routeNo) {
    activeTrackingRoute = routeNo;
    renderCurrentView();
    showToast(`Tracking live GPS for Route ${routeNo} across Bhadradri Kothagudem District`, 'info');
  }

  function toggleMapMode(mode) {
    activeMapMode = mode;
    renderCurrentView();
    showToast(`Switched map mode to: ${mode === 'leaflet' ? 'Interactive GIS District Map' : 'Futuristic Radar HUD'}`, 'info');
  }

  function sendParentBusSMS(routeNo) {
    const route = CAMPUS_DATA.transportRoutes.find(r => r.routeNo === routeNo) || CAMPUS_DATA.transportRoutes[0];
    showToast(`SMS Broadcast Sent to ${route.assigned} Parents: "KLR Bus ${route.busNo} is currently at ${route.currentLocation}, ETA to next stop is ${route.etaNextStop}."`, 'success');
  }

  function triggerBusSOS(routeNo) {
    const route = CAMPUS_DATA.transportRoutes.find(r => r.routeNo === routeNo) || CAMPUS_DATA.transportRoutes[0];
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-danger"></i> Emergency SOS Dispatch — Route ${route.routeNo}`;
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="text-align:center; padding:1rem 0;">
          <div style="width:60px; height:60px; border-radius:50%; background:rgba(239,68,68,0.15); color:#ef4444; display:inline-flex; align-items:center; justify-content:center; font-size:1.75rem; margin-bottom:1rem;">
            <i class="fa-solid fa-tower-broadcast"></i>
          </div>
          <h3 style="font-size:1.25rem; font-weight:800; color:#ef4444;">Live Emergency Protocol Ready</h3>
          <p style="font-size:0.875rem; color:var(--text-muted); margin-top:6px;">
            Target Vehicle: <strong>${route.busNo}</strong> (Driver: ${route.driver})<br>
            Current Coordinates: <strong>${route.currentCoords ? route.currentCoords.join(', ') : 'Bhadradri District'}</strong>
          </p>

          <div style="background:var(--bg-surface-secondary); padding:1rem; border-radius:var(--radius-md); margin:1.25rem 0; text-align:left; font-size:0.825rem;">
            <div><i class="fa-solid fa-phone text-danger"></i> <strong>Bhadradri District Control:</strong> 112 / 100</div>
            <div style="margin-top:4px;"><i class="fa-solid fa-hospital text-danger"></i> <strong>Paloncha Area Hospital:</strong> 08744-254108</div>
            <div style="margin-top:4px;"><i class="fa-solid fa-shield-halved text-primary"></i> <strong>KLR Security Desk:</strong> +91 98480 99881</div>
          </div>

          <div class="flex justify-center gap-3">
            <button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Cancel</button>
            <button class="btn btn-danger" onclick="CampusApp.closeGenericModal(); showToast('🚨 Emergency Alert Dispatched to Bhadradri Police & KLR Campus Control Desk!', 'error');">
              <i class="fa-solid fa-bullhorn"></i> Confirm Emergency Relay
            </button>
          </div>
        </div>
      `;
      const modal = document.getElementById("generic-modal-overlay");
      if (modal) modal.classList.add("active");
    }
  }

  function openPassengerManifestModal(routeNo) {
    const route = CAMPUS_DATA.transportRoutes.find(r => r.routeNo === routeNo) || CAMPUS_DATA.transportRoutes[0];
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-users text-primary"></i> Passenger Manifest — Route ${route.routeNo} (${route.busNo})`;
    if (modalBody) {
      modalBody.innerHTML = `
        <div>
          <div class="flex justify-between items-center" style="margin-bottom:1rem; background:var(--bg-surface-secondary); padding:0.75rem 1rem; border-radius:var(--radius-md);">
            <div>
              <strong>${route.name}</strong><br>
              <small class="text-muted">Driver: ${route.driver} (${route.contact})</small>
            </div>
            <span class="badge badge-green">${route.assigned} / ${route.capacity} Students Boarded</span>
          </div>

          <table class="data-table" style="font-size:0.85rem;">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Boarding Stop</th>
                <th>Smart Pass Status</th>
              </tr>
            </thead>
            <tbody>
              ${route.passengers.map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td><code>${p.regNo}</code></td>
                  <td>${p.stop}</td>
                  <td>
                    <span class="badge ${p.status.includes('Boarded') ? 'badge-green' : 'badge-yellow'}">
                      <span class="status-dot active"></span> ${p.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="flex justify-end" style="margin-top:1.25rem;">
            <button class="btn btn-primary" onclick="CampusApp.closeGenericModal()">Done</button>
          </div>
        </div>
      `;
      const modal = document.getElementById("generic-modal-overlay");
      if (modal) modal.classList.add("active");
    }
  }

  function openBusPassModal(studentId) {
    const student = CAMPUS_DATA.students.find(s => s.id === studentId) || CAMPUS_DATA.students[0];
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-id-card text-primary"></i> Digital RFID Bus Pass — ${student.name}`;
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="max-width:360px; margin:0 auto; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border:2px solid #06b6d4; border-radius:var(--radius-xl); padding:1.5rem; color:#fff; box-shadow:0 15px 30px rgba(0,0,0,0.4); text-align:center;">
          <div class="flex items-center justify-between" style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.75rem; margin-bottom:1rem;">
            <div class="flex items-center gap-2">
              <img src="assets/klr_logo.png" style="width:28px; height:28px; background:#fff; border-radius:6px; padding:2px;">
              <div style="font-size:0.75rem; font-weight:800; text-align:left;">KLR COLLEGE<br><span style="color:#06b6d4; font-size:0.65rem;">TRANSPORT PASS</span></div>
            </div>
            <span class="badge badge-teal" style="font-size:0.65rem;">ACTIVE (2025-26)</span>
          </div>

          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid #06b6d4; margin-bottom:0.75rem;">
          
          <h4 style="font-size:1.1rem; font-weight:800; margin:0;">${student.name}</h4>
          <div style="font-size:0.8rem; color:#94a3b8; font-family:monospace;">${student.regNo} • ${student.dept} Dept</div>

          <div style="background:rgba(255,255,255,0.06); border-radius:var(--radius-md); padding:0.75rem; margin:1rem 0; text-align:left; font-size:0.75rem;">
            <div class="flex justify-between"><span>Assigned Route:</span> <strong>Route R01 (Kothagudem)</strong></div>
            <div class="flex justify-between" style="margin-top:4px;"><span>Boarding Point:</span> <strong>Rudrampur X-Roads</strong></div>
            <div class="flex justify-between" style="margin-top:4px;"><span>Pass ID:</span> <strong>RFID-KLRCET-88410</strong></div>
          </div>

          <div style="background:#ffffff; border-radius:10px; padding:8px; display:inline-block; margin-bottom:0.5rem;">
            <i class="fa-solid fa-qrcode" style="font-size:72px; color:#0f172a;"></i>
          </div>
          <div style="font-size:0.7rem; color:#94a3b8;">Scan on Bus Terminal RFID Scanner</div>
        </div>
      `;
      const modal = document.getElementById("generic-modal-overlay");
      if (modal) modal.classList.add("active");
    }
  }

  function openRegisterCollegeModal() {
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-school-flag text-primary"></i> Register Your College for Campus360`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div>
          <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:1.25rem;">
            Join over 120+ autonomous institutions. Transform your campus with unified ERP, AI agents, and live bus GPS tracking.
          </p>

          <form id="register-college-form" onsubmit="event.preventDefault(); CampusApp.submitCollegeRegistration();">
            <div class="form-group">
              <label class="form-label">College / Institute Full Name *</label>
              <input type="text" id="reg-inst-name" class="form-input" placeholder="e.g. KLR College of Engineering & Technology" required>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group">
                <label class="form-label">Affiliated University *</label>
                <input type="text" id="reg-inst-univ" class="form-input" placeholder="e.g. JNTU Hyderabad / Osmania" required>
              </div>
              <div class="form-group">
                <label class="form-label">Campus Location / State *</label>
                <input type="text" id="reg-inst-loc" class="form-input" placeholder="e.g. Kothagudem, Telangana" required>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group">
                <label class="form-label">Principal / Dean Name *</label>
                <input type="text" id="reg-contact-name" class="form-input" placeholder="Dr. Administrator" required>
              </div>
              <div class="form-group">
                <label class="form-label">Official Email *</label>
                <input type="email" id="reg-contact-email" class="form-input" placeholder="principal@college.edu.in" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Total Student Strength</label>
              <select class="form-select" id="reg-student-count">
                <option>500 - 1,500 Students</option>
                <option selected>1,500 - 5,000 Students</option>
                <option>5,000 - 12,000 Students</option>
                <option>12,000+ Students (Multi-Campus)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Required Feature Modules:</label>
              <div class="flex gap-2" style="flex-wrap:wrap; font-size:0.8rem;">
                <label><input type="checkbox" checked> Core ERP & Academics</label>
                <label><input type="checkbox" checked> 8 Multi-Agent AI System</label>
                <label><input type="checkbox" checked> Live GPS Bus Tracker</label>
                <label><input type="checkbox" checked> Online Fee Collection</label>
                <label><input type="checkbox" checked> TPO Placement Matcher</label>
              </div>
            </div>
          </form>
        </div>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Cancel</button>
        <button class="btn btn-primary" onclick="CampusApp.submitCollegeRegistration()">
          <i class="fa-solid fa-paper-plane"></i> Submit Registration & Get License Key
        </button>
      `;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function submitCollegeRegistration() {
    const instName = document.getElementById("reg-inst-name")?.value || "Your Institution";
    const licenseKey = "C360-KLR-" + Math.floor(100000 + Math.random() * 900000);

    closeGenericModal();
    showToast(`🎉 Registration Received for ${instName}! Generated Demo License Key: ${licenseKey}`, "success");

    setTimeout(() => {
      askAI(`Confirm registration for ${instName} and explain onboarded features including Live Bus GPS.`);
    }, 600);
  }

  function switchTrackingRoute(routeNo) {
    activeTrackingRoute = routeNo;
    renderCurrentView();
    showToast(`Tracking live GPS for Route ${routeNo}`, 'info');
  }

  /* ========================================================================
     11. Placements Management
     ======================================================================== */
  function renderPlacementsView(container, user) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Placement Opportunities & Career Drives</h1>
          <p>Corporate recruitment schedules, eligibility matching, and online applications.</p>
        </div>
        <button class="btn btn-ai" onclick="CampusApp.askAI('What skills should I learn for Google SDE?')">
          <i class="fa-solid fa-sparkles"></i> AI Skill Gap Analysis
        </button>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem;">
        ${CAMPUS_DATA.placementsList.map(p => `
          <div class="card card-hover">
            <div class="flex justify-between items-start">
              <div>
                <h3 style="font-size:1.1rem; font-weight:800;">${p.company}</h3>
                <div style="font-size:0.85rem; color:var(--text-muted);">${p.role}</div>
              </div>
              <span class="badge badge-green">${p.package}</span>
            </div>

            <div style="margin:1rem 0; font-size:0.825rem; display:flex; flex-direction:column; gap:0.4rem;">
              <div><i class="fa-solid fa-location-dot text-primary"></i> ${p.location}</div>
              <div><i class="fa-solid fa-circle-check text-cyan"></i> ${p.eligibility}</div>
              <div><i class="fa-regular fa-clock text-danger"></i> Deadline: <strong>${p.deadline}</strong></div>
            </div>

            <div style="margin-bottom:1rem;">
              <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;">SKILLS TESTED:</div>
              <div class="flex gap-1" style="flex-wrap:wrap;">
                ${p.skillsRequired.map(sk => `<span class="capability-chip">${sk}</span>`).join('')}
              </div>
            </div>

            <button class="btn btn-sm btn-primary" style="width:100%;" onclick="CampusApp.viewCompanyModal('${p.id}')">
              Apply / View Drive Details
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ========================================================================
     12. Internships Management
     ======================================================================== */
  function renderInternshipsView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Industrial Internship & Research Fellowships</h1>
          <p>Verified winter/summer internships with corporate stipends and credit transfers.</p>
        </div>
        <button class="btn btn-secondary" onclick="showToast('Internship NOC request submitted', 'success')">
          <i class="fa-solid fa-file-signature"></i> Apply for College NOC
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1.5rem;">
        ${CAMPUS_DATA.internshipsList.map(int => `
          <div class="card card-hover">
            <div class="flex justify-between items-start">
              <div>
                <h3 style="font-size:1.05rem; font-weight:700;">${int.company}</h3>
                <div style="font-size:0.85rem; color:var(--text-muted);">${int.role}</div>
              </div>
              <span class="badge badge-teal">${int.stipend}</span>
            </div>

            <div style="margin:1rem 0; font-size:0.825rem; display:flex; flex-direction:column; gap:0.35rem;">
              <div><strong>Duration:</strong> ${int.duration}</div>
              <div><strong>Location:</strong> ${int.location}</div>
              <div><strong>Openings:</strong> ${int.openings} positions</div>
              <div class="text-danger"><strong>Deadline:</strong> ${int.deadline}</div>
            </div>

            <button class="btn btn-sm btn-primary" style="width:100%;" onclick="showToast('Application submitted for ${int.company} internship', 'success')">
              Submit 1-Click Application
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ========================================================================
     13. Grievance & Complaint Management
     ======================================================================== */
  function renderComplaintsView(container, user) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Grievance & Campus Support Tickets</h1>
          <p>Automated SLA tracking, infrastructure tickets, and student support resolutions.</p>
        </div>
        <button class="btn btn-primary" onclick="CampusApp.openNewComplaintModal()">
          <i class="fa-solid fa-plus"></i> Submit New Grievance
        </button>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <h3 style="font-size:1.05rem; font-weight:700;"><i class="fa-solid fa-headset text-primary"></i> Active Ticket Tracker</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Category & Description</th>
              <th>Submitted By</th>
              <th>Assigned Department</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${CAMPUS_DATA.complaintsList.map(tkt => `
              <tr>
                <td><code>${tkt.id}</code></td>
                <td>
                  <strong>${tkt.subject}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Category: ${tkt.category}</div>
                </td>
                <td><small>${tkt.submittedBy}</small></td>
                <td><span class="badge badge-navy">${tkt.deptAssigned}</span></td>
                <td>
                  <span class="badge ${tkt.priority === 'HIGH' ? 'badge-rose' : (tkt.priority === 'MEDIUM' ? 'badge-amber' : 'badge-teal')}">
                    ${tkt.priority}
                  </span>
                </td>
                <td>
                  <span class="badge ${tkt.status === 'RESOLVED' ? 'badge-green' : (tkt.status === 'IN PROGRESS' ? 'badge-blue' : 'badge-amber')}">
                    ${tkt.status}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="CampusApp.viewTicketModal('${tkt.id}')">View Timeline</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========================================================================
     14. Events & Clubs
     ======================================================================== */
  function renderEventsView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Campus Events, Hackathons & Student Clubs</h1>
          <p>Technical societies, cultural festivals, inter-collegiate hackathons and registrations.</p>
        </div>
        <button class="btn btn-primary" onclick="showToast('Create Event proposal wizard launched', 'info')">
          <i class="fa-solid fa-calendar-plus"></i> Host New Club Event
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem;">
        ${CAMPUS_DATA.eventsAndClubs.map(evt => `
          <div class="card card-hover" style="overflow:hidden; padding:0;">
            <img src="${evt.banner}" alt="${evt.title}" style="height:140px; width:100%; object-fit:cover;">
            <div style="padding:1.25rem;">
              <span class="badge badge-teal" style="margin-bottom:0.5rem;">${evt.club}</span>
              <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:0.35rem;">${evt.title}</h3>
              
              <div style="font-size:0.825rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.25rem; margin-bottom:1rem;">
                <div><i class="fa-regular fa-calendar text-primary"></i> ${evt.date}</div>
                <div><i class="fa-solid fa-location-dot text-danger"></i> ${evt.venue}</div>
                <div style="color:var(--accent-emerald); font-weight:700;"><i class="fa-solid fa-trophy"></i> ${evt.prize}</div>
              </div>

              <div class="flex justify-between items-center">
                <small><strong>${evt.registeredCount}</strong> Registered</small>
                <button class="btn btn-sm btn-primary" onclick="showToast('Successfully registered for ${evt.title}!', 'success')">
                  Register Now
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ========================================================================
     15. Documents Management
     ======================================================================== */
  function renderDocumentsView(container, user) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Verified Student Documents & Certificates</h1>
          <p>Instant digital issuance of bonafide certificates, grade sheets, and smart ID cards.</p>
        </div>
        <button class="btn btn-primary" onclick="showToast('Requested Bonafide Certificate generation', 'success')">
          <i class="fa-solid fa-file-circle-plus"></i> Request New Certificate
        </button>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <h3 style="font-size:1.05rem; font-weight:700;"><i class="fa-solid fa-folder-open text-primary"></i> Digitally Signed Documents</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Document Title</th>
              <th>Type</th>
              <th>Issue Date</th>
              <th>File Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${CAMPUS_DATA.documentsCatalog.map(doc => `
              <tr>
                <td><strong>${doc.title}</strong><br><small class="text-muted">ID: ${doc.id}</small></td>
                <td><span class="badge badge-navy">${doc.type}</span></td>
                <td>${doc.issueDate}</td>
                <td>${doc.size}</td>
                <td><span class="badge badge-green">${doc.status}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" onclick="showToast('Downloading verified PDF for ${doc.title}', 'success')">
                    <i class="fa-solid fa-download"></i> Download PDF
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========================================================================
     16. Communication & Announcements
     ======================================================================== */
  function renderCommunicationView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Broadcast Notices & Campus Circulars</h1>
          <p>Official administrative broadcasts, academic circulars, and departmental updates.</p>
        </div>
        <button class="btn btn-primary" onclick="CampusApp.openNewNoticeModal()">
          <i class="fa-solid fa-paper-plane"></i> Publish New Notice
        </button>
      </div>

      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${CAMPUS_DATA.announcementsList.map(ann => `
          <div class="card" style="border-left:4px solid ${ann.urgent ? 'var(--accent-rose)' : 'var(--brand-blue)'};">
            <div class="flex justify-between items-start" style="margin-bottom:0.5rem;">
              <div>
                <span class="badge ${ann.urgent ? 'badge-rose' : 'badge-blue'}">${ann.category}</span>
                <h3 style="font-size:1.1rem; font-weight:800; margin-top:0.35rem;">${ann.title}</h3>
              </div>
              <small class="text-muted"><i class="fa-regular fa-clock"></i> ${ann.date}</small>
            </div>
            <p style="font-size:0.875rem; color:var(--text-main); margin-bottom:0.75rem;">
              ${ann.summary}
            </p>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:0.5rem;">
              <span>Published by: <strong>${ann.author}</strong></span>
              <button class="btn btn-sm btn-secondary" onclick="showToast('Circular shared to college email & WhatsApp channel', 'success')">
                <i class="fa-solid fa-share-nodes"></i> Share
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ========================================================================
     17. Analytics Center Module
     ======================================================================== */
  function renderAnalyticsView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Campus360 Institutional Analytics Center</h1>
          <p>Real-time telemetry across academic outcomes, fee collection, and recruitment metrics.</p>
        </div>
        <button class="btn btn-secondary" onclick="showToast('Exporting executive PDF analytics report', 'success')">
          <i class="fa-solid fa-file-pdf"></i> Export Executive Report
        </button>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fa-solid fa-chart-pie text-primary"></i> Placement Salary Tier Distribution</div>
          </div>
          <div style="height:260px; position:relative;">
            <canvas id="analytics-salary-chart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fa-solid fa-chart-column text-cyan"></i> Departmental Academic Pass Percentage</div>
          </div>
          <div style="height:260px; position:relative;">
            <canvas id="analytics-pass-chart"></canvas>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const c1 = document.getElementById('analytics-salary-chart');
      if (c1) {
        chartInstances['ana_sal'] = new Chart(c1, {
          type: 'doughnut',
          data: {
            labels: ['Dream (₹15L+)', 'Super Dream (₹10-15L)', 'Digital Core (₹6-10L)', 'Standard (₹4-6L)'],
            datasets: [{
              data: [18, 32, 38, 12],
              backgroundColor: ['#2563eb', '#06b6d4', '#10b981', '#f59e0b']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      const c2 = document.getElementById('analytics-pass-chart');
      if (c2) {
        chartInstances['ana_pass'] = new Chart(c2, {
          type: 'bar',
          data: {
            labels: ['CSE', 'AI-DS', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE', 'MBA'],
            datasets: [{
              label: 'Pass %',
              data: [96.2, 94.8, 89.4, 93.0, 84.2, 81.5, 87.0, 92.4],
              backgroundColor: '#2563eb'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 70, max: 100 } }
          }
        });
      }
    }, 50);
  }

  /* ========================================================================
     18. AI Command Center
     ======================================================================== */
  function renderAICenterView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Campus360 Multi-Agent Intelligence Center</h1>
          <p>8 Specialized Autonomous AI Agents orchestrating college workflows and decision support.</p>
        </div>
        <button class="btn btn-ai trigger-ai-chat">
          <i class="fa-solid fa-sparkles"></i> Open Global AI Chat
        </button>
      </div>

      <div class="agent-grid">
        ${CAMPUS_DATA.aiAgentsConfig.map(agent => `
          <div class="agent-card">
            <div>
              <div class="agent-card-header">
                <div class="agent-icon-box" style="background:${agent.color};">
                  <i class="fa-solid ${agent.icon}"></i>
                </div>
                <div class="agent-info">
                  <span class="badge badge-navy" style="font-size:0.68rem;">${agent.badge}</span>
                  <h3>${agent.name}</h3>
                </div>
              </div>

              <p class="agent-desc">${agent.desc}</p>

              <div class="agent-capabilities">
                <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;">CORE CAPABILITIES:</div>
                ${agent.capabilities.map(cap => `<span class="capability-chip">${cap}</span>`).join('')}
              </div>
            </div>

            <div style="border-top:1px solid var(--border-subtle); padding-top:1rem; margin-top:0.5rem;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem;">
                <em>"${agent.sampleQuery}"</em>
              </div>
              <button class="btn btn-sm btn-primary" style="width:100%;" onclick="CampusApp.launchAgentModal('${agent.id}')">
                <i class="fa-solid fa-play"></i> Launch Agent Workflow
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ========================================================================
     19. Settings Module
     ======================================================================== */
  function renderSettingsView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>System Configuration & Preferences</h1>
          <p>Autonomous College ERP Master Settings, Session Policies, and Notification Gateways.</p>
        </div>
      </div>

      <div class="card" style="max-width:700px;">
        <div class="form-group">
          <label class="form-label">Current Academic Year</label>
          <input type="text" class="form-input" value="${CAMPUS_DATA.collegeInfo.currentAcademicYear}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Current Academic Semester</label>
          <input type="text" class="form-input" value="${CAMPUS_DATA.collegeInfo.currentSemester}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">AI Telemetry & Autonomous Routing</label>
          <select class="form-select">
            <option selected>High Confidence Auto-Routing (Multi-Agent)</option>
            <option>Human-in-the-Loop Moderation Mode</option>
          </select>
        </div>
        <button class="btn btn-primary" onclick="showToast('Settings saved successfully', 'success')">
          Save Configuration
        </button>
      </div>
    `;
  }

  /* ========================================================================
     Modals & AI Chat Overlay Controls
     ======================================================================== */
  function openAIChatModal() {
    const modal = document.getElementById("ai-chat-modal-overlay");
    if (modal) {
      modal.classList.remove("hidden");
      renderAIChatMessages();
    }
  }

  function closeAIChatModal() {
    const modal = document.getElementById("ai-chat-modal-overlay");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  function askAI(promptText) {
    openAIChatModal();
    const input = document.getElementById("ai-chat-input");
    if (input) {
      input.value = promptText;
      sendChatMessage();
    }
  }

  function renderAIChatMessages() {
    const container = document.getElementById("ai-chat-messages");
    if (!container) return;

    container.innerHTML = CampusAI.currentChat.map(msg => `
      <div class="chat-message ${msg.sender}">
        <div class="chat-bubble">
          ${msg.agent ? `<div class="agent-router-badge"><i class="fa-solid fa-sparkles"></i> ${msg.agent}</div>` : ''}
          <div>${msg.text.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  }

  function sendChatMessage() {
    const input = document.getElementById("ai-chat-input");
    if (!input || !input.value.trim()) return;

    const query = input.value.trim();
    input.value = "";

    const user = CampusAuth.getCurrentUser();

    // Push user message
    CampusAI.currentChat.push({ sender: "user", text: query });
    renderAIChatMessages();

    // Simulate AI thinking and streaming response
    setTimeout(() => {
      const response = CampusAI.routeQuery(query, user);
      CampusAI.currentChat.push({
        sender: "ai",
        agent: response.agent,
        text: response.text
      });
      renderAIChatMessages();
    }, 450);
  }

  function launchAgentModal(agentId) {
    const agent = CAMPUS_DATA.aiAgentsConfig.find(a => a.id === agentId);
    if (!agent) return;

    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid ${agent.icon}"></i> ${agent.name} Workflow`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="padding:0.5rem 0;">
          <div style="background:var(--brand-blue-light); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
            <strong>Domain:</strong> ${agent.badge}<br>
            <small style="color:var(--text-muted);">${agent.desc}</small>
          </div>

          <div class="form-group">
            <label class="form-label">Input Query / Task Directive:</label>
            <input type="text" id="agent-exec-input" class="form-input" value="${agent.sampleQuery}">
          </div>

          <div id="agent-exec-status" style="margin-top:1rem; padding:1rem; background:var(--bg-surface-secondary); border-radius:var(--radius-md); font-family:monospace; font-size:0.825rem; display:none;">
            <div>⚡ Connecting to Campus360 AI Central Router...</div>
            <div style="color:var(--brand-blue); margin-top:4px;">🔍 Querying Relational ERP DB...</div>
            <div style="color:var(--accent-emerald); margin-top:4px;">✅ Multi-Agent Inference Complete.</div>
          </div>
        </div>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Close</button>
        <button class="btn btn-primary" onclick="CampusApp.executeAgentWorkflow('${agent.id}')">Execute Agent</button>
      `;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function executeAgentWorkflow(agentId) {
    const statusBox = document.getElementById("agent-exec-status");
    if (statusBox) statusBox.style.display = "block";

    setTimeout(() => {
      showToast("Agent executed successfully! View output in AI Chat.", "success");
      closeGenericModal();
      const input = document.getElementById("agent-exec-input")?.value || "Execute agent analysis";
      askAI(input);
    }, 700);
  }

  function openStudentProfileModal(studentId) {
    const student = CAMPUS_DATA.studentsList.find(s => s.id === studentId) || CAMPUS_DATA.studentsList[0];
    
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-id-card"></i> Student Profile: ${student.name} (${student.regNo})`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <div class="flex items-center gap-3">
            <div style="width:60px; height:60px; border-radius:50%; background:var(--brand-blue-light); color:var(--brand-blue); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:800;">
              ${student.name.charAt(0)}
            </div>
            <div>
              <h3 style="font-size:1.2rem; font-weight:800;">${student.name}</h3>
              <div style="font-size:0.85rem; color:var(--text-muted);">${student.dept} • Sem ${student.sem} (${student.sec}) • Mentor: <strong>${student.mentor || 'Dr. Meenakshi'}</strong></div>
              <div class="flex gap-1" style="margin-top:4px;">
                <span class="badge badge-green">CGPA: ${student.cgpa}</span>
                <span class="badge badge-blue">Attendance: ${student.attendance}%</span>
                <span class="badge ${student.feeStatus==='Paid'?'badge-green':'badge-rose'}">Fees: ${student.feeStatus}</span>
              </div>
            </div>
          </div>

          <div style="border-top:1px solid var(--border-subtle); padding-top:1rem;">
            <h4 style="font-size:0.9rem; font-weight:700; margin-bottom:0.5rem;">Technical Skills & Verified Profile:</h4>
            <div class="flex gap-1" style="flex-wrap:wrap;">
              ${(student.skills || ["Python", "SQL", "Data Structures"]).map(sk => `<span class="capability-chip">${sk}</span>`).join('')}
            </div>
          </div>

          <div style="border-top:1px solid var(--border-subtle); padding-top:1rem;">
            <h4 style="font-size:0.9rem; font-weight:700; margin-bottom:0.5rem;">Direct Actions:</h4>
            <div class="flex gap-2" style="flex-wrap:wrap;">
              <button class="btn btn-sm btn-outline-primary" onclick="showToast('Issued Hall Ticket for ${student.name}', 'success')">Issue Hall Ticket</button>
              <button class="btn btn-sm btn-secondary" onclick="CampusApp.askAI('Show academic risk summary for ${student.name}')">Ask AI Diagnostic</button>
              <button class="btn btn-sm btn-secondary" onclick="showToast('Parent SMS notice queued', 'info')">Send Parent SMS</button>
            </div>
          </div>
        </div>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `<button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Close Profile</button>`;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function openFacultyProfileModal(facultyId) {
    const f = CAMPUS_DATA.facultyList.find(x => x.id === facultyId) || CAMPUS_DATA.facultyList[0];
    
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-chalkboard-user"></i> Faculty Profile: ${f.name}`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div>
          <div style="font-size:1.1rem; font-weight:800;">${f.name}</div>
          <div style="color:var(--brand-cyan); font-weight:600; font-size:0.875rem;">${f.designation} • Dept of ${f.dept}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${f.qualification} • Experience: ${f.experience}</div>

          <div style="margin:1rem 0; padding:1rem; background:var(--bg-surface-secondary); border-radius:var(--radius-md); font-size:0.85rem; display:flex; flex-direction:column; gap:0.4rem;">
            <div><strong>Email:</strong> ${f.email}</div>
            <div><strong>Assigned Subjects:</strong> ${f.subjects.join(', ')}</div>
            <div><strong>Publications & Patents:</strong> ${f.publications} Papers, ${f.patents} Patents</div>
            <div><strong>Attendance Integrity:</strong> ${f.attendanceRate}%</div>
          </div>
        </div>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `<button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Close</button>`;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function viewCompanyModal(companyId) {
    const p = CAMPUS_DATA.placementsList.find(x => x.id === companyId) || CAMPUS_DATA.placementsList[0];
    
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-building"></i> ${p.company} Recruitment Drive`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div>
          <div class="flex justify-between items-center">
            <h3 style="font-size:1.2rem; font-weight:800;">${p.role}</h3>
            <span class="badge badge-green" style="font-size:0.9rem;">${p.package}</span>
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Location: ${p.location} • Deadline: ${p.deadline}</div>

          <div style="margin:1.25rem 0; padding:1rem; background:var(--bg-surface-secondary); border-radius:var(--radius-md); font-size:0.85rem;">
            <strong>Eligibility Criteria:</strong>
            <p style="margin-top:4px; color:var(--text-main);">${p.eligibility}</p>
          </div>

          <div style="margin-bottom:1.25rem;">
            <strong>Interview Rounds:</strong>
            <ol style="margin-left:1.25rem; margin-top:0.35rem; font-size:0.85rem; color:var(--text-muted);">
              ${p.rounds.map(r => `<li style="margin-bottom:2px;">${r}</li>`).join('')}
            </ol>
          </div>
        </div>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Cancel</button>
        <button class="btn btn-primary" onclick="showToast('Registered for ${p.company} drive!', 'success'); CampusApp.closeGenericModal();">
          Confirm 1-Click Registration
        </button>
      `;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function openAttendanceMarkerModal(subjectCode) {
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-clipboard-check"></i> Mark Daily Attendance — ${subjectCode}`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
            Mark presence for Batch CSE-3A (28 Students). Default marked Present.
          </p>
          <div style="max-height:280px; overflow-y:auto; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
            ${CAMPUS_DATA.studentsList.slice(0, 8).map(s => `
              <div style="padding:0.65rem 0.85rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border-subtle);">
                <div>
                  <strong>${s.name}</strong> <small style="color:var(--text-muted);">(${s.regNo})</small>
                </div>
                <div class="flex gap-2">
                  <label style="font-size:0.8rem; font-weight:600;"><input type="radio" name="att_${s.id}" value="P" checked> P</label>
                  <label style="font-size:0.8rem; font-weight:600; color:var(--accent-rose);"><input type="radio" name="att_${s.id}" value="A"> A</label>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Cancel</button>
        <button class="btn btn-primary" onclick="showToast('Attendance recorded & synced with ERP server', 'success'); CampusApp.closeGenericModal();">
          Submit Attendance
        </button>
      `;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function openFeePaymentModal() {
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-credit-card"></i> Online Fee Payment Gateway`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div>
          <div style="background:var(--brand-blue-light); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
            <div class="flex justify-between"><span>Semester 6 Tuition & Exam Fee:</span> <strong>₹1,20,000</strong></div>
            <div class="flex justify-between" style="color:var(--accent-emerald); font-size:0.85rem; margin-top:4px;"><span>Merit Grant Applied:</span> <strong>- ₹25,000</strong></div>
            <div class="flex justify-between" style="font-size:1.1rem; font-weight:800; border-top:1px solid rgba(0,0,0,0.1); padding-top:6px; margin-top:6px;"><span>Net Payable:</span> <strong>₹95,000</strong></div>
          </div>

          <div class="form-group">
            <label class="form-label">Payment Mode:</label>
            <select class="form-select">
              <option>UPI (Google Pay / PhonePe / Paytm)</option>
              <option>Net Banking (HDFC / ICICI / SBI)</option>
              <option>Credit / Debit Card</option>
            </select>
          </div>
        </div>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Cancel</button>
        <button class="btn btn-primary" onclick="showToast('Payment successful! Digital Receipt RCP-2026-9912 generated', 'success'); CampusApp.closeGenericModal();">
          Pay ₹95,000 Now
        </button>
      `;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function openNewComplaintModal(prefillCategory = "") {
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-headset"></i> Submit Grievance / Maintenance Ticket`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div>
          <div class="form-group">
            <label class="form-label">Category:</label>
            <select class="form-select" id="tkt-cat">
              <option ${prefillCategory==='IT & Network'?'selected':''}>IT & Network</option>
              <option ${prefillCategory==='Hostel & Mess'?'selected':''}>Hostel & Mess</option>
              <option ${prefillCategory==='Infrastructure'?'selected':''}>Infrastructure & Classroom</option>
              <option>Academic & Examination</option>
              <option>Transport</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Subject / Issue Summary:</label>
            <input type="text" class="form-input" id="tkt-sub" placeholder="e.g. WiFi connection drops frequently on 3rd floor">
          </div>

          <div class="form-group">
            <label class="form-label">Priority Level:</label>
            <select class="form-select">
              <option>LOW</option>
              <option selected>MEDIUM</option>
              <option>HIGH (Urgent)</option>
            </select>
          </div>
        </div>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Cancel</button>
        <button class="btn btn-primary" onclick="showToast('Ticket #TKT-2026-904 logged and routed to department head', 'success'); CampusApp.closeGenericModal();">
          Submit Ticket
        </button>
      `;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function viewTicketModal(tktId) {
    const t = CAMPUS_DATA.complaintsList.find(x => x.id === tktId) || CAMPUS_DATA.complaintsList[0];
    
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-ticket"></i> Ticket Details: ${t.id}`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div>
          <div class="flex justify-between items-center">
            <strong>${t.category}</strong>
            <span class="badge ${t.status==='RESOLVED'?'badge-green':'badge-blue'}">${t.status}</span>
          </div>
          <h4 style="font-size:1.05rem; font-weight:700; margin:0.5rem 0;">${t.subject}</h4>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">
            Assigned: <strong>${t.deptAssigned}</strong> • Priority: <strong>${t.priority}</strong>
          </div>

          <div style="border-top:1px solid var(--border-subtle); padding-top:1rem;">
            <strong>Resolution Timeline:</strong>
            <div style="margin-top:0.5rem; display:flex; flex-direction:column; gap:0.5rem; font-size:0.825rem;">
              ${t.timeline.map(tl => `
                <div style="padding:0.5rem; background:var(--bg-surface-secondary); border-radius:var(--radius-sm);">
                  <div style="font-weight:700; color:var(--brand-blue);">${tl.time}</div>
                  <div>${tl.note}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `<button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Close</button>`;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function openRegisterCollegeModal() {
    const modalBody = document.getElementById("generic-modal-body");
    const modalTitle = document.getElementById("generic-modal-title");
    const modal = document.getElementById("generic-modal-overlay");

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-school-flag"></i> Register Your Institution on Campus360`;

    if (modalBody) {
      modalBody.innerHTML = `
        <form id="register-college-form" onsubmit="event.preventDefault(); CampusApp.submitCollegeRegistration();">
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.25rem;">
            Join over 120+ autonomous colleges and universities deploying Campus360 Multi-Agent ERP with live bus GPS telemetry.
          </p>

          <div class="form-group">
            <label class="form-label" for="reg-college-name">Institution / College Name *</label>
            <input type="text" id="reg-college-name" class="form-input" placeholder="e.g. Hyderabad Institute of Technology" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-college-type">Affiliation & Status</label>
            <select id="reg-college-type" class="form-select">
              <option>Autonomous / UGC Approved</option>
              <option>University Affiliated (JNTUH / OU / Anna Univ)</option>
              <option>Deemed / Private University</option>
              <option>Polytechnic & Diploma Institute</option>
            </select>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label class="form-label" for="reg-contact-name">Principal / Registrar *</label>
              <input type="text" id="reg-contact-name" class="form-input" placeholder="Dr. / Prof. Name" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-contact-phone">Official Phone *</label>
              <input type="tel" id="reg-contact-phone" class="form-input" placeholder="+91 98480 XXXXX" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-contact-email">Institutional Email *</label>
            <input type="email" id="reg-contact-email" class="form-input" placeholder="principal@college.edu.in" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-student-count">Approximate Student Strength</label>
            <select id="reg-student-count" class="form-select">
              <option>1,000 - 3,000 Students</option>
              <option selected>3,000 - 8,000 Students</option>
              <option>8,000 - 15,000+ Students</option>
            </select>
          </div>
        </form>
      `;
    }

    const modalFooter = document.getElementById("generic-modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="CampusApp.closeGenericModal()">Cancel</button>
        <button class="btn btn-primary" onclick="CampusApp.submitCollegeRegistration()">
          <i class="fa-solid fa-paper-plane"></i> Submit Registration & Request Demo
        </button>
      `;
    }

    if (modal) modal.classList.remove("hidden");
  }

  function submitCollegeRegistration() {
    const collegeName = document.getElementById("reg-college-name")?.value || "Your Institution";
    closeGenericModal();
    showToast(`Institution registration for "${collegeName}" submitted! Our ERP specialist will contact you shortly.`, "success");
  }

  function closeGenericModal() {
    const modal = document.getElementById("generic-modal-overlay");
    if (modal) modal.classList.add("hidden");
  }

  function handleGlobalSearch(term) {
    showToast(`Searching Campus360 repository for "${term}"...`, "info");
    askAI(`Search campus records for ${term}`);
  }

  return {
    init,
    navigateTo,
    renderCurrentView,
    filterStudents,
    runAttendanceSimulation,
    openAIChatModal,
    closeAIChatModal,
    askAI,
    sendChatMessage,
    launchAgentModal,
    executeAgentWorkflow,
    openStudentProfileModal,
    openFacultyProfileModal,
    viewCompanyModal,
    openAttendanceMarkerModal,
    openFeePaymentModal,
    openNewComplaintModal,
    viewTicketModal,
    switchTrackingRoute,
    toggleMapMode,
    sendParentBusSMS,
    triggerBusSOS,
    openPassengerManifestModal,
    openBusPassModal,
    openRegisterCollegeModal,
    submitCollegeRegistration,
    toggleMobileSidebar,
    closeGenericModal
  };
})();

// Helper Toast System
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-success' : (type === 'error' ? 'fa-circle-exclamation text-danger' : 'fa-circle-info text-cyan')}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Auto-run on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  CampusApp.init();
});

if (typeof window !== 'undefined') {
  window.CampusApp = CampusApp;
  window.showToast = showToast;
}
