/**
 * Campus360 - Authentication & Role-Based Access Control
 * Handles demo accounts, instant role switching, and session management.
 */

const CampusAuth = (function () {
  const STORAGE_KEY = "campus360_active_user";
  let currentUser = null;

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
      } catch (e) {
        currentUser = null;
      }
    } else {
      currentUser = null; // Show login screen first on clean load
    }
  }

  function isLoggedIn() {
    return currentUser !== null;
  }

  function getCurrentUser() {
    return currentUser;
  }

  function loginAsRole(roleKey) {
    const user = CAMPUS_DATA.demoUsers.find(u => u.role === roleKey) || CAMPUS_DATA.demoUsers[0];
    currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("campus:user-changed", { detail: user }));
    return user;
  }

  function loginWithCredentials(email, role) {
    let user = null;
    if (email) {
      user = CAMPUS_DATA.demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    if (!user && role) {
      user = CAMPUS_DATA.demoUsers.find(u => u.role === role);
    }
    if (!user) {
      user = CAMPUS_DATA.demoUsers[0];
    }
    currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("campus:user-changed", { detail: user }));
    return user;
  }

  function logout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("campus:logged-out"));
  }

  function hasPermission(moduleKey) {
    if (!currentUser) return false;
    const role = currentUser.role;

    if (role === "admin" || role === "management") return true;

    const matrix = {
      student: ["dashboard", "academics", "attendance", "examinations", "fees", "library", "hostel", "transport", "placements", "internships", "complaints", "events", "documents", "communication", "ai-center", "settings"],
      faculty: ["dashboard", "students", "academics", "attendance", "examinations", "library", "complaints", "events", "documents", "communication", "ai-center", "settings"],
      placement: ["dashboard", "students", "placements", "internships", "events", "communication", "analytics", "ai-center", "settings"],
      parent: ["dashboard", "academics", "attendance", "examinations", "fees", "complaints", "communication", "ai-center", "settings"]
    };

    return matrix[role] ? matrix[role].includes(moduleKey) : true;
  }

  init();

  return {
    getCurrentUser,
    isLoggedIn,
    loginAsRole,
    loginWithCredentials,
    logout,
    hasPermission
  };
})();

if (typeof window !== 'undefined') {
  window.CampusAuth = CampusAuth;
}
