/**
 * Campus360 - AI Engine & Multi-Agent Intelligence Core
 * Powers the AI Command Center, Agent Workflows, and Natural Language Query Processing.
 */

const CampusAI = (function () {
  const conversationHistory = [
    {
      id: "conv_1",
      title: "Attendance & Exam Eligibility Analysis",
      date: "Today, 10:15 AM",
      messages: [
        { sender: "user", text: "What is my current attendance status in CS604 Statistics?" },
        { 
          sender: "ai", 
          agent: "Student Advisor Agent",
          text: "Your current attendance in **CS604 Applied Statistics** is **72.0%** (18 out of 25 classes attended). \n\n⚠️ **Risk Alert:** You are **3.0% below the mandatory 75% university eligibility threshold**.\n\n💡 **Action Plan:** You need to attend the next **3 consecutive lectures** without absence to reach **75.0%** eligibility for the upcoming Mid-Term 2 exams." 
        }
      ]
    },
    {
      id: "conv_2",
      title: "Google SDE Placement Skill Gap",
      date: "Yesterday",
      messages: [
        { sender: "user", text: "Am I eligible for Google SDE Drive?" },
        { 
          sender: "ai", 
          agent: "Placement Agent",
          text: "✅ **Eligibility Verified:** Your CGPA (8.42) meets the 8.0+ cutoff, and you have 0 active backlogs.\n\n🎯 **Skill Readiness (82% Match):**\n- ✅ Strong: Python, Data Structures, React\n- ⚠️ Recommended to brush up: Distributed Systems (CS605) & System Design Basics before Round 2." 
        }
      ]
    }
  ];

  let currentChat = conversationHistory[0].messages;

  function routeQuery(query, user) {
    const q = query.toLowerCase().trim();
    const role = user ? user.role : "student";

    // 1. Attendance Queries
    if (q.includes("attendance") || q.includes("classes") || q.includes("absent") || q.includes("below 75")) {
      if (role === "admin" || role === "management" || q.includes("department") || q.includes("lowest")) {
        return {
          agent: "Campus Administration Agent",
          intent: "INSTITUTIONAL_ATTENDANCE_AUDIT",
          text: `📊 **Department Attendance Analysis (Spring 2026):**\n\n- **Highest:** MBA (88.4%) & AI & Data Science (86.1%)\n- **Lowest:** Civil Engineering (**76.8%**) and Mechanical Engineering (**79.5%**)\n\n⚠️ **Action Required:** 142 students across all departments have fallen below the 75% threshold. Automated parent SMS notices have been queued.`,
          chartData: {
            type: "bar",
            labels: ["CSE", "AI-DS", "ECE", "IT", "MECH", "CIVIL", "EEE", "MBA"],
            data: [84.8, 86.1, 81.4, 83.2, 79.5, 76.8, 80.2, 88.4]
          },
          actions: ["Generate Low-Attendance Report", "Send Parent Circular"]
        };
      } else {
        return {
          agent: "Student Advisor Agent",
          intent: "STUDENT_ATTENDANCE_DIAGNOSTIC",
          text: `📈 **Your Overall Attendance is 87.2%** (Eligible for all End-Sem Exams).\n\n**Subject Breakdown:**\n- Machine Learning (CS601): **88%** ✅\n- Compiler Design (CS602): **85%** ✅\n- Cloud & DevOps (CS603): **92%** ✅\n- **Applied Statistics (CS604): 72% ⚠️ (Below 75% Threshold)**\n- Distributed Systems (CS605): **84%** ✅\n- AI & ML Lab (CS606L): **95%** ✅\n\n💡 *AI Recommendation: Attend the next 3 Statistics classes to restore 75%+ eligibility.*`,
          actions: ["Download Attendance Certificate", "Book Mentor Session"]
        };
      }
    }

    // 2. Exam Queries
    if (q.includes("exam") || q.includes("mid term") || q.includes("test") || q.includes("schedule") || q.includes("timetable")) {
      return {
        agent: "Academic Curriculum Agent",
        intent: "EXAM_SCHEDULE_LOOKUP",
        text: `📅 **Upcoming Mid-Term 2 Examination Timetable:**\n\n1. **CS601 Machine Learning** — Oct 12, 2026 (09:30 AM - Hall A-102)\n2. **CS602 Compiler Design** — Oct 14, 2026 (09:30 AM - Hall A-102)\n3. **CS603 Cloud & DevOps** — Oct 16, 2026 (09:30 AM - Hall B-204)\n4. **CS604 Applied Statistics** — Oct 19, 2026 (09:30 AM - Hall A-102)\n5. **CS605 Distributed Systems** — Oct 21, 2026 (09:30 AM - Hall A-102)\n\n📌 *Your Digital Hall Ticket (DOC03) is generated and verified.*`,
        actions: ["Download Hall Ticket PDF", "Add to Calendar"]
      };
    }

    // 3. Placement & Career Queries
    if (q.includes("placement") || q.includes("job") || q.includes("google") || q.includes("microsoft") || q.includes("package") || q.includes("salary") || q.includes("recruit")) {
      if (role === "admin" || role === "management" || role === "placement" || q.includes("rate") || q.includes("average")) {
        return {
          agent: "Placement Matcher & TPO Agent",
          intent: "INSTITUTIONAL_PLACEMENT_ANALYTICS",
          text: `🚀 **Campus Placement Overview (2026 Graduating Batch):**\n\n- **Overall Placement Rate:** **87.2%**\n- **Highest Package:** **₹44.0 LPA** (Google India)\n- **Average Package (CSE/IT):** **₹8.4 LPA**\n- **Total Companies Visited:** **84 Recruiters**\n- **Total Offers Issued:** **1,082 Offers**\n\nTop recruiting sectors: Cloud & AI Software (42%), Core VLSI (22%), Financial Fintech (18%).`,
          chartData: {
            type: "doughnut",
            labels: ["Product (₹15L+)", "Fintech (₹10-15L)", "IT Services (₹6-9L)", "Core Engg (₹5-8L)"],
            data: [28, 34, 45, 18]
          },
          actions: ["Export Placement Brochure", "View Company Drive List"]
        };
      } else {
        return {
          agent: "Career & Skill Roadmap Agent",
          intent: "STUDENT_CAREER_MATCHING",
          text: `💼 **Active Placement Drives Matching Your Profile (Aarav Sharma - CGPA 8.42):**\n\n1. **Google India** (SDE Intern/FTE - ₹34.5 to ₹44 LPA) — **82% Skill Match** (Deadline: Oct 15)\n2. **Microsoft IDC** (Support & SDE - ₹28 to ₹32 LPA) — **88% Skill Match** (Deadline: Oct 20)\n3. **Amazon AWS** (Associate SDE - ₹24 to ₹29.5 LPA) — **91% Skill Match** (Deadline: Oct 28)\n\n💡 *AI Insight: Completing the "Distributed Systems" mock test will boost your Google match score to 94%.*`,
          actions: ["Apply on 1-Click", "Generate Resume Summary"]
        };
      }
    }

    // 4. Financial & Fee Queries
    if (q.includes("fee") || q.includes("dues") || q.includes("pending fee") || q.includes("scholarship") || q.includes("receipt") || q.includes("payment")) {
      if (role === "admin" || role === "management" || role === "faculty") {
        return {
          agent: "Finance & Fee Recovery Agent",
          intent: "COLLEGE_FEE_COLLECTION_SUMMARY",
          text: `💰 **College Financial & Fee Collection Status:**\n\n- **Total Billed:** ₹54.20 Crore\n- **Total Collected:** **₹49.80 Crore (91.88%)**\n- **Outstanding Dues:** **₹4.40 Crore** across 242 students.\n- **Scholarships Disbursed:** ₹3.85 Crore (412 Merit/EWS recipients).\n\n⚠️ Automated WhatsApp & Email reminders have been dispatched to students with overdue balances exceeding ₹20,000.`,
          chartData: {
            type: "pie",
            labels: ["Collected (91.9%)", "Overdue (8.1%)"],
            data: [49.8, 4.4]
          },
          actions: ["Download Fee Recovery Ledger", "Send Bulk Reminders"]
        };
      } else {
        return {
          agent: "Finance & Fee Recovery Agent",
          intent: "STUDENT_FEE_ACCOUNT",
          text: `🧾 **Student Fee Status for Aarav Sharma (22CSE042):**\n\n- **Semester 6 Total Fee:** ₹1,45,000\n- **Merit Scholarship Credit:** ₹25,000\n- **Net Paid:** ₹1,20,000 (Paid via Razorpay UPI - Txn #884192)\n- **Pending Balance:** **₹0.00 (All Cleared)** ✅\n\nYour official digitally signed fee receipt (RCP-2026-0841) is available for download.`,
          actions: ["Download Receipt PDF", "View Fee Breakdown"]
        };
      }
    }

    // 5. At-Risk / Performance Queries
    if (q.includes("risk") || q.includes("failing") || q.includes("declining") || q.includes("backlog") || q.includes("marks") || q.includes("performance")) {
      if (role === "admin" || role === "management" || role === "faculty") {
        return {
          agent: "Performance Analyst Agent",
          intent: "AT_RISK_STUDENTS_COHORT",
          text: `⚠️ **Campus Academic Risk Diagnostic (214 Students Flagged):**\n\n**High Risk Criteria:** (Attendance < 75% + Mid-Term < 40% + Previous Backlogs)\n\n**Top Flagged Students in CSE/ECE:**\n1. **Rohan V. Kulkarni (22CSE089)** — Attendance: 71.5%, Backlogs: 2, Risk: **92%**\n2. **Vikramaditya Rao (22ECE055)** — Attendance: 68.2%, Backlogs: 1, Risk: **84%**\n3. **Dev Patel (23CSE011)** — Attendance: 69.8%, Backlogs: 1, Risk: **79%**\n4. **Nikhil Joshi (22ECE088)** — Attendance: 70.2%, Backlogs: 2, Risk: **88%**\n\nRecommended: Trigger automated mentor-parent conference notifications.`,
          actions: ["Notify Assigned Mentors", "Export Remedial Batch List"]
        };
      } else {
        return {
          agent: "Student Advisor Agent",
          intent: "STUDENT_PERFORMANCE_AUDIT",
          text: `📊 **Academic Performance Trajectory for Aarav Sharma:**\n\n- **Current CGPA:** **8.42 / 10.0** (Top 12% in CSE Dept)\n- **Credits Completed:** 112 / 160\n- **Strongest Subject:** Cloud & DevOps (Internal: 29/30)\n- **Area for Attention:** Applied Statistics (Internal: 21/30, Attendance: 72%)\n\n💡 *AI Insight: Dedicating 45 minutes daily to Statistical Distributions will boost your expected end-sem grade from B+ to A.*`,
          actions: ["Access Study Materials", "Schedule TA Doubt Clearing"]
        };
      }
    }

    // 6. Grievance / Complaints Queries
    if (q.includes("complaint") || q.includes("wifi") || q.includes("hostel") || q.includes("water") || q.includes("mess") || q.includes("ticket")) {
      return {
        agent: "Smart Grievance Dispatcher",
        intent: "GRIEVANCE_TRACKER",
        text: `🛠️ **Your Active Grievance Tickets:**\n\n- **Ticket #TKT-2026-882:** *WiFi connectivity down in Ramanujan Hostel 3rd Floor*\n  - **Status:** **IN PROGRESS**\n  - **Assigned To:** Network Eng. S. Suresh (Campus IT)\n  - **Latest Update:** Access point hardware switch being replaced today by 02:00 PM.\n\nAverage resolution time across campus: **1.4 Days** (98% SLA Compliance).`,
        actions: ["Raise New Ticket", "Escalate to Warden"]
      };
    }

    // Default Fallback Natural Language Response
    return {
      agent: "Campus360 AI Central Router",
      intent: "GENERAL_CAMPUS_INTELLIGENCE",
      text: `🤖 **Campus360 Intelligence Engine:**\n\nI processed your query: *"${query}"* against the live institutional database.\n\n- **Verified User:** ${user.name} (${user.role.toUpperCase()})\n- **Campus Status:** Normal Operations • Academic Semester 6\n- **Quick Actions:** You can ask me about your attendance, exam timetable, job placement eligibility, fee receipts, hostel amenities, or ask for deep analytics.`,
      actions: ["View All Modules", "Ask another question"]
    };
  }

  function simulateAgentExecution(agentId, params = {}) {
    const agent = CAMPUS_DATA.aiAgentsConfig.find(a => a.id === agentId) || CAMPUS_DATA.aiAgentsConfig[0];
    
    return {
      agentName: agent.name,
      steps: [
        { title: "Intent Classification", detail: `Identified user intent within ${agent.badge} domain.` },
        { title: "Data Retrieval", detail: "Queried Relational ERP tables (Students, Attendance, Ledger, Academics)." },
        { title: "Cross-Factor Analysis", detail: "Applied statistical rules and machine learning inference weights." },
        { title: "Prescriptive Synthesis", detail: "Generated actionable insight and automated follow-up triggers." }
      ],
      output: `✅ **${agent.name} Execution Complete**\n\nSynthesized multi-dimensional campus data with 99.4% confidence score. All outputs are synchronized with the primary institutional database.`,
      timestamp: new Date().toLocaleTimeString()
    };
  }

  return {
    conversationHistory,
    currentChat,
    routeQuery,
    simulateAgentExecution
  };
})();

if (typeof window !== 'undefined') {
  window.CampusAI = CampusAI;
}
