/**
 * Campus360 - Unified College ERP Database & Sample Data
 * Contains comprehensive, realistic Indian engineering/university dataset.
 */

const CAMPUS_DATA = {
  collegeInfo: {
    name: "KLR College of Engineering and Technology",
    shortName: "Campus360 @ KLRCET",
    tagline: "Approved by AICTE • Affiliated to JNTUH • Estd. 2008 • NAAC Accredited",
    location: "KLR Campus, Paloncha, Bhadradri Kothagudem, Telangana - 507115",
    estd: "2008",
    code: "KLRCET-08",
    currentAcademicYear: "2026-2027",
    currentSemester: "Even Semester (Spring 2026)"
  },

  roles: {
    STUDENT: "student",
    FACULTY: "faculty",
    ADMIN: "admin",
    MANAGEMENT: "management",
    PLACEMENT: "placement",
    PARENT: "parent"
  },

  demoUsers: [
    {
      id: "usr_std_101",
      name: "Aarav Sharma",
      role: "student",
      email: "aarav.sharma@campus360.edu",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      regNo: "22CSE042",
      department: "Computer Science & Engineering",
      deptCode: "CSE",
      year: "3rd Year",
      semester: 6,
      section: "A",
      cgpa: 8.42,
      attendanceOverall: 87.2,
      creditsEarned: 112,
      totalCredits: 160,
      placementReadiness: 78,
      mentor: "Dr. Meenakshi Sundaram",
      hostelResident: true,
      roomNo: "BH-3, Room 412",
      busPassNo: "BUS-R04-18",
      phone: "+91 98451 23456"
    },
    {
      id: "usr_fac_201",
      name: "Dr. Meenakshi Sundaram",
      role: "faculty",
      email: "m.sundaram@campus360.edu",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      empId: "FAC-CSE-019",
      designation: "Associate Professor & Head of Data Science",
      department: "Computer Science & Engineering",
      deptCode: "CSE",
      experience: "14 Years",
      assignedSubjects: ["Machine Learning (CS601)", "Database Systems (CS402)", "AI Lab (CS606L)"],
      activeBatches: ["CSE-3A", "CSE-3B", "AI_DS-3A"],
      rating: 4.8,
      phone: "+91 98450 54321"
    },
    {
      id: "usr_adm_301",
      name: "Dr. Rajesh K. Verma",
      role: "admin",
      email: "dean.academic@campus360.edu",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      empId: "ADM-DEAN-002",
      designation: "Dean of Academics & Controller of Examinations",
      department: "Academic Administration",
      deptCode: "ADMIN",
      experience: "22 Years",
      phone: "+91 98450 00112"
    },
    {
      id: "usr_mgt_401",
      name: "Sri R. K. Singhania",
      role: "management",
      email: "trustee@campus360.edu",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      empId: "MGT-DIR-001",
      designation: "Managing Trustee & Executive Director",
      department: "Board of Governance",
      deptCode: "MANAGEMENT",
      phone: "+91 98450 00001"
    },
    {
      id: "usr_plc_501",
      name: "Ms. Priya Deshmukh",
      role: "placement",
      email: "placements@campus360.edu",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      empId: "PLC-HEAD-005",
      designation: "Head of Training & Placements (TPO)",
      department: "Corporate Relations & Placement Cell",
      deptCode: "TPO",
      phone: "+91 98450 33990"
    },
    {
      id: "usr_par_601",
      name: "Suresh Sharma",
      role: "parent",
      email: "suresh.sharma.blr@gmail.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      wardRegNo: "22CSE042",
      wardName: "Aarav Sharma",
      relation: "Father",
      contact: "+91 98450 12984",
      occupation: "Senior Engineering Manager, Siemens"
    }
  ],

  departments: [
    { code: "CSE", name: "Computer Science & Engineering", students: 1840, faculty: 72, avgAttendance: 84.8, placementRate: 94.2, hod: "Dr. K. S. Raman", budget: "₹12.4 Cr", labCount: 14 },
    { code: "AI_DS", name: "Artificial Intelligence & Data Science", students: 720, faculty: 32, avgAttendance: 86.1, placementRate: 92.5, hod: "Dr. Meenakshi Sundaram", budget: "₹6.8 Cr", labCount: 8 },
    { code: "ECE", name: "Electronics & Communication Engineering", students: 1260, faculty: 58, avgAttendance: 81.4, placementRate: 88.0, hod: "Dr. Venkatadri M.", budget: "₹9.2 Cr", labCount: 12 },
    { code: "IT", name: "Information Technology", students: 940, faculty: 42, avgAttendance: 83.2, placementRate: 91.8, hod: "Dr. Sunita Deshpande", budget: "₹7.5 Cr", labCount: 9 },
    { code: "MECH", name: "Mechanical Engineering", students: 1120, faculty: 64, avgAttendance: 79.5, placementRate: 78.4, hod: "Dr. B. R. Patil", budget: "₹8.9 Cr", labCount: 16 },
    { code: "CIVIL", name: "Civil Engineering", students: 860, faculty: 48, avgAttendance: 76.8, placementRate: 72.1, hod: "Dr. H. N. Suresh", budget: "₹6.1 Cr", labCount: 10 },
    { code: "EEE", name: "Electrical & Electronics Engineering", students: 980, faculty: 52, avgAttendance: 80.2, placementRate: 83.6, hod: "Dr. Radhika Nair", budget: "₹7.0 Cr", labCount: 11 },
    { code: "MBA", name: "Master of Business Administration", students: 480, faculty: 34, avgAttendance: 88.4, placementRate: 89.2, hod: "Prof. Arvind Trivedi", budget: "₹4.2 Cr", labCount: 4 },
    { code: "MCA", name: "Master of Computer Applications", students: 220, faculty: 24, avgAttendance: 85.0, placementRate: 86.4, hod: "Dr. G. Preetha", budget: "₹2.1 Cr", labCount: 4 }
  ],

  studentsList: [
    {
      id: "STU001",
      regNo: "22CSE042",
      name: "Aarav Sharma",
      dept: "CSE",
      sem: 6,
      sec: "A",
      cgpa: 8.42,
      attendance: 87.2,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "In Process",
      email: "aarav.sharma@campus360.edu",
      phone: "+91 98451 23456",
      mentor: "Dr. Meenakshi Sundaram",
      riskLevel: "Low",
      skills: ["Python", "React", "PyTorch", "SQL", "Docker", "Algorithms"],
      subjects: [
        { code: "CS601", name: "Machine Learning", attendance: 88, internal: 27, maxInternal: 30, grade: "A+" },
        { code: "CS602", name: "Compiler Design", attendance: 85, internal: 24, maxInternal: 30, grade: "A" },
        { code: "CS603", name: "Cloud Computing & DevOps", attendance: 92, internal: 29, maxInternal: 30, grade: "O" },
        { code: "CS604", name: "Applied Statistics", attendance: 72, internal: 21, maxInternal: 30, grade: "B+" },
        { code: "CS605", name: "Distributed Systems", attendance: 84, internal: 26, maxInternal: 30, grade: "A" },
        { code: "CS606L", name: "AI & ML Laboratory", attendance: 95, internal: 48, maxInternal: 50, grade: "O" }
      ]
    },
    {
      id: "STU002",
      regNo: "22CSE018",
      name: "Ananya Iyer",
      dept: "CSE",
      sem: 6,
      sec: "A",
      cgpa: 9.35,
      attendance: 94.6,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "Shortlisted (Google)",
      email: "ananya.iyer@campus360.edu",
      phone: "+91 97412 88410",
      mentor: "Dr. K. S. Raman",
      riskLevel: "None",
      skills: ["Java", "Distributed Systems", "C++", "Kubernetes", "Rust"]
    },
    {
      id: "STU003",
      regNo: "22CSE089",
      name: "Rohan V. Kulkarni",
      dept: "CSE",
      sem: 6,
      sec: "B",
      cgpa: 6.84,
      attendance: 71.5,
      feesPending: 24500,
      feeStatus: "Overdue",
      backlogs: 2,
      placementStatus: "Not Eligible (Backlogs)",
      email: "rohan.kulkarni@campus360.edu",
      phone: "+91 99801 44521",
      mentor: "Prof. Arvind Trivedi",
      riskLevel: "High",
      skills: ["HTML/CSS", "JavaScript", "PHP"]
    },
    {
      id: "STU004",
      regNo: "22AID014",
      name: "Sneha Reddy",
      dept: "AI_DS",
      sem: 6,
      sec: "A",
      cgpa: 8.91,
      attendance: 89.0,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "Offered (Microsoft)",
      email: "sneha.reddy@campus360.edu",
      phone: "+91 91080 33412",
      mentor: "Dr. Meenakshi Sundaram",
      riskLevel: "Low",
      skills: ["Deep Learning", "TensorFlow", "NLP", "FastAPI"]
    },
    {
      id: "STU005",
      regNo: "22ECE055",
      name: "Vikramaditya Rao",
      dept: "ECE",
      sem: 6,
      sec: "B",
      cgpa: 7.45,
      attendance: 68.2,
      feesPending: 18000,
      feeStatus: "Partial",
      backlogs: 1,
      placementStatus: "In Process",
      email: "vikram.rao@campus360.edu",
      phone: "+91 94480 11299",
      mentor: "Dr. Venkatadri M.",
      riskLevel: "High",
      skills: ["Verilog", "Embedded C", "MATLAB", "IoT"]
    },
    {
      id: "STU006",
      regNo: "22IT033",
      name: "Pooja Hegde",
      dept: "IT",
      sem: 6,
      sec: "A",
      cgpa: 8.78,
      attendance: 91.2,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "Shortlisted (Amazon)",
      email: "pooja.hegde@campus360.edu",
      phone: "+91 88844 77123",
      mentor: "Dr. Sunita Deshpande",
      riskLevel: "Low",
      skills: ["React Native", "Node.js", "AWS", "GraphQL"]
    },
    {
      id: "STU007",
      regNo: "22MEC071",
      name: "Gaurav Sen",
      dept: "MECH",
      sem: 6,
      sec: "A",
      cgpa: 7.12,
      attendance: 74.0,
      feesPending: 35000,
      feeStatus: "Overdue",
      backlogs: 1,
      placementStatus: "In Process",
      email: "gaurav.sen@campus360.edu",
      phone: "+91 96111 20045",
      mentor: "Dr. B. R. Patil",
      riskLevel: "Medium",
      skills: ["SolidWorks", "ANSYS", "AutoCAD", "CNC"]
    },
    {
      id: "STU008",
      regNo: "22CIV029",
      name: "Divya Nambiar",
      dept: "CIVIL",
      sem: 6,
      sec: "A",
      cgpa: 8.10,
      attendance: 86.4,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "Offered (L&T Construction)",
      email: "divya.nambiar@campus360.edu",
      phone: "+91 94800 55182",
      mentor: "Dr. H. N. Suresh",
      riskLevel: "Low",
      skills: ["STAAD.Pro", "Revit", "BIM", "GIS"]
    },
    {
      id: "STU009",
      regNo: "22EEE044",
      name: "Karthik Raja",
      dept: "EEE",
      sem: 6,
      sec: "A",
      cgpa: 7.92,
      attendance: 83.1,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "In Process",
      email: "karthik.raja@campus360.edu",
      phone: "+91 90088 12399",
      mentor: "Dr. Radhika Nair",
      riskLevel: "Low",
      skills: ["Power Electronics", "Simulink", "PLC", "SCADA"]
    },
    {
      id: "STU010",
      regNo: "22CSE102",
      name: "Tanvi Bhattacharya",
      dept: "CSE",
      sem: 6,
      sec: "B",
      cgpa: 8.65,
      attendance: 88.5,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "In Process",
      email: "tanvi.bhatt@campus360.edu",
      phone: "+91 98860 99450",
      mentor: "Dr. Meenakshi Sundaram",
      riskLevel: "Low",
      skills: ["Cybersecurity", "Pen Testing", "Linux", "Python"]
    },
    {
      id: "STU011",
      regNo: "23CSE011",
      name: "Dev Patel",
      dept: "CSE",
      sem: 4,
      sec: "A",
      cgpa: 7.30,
      attendance: 69.8,
      feesPending: 12000,
      feeStatus: "Partial",
      backlogs: 1,
      placementStatus: "N/A (Pre-final)",
      email: "dev.patel@campus360.edu",
      phone: "+91 97230 44100",
      mentor: "Prof. Arvind Trivedi",
      riskLevel: "High",
      skills: ["C++", "Data Structures", "Java"]
    },
    {
      id: "STU012",
      regNo: "23AID008",
      name: "Meera Krishnan",
      dept: "AI_DS",
      sem: 4,
      sec: "A",
      cgpa: 9.15,
      attendance: 96.2,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "N/A (Pre-final)",
      email: "meera.k@campus360.edu",
      phone: "+91 98450 77011",
      mentor: "Dr. Meenakshi Sundaram",
      riskLevel: "None",
      skills: ["Python", "PyTorch", "Computer Vision", "OpenCV"]
    },
    {
      id: "STU013",
      regNo: "22CSE115",
      name: "Abhishek Varman",
      dept: "CSE",
      sem: 6,
      sec: "B",
      cgpa: 8.12,
      attendance: 82.0,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "In Process",
      email: "abhi.varman@campus360.edu",
      phone: "+91 98450 99281",
      mentor: "Dr. K. S. Raman",
      riskLevel: "Low",
      skills: ["React", "TypeScript", "Next.js", "Tailwind"]
    },
    {
      id: "STU014",
      regNo: "22CSE120",
      name: "Ishita Ganguly",
      dept: "CSE",
      sem: 6,
      sec: "A",
      cgpa: 8.98,
      attendance: 93.4,
      feesPending: 0,
      feeStatus: "Paid",
      backlogs: 0,
      placementStatus: "Shortlisted (Microsoft)",
      email: "ishita.g@campus360.edu",
      phone: "+91 98451 44556",
      mentor: "Dr. Meenakshi Sundaram",
      riskLevel: "None",
      skills: ["Go", "Distributed Systems", "Cloud", "Docker"]
    },
    {
      id: "STU015",
      regNo: "22ECE088",
      name: "Nikhil Joshi",
      dept: "ECE",
      sem: 6,
      sec: "A",
      cgpa: 6.95,
      attendance: 70.2,
      feesPending: 28000,
      feeStatus: "Overdue",
      backlogs: 2,
      placementStatus: "Not Eligible",
      email: "nikhil.j@campus360.edu",
      phone: "+91 94481 00293",
      mentor: "Dr. Venkatadri M.",
      riskLevel: "High",
      skills: ["Arduino", "Circuit Design", "C"]
    }
  ],

  facultyList: [
    {
      id: "FAC001",
      empId: "FAC-CSE-019",
      name: "Dr. Meenakshi Sundaram",
      dept: "CSE",
      designation: "Associate Professor & Head of Data Science",
      experience: "14 Years",
      qualification: "Ph.D. (IISc Bangalore), M.Tech (IIT Madras)",
      email: "m.sundaram@campus360.edu",
      phone: "+91 98450 54321",
      workload: "16 Hours/Week",
      subjects: ["Machine Learning (CS601)", "Database Systems (CS402)", "AI Lab (CS606L)"],
      attendanceRate: 98.2,
      publications: 24,
      patents: 2,
      rating: 4.8
    },
    {
      id: "FAC002",
      empId: "FAC-CSE-001",
      name: "Dr. K. S. Raman",
      dept: "CSE",
      designation: "Professor & Head of Department",
      experience: "21 Years",
      qualification: "Ph.D. (IIT Bombay)",
      email: "ks.raman@campus360.edu",
      phone: "+91 98450 11002",
      workload: "12 Hours/Week",
      subjects: ["Distributed Systems", "Advanced Algorithms"],
      attendanceRate: 99.1,
      publications: 48,
      patents: 5,
      rating: 4.9
    },
    {
      id: "FAC003",
      empId: "FAC-ECE-005",
      name: "Dr. Venkatadri M.",
      dept: "ECE",
      designation: "Professor & HOD",
      experience: "18 Years",
      qualification: "Ph.D. (NIT Surathkal)",
      email: "venkat.m@campus360.edu",
      phone: "+91 94480 33441",
      workload: "14 Hours/Week",
      subjects: ["VLSI Design", "Signals & Systems"],
      attendanceRate: 97.4,
      publications: 32,
      patents: 3,
      rating: 4.7
    },
    {
      id: "FAC004",
      empId: "FAC-IT-008",
      name: "Dr. Sunita Deshpande",
      dept: "IT",
      designation: "Associate Professor & HOD",
      experience: "15 Years",
      qualification: "Ph.D. (BITS Pilani)",
      email: "sunita.d@campus360.edu",
      phone: "+91 98860 44551",
      workload: "16 Hours/Week",
      subjects: ["Cloud Computing", "Information Security"],
      attendanceRate: 96.8,
      publications: 19,
      patents: 1,
      rating: 4.6
    },
    {
      id: "FAC005",
      empId: "FAC-MEC-012",
      name: "Dr. B. R. Patil",
      dept: "MECH",
      designation: "Professor & HOD",
      experience: "24 Years",
      qualification: "Ph.D. (IIT Kharagpur)",
      email: "br.patil@campus360.edu",
      phone: "+91 94490 66772",
      workload: "14 Hours/Week",
      subjects: ["Thermodynamics", "Robotics & Automation"],
      attendanceRate: 95.5,
      publications: 36,
      patents: 4,
      rating: 4.5
    },
    {
      id: "FAC006",
      empId: "FAC-CIV-007",
      name: "Dr. H. N. Suresh",
      dept: "CIVIL",
      designation: "Professor & HOD",
      experience: "20 Years",
      qualification: "Ph.D. (Anna University)",
      email: "hn.suresh@campus360.edu",
      phone: "+91 94800 11992",
      workload: "14 Hours/Week",
      subjects: ["Structural Analysis", "Geotechnical Engg"],
      attendanceRate: 97.0,
      publications: 28,
      patents: 2,
      rating: 4.6
    }
  ],

  timetableToday: [
    { time: "09:00 AM - 10:00 AM", subject: "Machine Learning (CS601)", faculty: "Dr. Meenakshi Sundaram", room: "LH-302", status: "Completed", isCurrent: false },
    { time: "10:05 AM - 11:05 AM", subject: "Compiler Design (CS602)", faculty: "Prof. Raghavendra", room: "LH-302", status: "Completed", isCurrent: false },
    { time: "11:20 AM - 12:20 PM", subject: "Cloud Computing & DevOps (CS603)", faculty: "Dr. Sunita Deshpande", room: "LH-304", status: "Live Now", isCurrent: true },
    { time: "01:15 PM - 02:15 PM", subject: "Applied Statistics (CS604)", faculty: "Dr. P. Swaminathan", room: "LH-302", status: "Upcoming", isCurrent: false },
    { time: "02:20 PM - 04:20 PM", subject: "AI & ML Laboratory (CS606L)", faculty: "Dr. Meenakshi & Team", room: "AI Lab-2", status: "Upcoming", isCurrent: false }
  ],

  upcomingExams: [
    { date: "Oct 12, 2026", time: "09:30 AM - 12:30 PM", subject: "CS601 - Machine Learning", type: "Mid-Term 2", room: "Exam Hall A-102" },
    { date: "Oct 14, 2026", time: "09:30 AM - 12:30 PM", subject: "CS602 - Compiler Design", type: "Mid-Term 2", room: "Exam Hall A-102" },
    { date: "Oct 16, 2026", time: "09:30 AM - 12:30 PM", subject: "CS603 - Cloud Computing & DevOps", type: "Mid-Term 2", room: "Exam Hall B-204" },
    { date: "Oct 19, 2026", time: "09:30 AM - 12:30 PM", subject: "CS604 - Applied Statistics", type: "Mid-Term 2", room: "Exam Hall A-102" },
    { date: "Oct 21, 2026", time: "09:30 AM - 12:30 PM", subject: "CS605 - Distributed Systems", type: "Mid-Term 2", room: "Exam Hall A-102" }
  ],

  placementsList: [
    {
      id: "PLC01",
      company: "Google India",
      role: "Software Engineering Intern & FTE",
      package: "₹34.5 - 44.0 LPA",
      location: "Bengaluru / Hyderabad",
      eligibility: "CGPA ≥ 8.5, No Active Backlogs, CSE/IT/AI-DS only",
      deadline: "Oct 15, 2026",
      status: "Active Drive",
      appliedCount: 142,
      shortlistedCount: 18,
      logo: "https://www.google.com/favicon.ico",
      skillsRequired: ["Data Structures", "Algorithms", "C++/Java/Go", "Distributed Systems"],
      rounds: ["Online Assessment", "Technical Round 1 (DS/Algo)", "Technical Round 2 (System Design)", "Googlyness & Leadership"]
    },
    {
      id: "PLC02",
      company: "Microsoft IDC",
      role: "Support & Software Engineer",
      package: "₹28.0 - 32.0 LPA",
      location: "Bengaluru / Noida",
      eligibility: "CGPA ≥ 8.0, Max 1 Backlog cleared",
      deadline: "Oct 20, 2026",
      status: "Active Drive",
      appliedCount: 210,
      shortlistedCount: 26,
      logo: "https://www.microsoft.com/favicon.ico",
      skillsRequired: ["Cloud Architecture", "C# / Python", "Data Structures", "OOP"],
      rounds: ["Cognitive & Coding Test", "Technical Interview 1", "Technical Interview 2", "HR Discussion"]
    },
    {
      id: "PLC03",
      company: "Amazon Development Center",
      role: "Associate SDE - AWS",
      package: "₹24.0 - 29.5 LPA",
      location: "Bengaluru / Chennai",
      eligibility: "CGPA ≥ 7.5, All Engineering Branches",
      deadline: "Oct 28, 2026",
      status: "Shortlisting",
      appliedCount: 380,
      shortlistedCount: 42,
      logo: "https://www.amazon.in/favicon.ico",
      skillsRequired: ["AWS Services", "System Design Basics", "Java", "Linux"],
      rounds: ["Online Test", "DSA Assessment", "Bar Raiser Interview"]
    },
    {
      id: "PLC04",
      company: "TCS Digital & Innovator",
      role: "Systems Engineer / Digital Cadre",
      package: "₹7.5 - 11.5 LPA",
      location: "Pan India",
      eligibility: "CGPA ≥ 6.5, All Branches",
      deadline: "Nov 05, 2026",
      status: "Registrations Open",
      appliedCount: 650,
      shortlistedCount: 0,
      logo: "https://www.tcs.com/favicon.ico",
      skillsRequired: ["Problem Solving", "SQL", "Full Stack Basics", "Aptitude"],
      rounds: ["TCS NQT National Test", "Tech Interview", "Managerial & HR"]
    },
    {
      id: "PLC05",
      company: "L&T Technology Services",
      role: "Graduate Engineer Trainee (GET)",
      package: "₹6.8 - 9.0 LPA",
      location: "Mysuru / Pune",
      eligibility: "CGPA ≥ 7.0, ECE/EEE/MECH/CIVIL",
      deadline: "Nov 10, 2026",
      status: "Registrations Open",
      appliedCount: 190,
      shortlistedCount: 0,
      logo: "https://www.ltts.com/favicon.ico",
      skillsRequired: ["Core Engineering", "CAD/Embedded", "Analytics"],
      rounds: ["Aptitude Test", "Domain Technical", "Personal Interview"]
    }
  ],

  internshipsList: [
    {
      id: "INT01",
      company: "Adobe Systems",
      role: "Research & ML Intern",
      stipend: "₹85,000 / month",
      duration: "6 Months (Jan - Jun 2027)",
      location: "Noida / Remote",
      type: "Winter/Spring Internship",
      deadline: "Oct 18, 2026",
      openings: 8,
      status: "Applications Open"
    },
    {
      id: "INT02",
      company: "Texas Instruments",
      role: "Analog & Embedded Systems Intern",
      stipend: "₹65,000 / month",
      duration: "6 Months",
      location: "Bengaluru",
      type: "Core ECE/EEE",
      deadline: "Oct 24, 2026",
      openings: 12,
      status: "Applications Open"
    },
    {
      id: "INT03",
      company: "Morgan Stanley",
      role: "Technology Analyst Intern",
      stipend: "₹75,000 / month",
      duration: "2 Months (Summer 2027)",
      location: "Mumbai / Bengaluru",
      type: "Summer Analyst",
      deadline: "Nov 02, 2026",
      openings: 15,
      status: "Reviewing Profiles"
    }
  ],

  complaintsList: [
    {
      id: "TKT-2026-882",
      category: "IT & Network",
      subject: "WiFi connectivity down in Ramanujan Hostel 3rd Floor",
      submittedBy: "Aarav Sharma (22CSE042)",
      deptAssigned: "Campus IT Services",
      priority: "HIGH",
      status: "IN PROGRESS",
      createdDate: "2026-09-30",
      resolutionEta: "2026-10-02",
      timeline: [
        { time: "2026-09-30 08:30 PM", note: "Ticket logged by student." },
        { time: "2026-10-01 09:15 AM", note: "Assigned to Network Eng. S. Suresh. Replaced AP switch." }
      ]
    },
    {
      id: "TKT-2026-879",
      category: "Infrastructure",
      subject: "Projector flickering in Seminar Hall 2",
      submittedBy: "Dr. Meenakshi Sundaram",
      deptAssigned: "Estate & AV Maintenance",
      priority: "MEDIUM",
      status: "RESOLVED",
      createdDate: "2026-09-28",
      resolutionEta: "2026-09-29",
      timeline: [
        { time: "2026-09-28 11:00 AM", note: "Reported by faculty before guest lecture." },
        { time: "2026-09-29 02:00 PM", note: "HDMI cable and lamp ballast replaced. Tested OK." }
      ]
    },
    {
      id: "TKT-2026-874",
      category: "Academic",
      subject: "Discrepancy in Mid-Term 1 Marks entry for Compiler Design",
      submittedBy: "Rohan V. Kulkarni (22CSE089)",
      deptAssigned: "CSE Examination Cell",
      priority: "MEDIUM",
      status: "RESOLVED",
      createdDate: "2026-09-25",
      resolutionEta: "2026-09-27",
      timeline: [
        { time: "2026-09-25 10:00 AM", note: "Re-evaluation requested." },
        { time: "2026-09-27 04:30 PM", note: "Marks updated from 18/30 to 22/30 in ERP." }
      ]
    },
    {
      id: "TKT-2026-890",
      category: "Hostel & Mess",
      subject: "Water heater thermostat faulty in Block B-Wing",
      submittedBy: "Vikramaditya Rao (22ECE055)",
      deptAssigned: "Hostel Administration",
      priority: "LOW",
      status: "OPEN",
      createdDate: "2026-10-01",
      resolutionEta: "2026-10-03",
      timeline: [
        { time: "2026-10-01 07:00 AM", note: "Ticket acknowledged by hostel warden." }
      ]
    }
  ],

  announcementsList: [
    {
      id: "ANN01",
      title: "Google & Microsoft Campus Placement Drive Registration",
      category: "Placement",
      date: "Oct 01, 2026",
      urgent: true,
      author: "Placement Cell (Ms. Priya Deshmukh)",
      summary: "Eligible 2027 graduating batch students must register on the Campus360 placement portal before Oct 15 with updated resumes."
    },
    {
      id: "ANN02",
      title: "Mid-Term 2 Examination Schedule Published",
      category: "Academic",
      date: "Sep 29, 2026",
      urgent: false,
      author: "Controller of Examinations",
      summary: "Mid-Term 2 examinations for all B.Tech/M.Tech semesters will commence from October 12, 2026. Hall tickets available in Document section."
    },
    {
      id: "ANN03",
      title: "Hack360 - National 36-Hour Hackathon Registrations Open",
      category: "Events",
      date: "Sep 27, 2026",
      urgent: false,
      author: "Innovate360 Tech Club",
      summary: "Total prize pool of ₹3,00,000. Grand finale on Nov 6-7, 2026. Register teams of 3-4 members."
    },
    {
      id: "ANN04",
      title: "Semester Fee Payment Deadline without Fine - Oct 25",
      category: "Finance",
      date: "Sep 25, 2026",
      urgent: true,
      author: "Accounts & Finance Office",
      summary: "Students with outstanding dues are advised to complete payment via the Fee module or net banking to avoid late fee penalties."
    }
  ],

  eventsAndClubs: [
    {
      id: "EVT01",
      title: "Hack360: National Smart Campus AI Hackathon",
      club: "Innovate360 & IEEE Student Branch",
      date: "Nov 06 - Nov 07, 2026",
      venue: "Main Auditorium & Computing Center",
      prize: "₹3,00,000 Cash Pool + Cloud Credits",
      registeredCount: 340,
      banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&auto=format&fit=crop&q=80",
      status: "Registrations Open"
    },
    {
      id: "EVT02",
      title: "Tarang 2026 - Inter-Collegiate Cultural Extravaganza",
      club: "Fine Arts & Music Club",
      date: "Nov 20 - Nov 22, 2026",
      venue: "Open Air Amphitheatre",
      prize: "Trophies + ₹1,50,000",
      registeredCount: 680,
      banner: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
      status: "Auditions Ongoing"
    },
    {
      id: "EVT03",
      title: "Workshop on Generative AI & LLMs in Production",
      club: "Data Science Society",
      date: "Oct 18, 2026",
      venue: "Seminar Hall 1",
      speaker: "Principal AI Scientist, Microsoft Research",
      registeredCount: 160,
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
      status: "Housefull"
    }
  ],

  libraryCatalog: [
    { isbn: "978-0134685991", title: "Effective Java (3rd Edition)", author: "Joshua Bloch", category: "Computer Science", totalCopies: 15, available: 4, rack: "CS-Rack-04" },
    { isbn: "978-0262035613", title: "Deep Learning (Adaptive Computation)", author: "Ian Goodfellow, Yoshua Bengio", category: "Artificial Intelligence", totalCopies: 20, available: 6, rack: "AI-Rack-01" },
    { isbn: "978-0132350884", title: "Clean Code: A Handbook of Agile Craftsmanship", author: "Robert C. Martin", category: "Software Engineering", totalCopies: 12, available: 2, rack: "CS-Rack-02" },
    { isbn: "978-0070147379", title: "Introduction to Algorithms (CLRS)", author: "Cormen, Leiserson, Rivest, Stein", category: "Computer Science", totalCopies: 35, available: 8, rack: "CS-Rack-01" },
    { isbn: "978-0134494166", title: "Computer Networking: A Top-Down Approach", author: "Kurose & Ross", category: "Networking", totalCopies: 18, available: 5, rack: "IT-Rack-03" }
  ],

  issuedBooks: [
    { title: "Deep Learning", isbn: "978-0262035613", issueDate: "2026-09-18", dueDate: "2026-10-18", status: "Active", fine: 0 },
    { title: "Computer Networking", isbn: "978-0134494166", issueDate: "2026-09-10", dueDate: "2026-10-10", status: "Active", fine: 0 }
  ],

  hostelDetails: {
    blocks: [
      { name: "Aryabhata Hostel (Boys - Seniors)", totalRooms: 240, occupied: 232, warden: "Prof. S. R. Hegde", contact: "Ext 401" },
      { name: "Bhaskara Hostel (Boys - Juniors)", totalRooms: 200, occupied: 194, warden: "Dr. K. N. Murthy", contact: "Ext 402" },
      { name: "Gargi Hostel (Girls Block 1)", totalRooms: 260, occupied: 254, warden: "Dr. Pratibha Rao", contact: "Ext 403" },
      { name: "Maitreyi Hostel (Girls Block 2)", totalRooms: 180, occupied: 172, warden: "Prof. Deepa V.", contact: "Ext 404" }
    ],
    studentRoom: {
      student: "Aarav Sharma",
      block: "Aryabhata Hostel",
      room: "412",
      type: "Double Occupancy (AC)",
      roommate: "Rohan Kulkarni (22CSE089)",
      messPlan: "Special South & North Combo",
      dues: 0
    }
  },

  districtLandmarks: [
    { name: "KLR College of Engg & Tech (Campus)", lat: 17.5968, lng: 80.6865, type: "campus", icon: "fa-graduation-cap", color: "#06b6d4" },
    { name: "Sri Sita Ramachandra Swamy Temple (Bhadrachalam)", lat: 17.6688, lng: 80.8936, type: "landmark", icon: "fa-place-of-worship", color: "#f59e0b" },
    { name: "Godavari River Bridge (Bhadrachalam)", lat: 17.6620, lng: 80.8870, type: "river", icon: "fa-water", color: "#0ea5e9" },
    { name: "KTPS (Kothagudem Thermal Power Station)", lat: 17.5810, lng: 80.6710, type: "power", icon: "fa-bolt", color: "#ef4444" },
    { name: "Singareni Collieries Coal Headquarter", lat: 17.5510, lng: 80.6186, type: "industry", icon: "fa-gem", color: "#8b5cf6" },
    { name: "Kinnerasani Dam & Wildlife Sanctuary", lat: 17.6830, lng: 80.6620, type: "nature", icon: "fa-tree", color: "#10b981" },
    { name: "ITC Paperboards & Specialty Papers (Sarapaka)", lat: 17.6530, lng: 80.8520, type: "industry", icon: "fa-industry", color: "#64748b" }
  ],

  transportRoutes: [
    {
      routeNo: "R01",
      name: "Kothagudem - Rudrampur - Navabharat - KLR Campus",
      busNo: "TS-28-U-1008",
      driver: "B. Venkateswarlu",
      driverPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      contact: "+91 98480 22101",
      capacity: 55,
      assigned: 52,
      fuelLevel: "78%",
      engineHealth: "Optimal (98%)",
      currentLocation: "Rudrampur X-Roads",
      currentCoords: [17.5750, 80.6480],
      heading: 42,
      speed: "44 km/h",
      speedKmh: 44,
      status: "LIVE ON ROUTE",
      nextStop: "Paloncha Town Center",
      etaNextStop: "4 Mins",
      delay: "On Time (0 min)",
      gpsSignal: "Strong (4G LTE • 5 satellites)",
      routeColor: "#2563eb",
      stops: [
        { name: "Kothagudem Bus Stand", time: "7:15 AM", passed: true, lat: 17.5510, lng: 80.6186, boarded: 18 },
        { name: "Rudrampur Cross", time: "7:35 AM", passed: true, lat: 17.5750, lng: 80.6480, boarded: 14 },
        { name: "Paloncha Town Center", time: "7:55 AM", passed: false, isNext: true, lat: 17.5920, lng: 80.6750, boarded: 12 },
        { name: "Navabharat Circle", time: "8:10 AM", passed: false, lat: 17.5945, lng: 80.6810, boarded: 8 },
        { name: "KLR Campus Main Gate", time: "8:25 AM", passed: false, lat: 17.5968, lng: 80.6865, boarded: 0 }
      ],
      waypoints: [
        [17.5510, 80.6186],
        [17.5580, 80.6270],
        [17.5680, 80.6390],
        [17.5750, 80.6480],
        [17.5830, 80.6600],
        [17.5920, 80.6750],
        [17.5945, 80.6810],
        [17.5968, 80.6865]
      ],
      passengers: [
        { name: "Aarav Sharma", regNo: "22CSE042", stop: "Rudrampur Cross", status: "Boarded (7:34 AM)" },
        { name: "Sneha Reddy", regNo: "22AID014", stop: "Paloncha Town Center", status: "Waiting at Stop" },
        { name: "Rohan V. Kulkarni", regNo: "22CSE089", stop: "Kothagudem Bus Stand", status: "Boarded (7:14 AM)" },
        { name: "Pooja Hegde", regNo: "22IT033", stop: "Navabharat Circle", status: "Waiting at Stop" }
      ]
    },
    {
      routeNo: "R02",
      name: "Yellandu - Sujatha Nagar - Paloncha - KLR Campus",
      busNo: "TS-28-U-1014",
      driver: "K. Mohan Rao",
      driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      contact: "+91 99890 33412",
      capacity: 55,
      assigned: 50,
      fuelLevel: "82%",
      engineHealth: "Optimal (95%)",
      currentLocation: "Sujatha Nagar Bypass",
      currentCoords: [17.5780, 80.4850],
      heading: 85,
      speed: "38 km/h",
      speedKmh: 38,
      status: "LIVE ON ROUTE",
      nextStop: "Kothagudem Bypass",
      etaNextStop: "7 Mins",
      delay: "On Time",
      gpsSignal: "Strong (4G LTE)",
      routeColor: "#10b981",
      stops: [
        { name: "Yellandu Center", time: "7:00 AM", passed: true, lat: 17.6002, lng: 80.3340, boarded: 22 },
        { name: "Sujatha Nagar", time: "7:30 AM", passed: true, lat: 17.5780, lng: 80.4850, boarded: 16 },
        { name: "Kothagudem Bypass", time: "7:50 AM", passed: false, isNext: true, lat: 17.5620, lng: 80.6050, boarded: 8 },
        { name: "Paloncha Bus Depot", time: "8:10 AM", passed: false, lat: 17.5890, lng: 80.6720, boarded: 4 },
        { name: "KLR Campus Main Gate", time: "8:25 AM", passed: false, lat: 17.5968, lng: 80.6865, boarded: 0 }
      ],
      waypoints: [
        [17.6002, 80.3340],
        [17.5910, 80.3950],
        [17.5840, 80.4420],
        [17.5780, 80.4850],
        [17.5690, 80.5500],
        [17.5620, 80.6050],
        [17.5890, 80.6720],
        [17.5968, 80.6865]
      ],
      passengers: [
        { name: "Vikramaditya Rao", regNo: "22ECE055", stop: "Yellandu Center", status: "Boarded (6:58 AM)" },
        { name: "Meera Krishnan", regNo: "22CSE102", stop: "Sujatha Nagar", status: "Boarded (7:29 AM)" }
      ]
    },
    {
      routeNo: "R03",
      name: "Manuguru - Burgampahad - Bhadrachalam - KLR Campus",
      busNo: "TS-28-U-1022",
      driver: "M. Nageswara Rao",
      driverPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      contact: "+91 94401 88290",
      capacity: 55,
      assigned: 54,
      fuelLevel: "65%",
      engineHealth: "Optimal (92%)",
      currentLocation: "Bhadrachalam Bridge",
      currentCoords: [17.6620, 80.8870],
      heading: 215,
      speed: "52 km/h",
      speedKmh: 52,
      status: "LIVE ON ROUTE",
      nextStop: "Sarapaka Junction",
      etaNextStop: "3 Mins",
      delay: "2 Mins Early",
      gpsSignal: "Strong (4G LTE)",
      routeColor: "#8b5cf6",
      stops: [
        { name: "Manuguru Main St.", time: "6:45 AM", passed: true, lat: 17.9860, lng: 80.7420, boarded: 20 },
        { name: "Bhadrachalam Bridge", time: "7:25 AM", passed: true, lat: 17.6620, lng: 80.8870, boarded: 18 },
        { name: "Sarapaka Junction", time: "7:45 AM", passed: false, isNext: true, lat: 17.6530, lng: 80.8520, boarded: 11 },
        { name: "Paloncha Toll Gate", time: "8:05 AM", passed: false, lat: 17.6120, lng: 80.7100, boarded: 5 },
        { name: "KLR Campus Main Gate", time: "8:25 AM", passed: false, lat: 17.5968, lng: 80.6865, boarded: 0 }
      ],
      waypoints: [
        [17.9860, 80.7420],
        [17.8420, 80.7950],
        [17.7210, 80.8540],
        [17.6620, 80.8870],
        [17.6530, 80.8520],
        [17.6470, 80.8120],
        [17.6120, 80.7100],
        [17.5968, 80.6865]
      ],
      passengers: [
        { name: "Ananya Iyer", regNo: "22CSE018", stop: "Bhadrachalam Bridge", status: "Boarded (7:24 AM)" },
        { name: "Kiran Sai", regNo: "22MEC009", stop: "Sarapaka Junction", status: "Waiting at Stop" }
      ]
    },
    {
      routeNo: "R04",
      name: "Ashwaraopeta - Dammapeta - Sathupalli - KLR Campus",
      busNo: "TS-28-U-1035",
      driver: "P. Rambabu",
      driverPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      contact: "+91 91008 44299",
      capacity: 55,
      assigned: 48,
      fuelLevel: "70%",
      engineHealth: "Optimal (97%)",
      currentLocation: "Sathupalli X-Road",
      currentCoords: [17.2150, 80.8320],
      heading: 330,
      speed: "46 km/h",
      speedKmh: 46,
      status: "LIVE ON ROUTE",
      nextStop: "Chintoor Junction",
      etaNextStop: "8 Mins",
      delay: "On Time",
      gpsSignal: "Strong (4G LTE)",
      routeColor: "#f59e0b",
      stops: [
        { name: "Ashwaraopeta", time: "6:30 AM", passed: true, lat: 17.2450, lng: 81.1340, boarded: 15 },
        { name: "Dammapeta", time: "7:00 AM", passed: true, lat: 17.2650, lng: 80.9520, boarded: 14 },
        { name: "Sathupalli X-Road", time: "7:35 AM", passed: true, lat: 17.2150, lng: 80.8320, boarded: 12 },
        { name: "Chintoor Junction", time: "8:00 AM", passed: false, isNext: true, lat: 17.4200, lng: 80.7500, boarded: 7 },
        { name: "KLR Campus Main Gate", time: "8:25 AM", passed: false, lat: 17.5968, lng: 80.6865, boarded: 0 }
      ],
      waypoints: [
        [17.2450, 81.1340],
        [17.2650, 80.9520],
        [17.2150, 80.8320],
        [17.3400, 80.7900],
        [17.4200, 80.7500],
        [17.5200, 80.7100],
        [17.5968, 80.6865]
      ],
      passengers: [
        { name: "Divya Prakash", regNo: "22EEE021", stop: "Sathupalli X-Road", status: "Boarded (7:33 AM)" }
      ]
    }
  ],

  feeLedger: {
    totalFee: 145000,
    paidFee: 145000,
    pendingFee: 0,
    scholarship: 25000,
    scholarshipName: "Merit Academic Excellence Grant",
    transactions: [
      { id: "TXN-884192", date: "2026-07-20", amount: 120000, type: "Online (Razorpay UPI)", component: "Tuition & Lab Fee (Sem 6)", status: "Success", receipt: "RCP-2026-0841" },
      { id: "TXN-884193", date: "2026-07-20", amount: 25000, type: "Institutional Credit", component: "Merit Scholarship Adjustment", status: "Success", receipt: "RCP-2026-0842" }
    ]
  },

  institutionFinancials: {
    totalTuitionBilled: "₹54.20 Crore",
    totalCollected: "₹49.80 Crore (91.88%)",
    outstandingAmount: "₹4.40 Crore",
    scholarshipsAwarded: "₹3.85 Crore (412 Students)",
    annualOperationalBudget: "₹38.50 Crore"
  },

  documentsCatalog: [
    { id: "DOC01", title: "Semester 5 Official Grade Card", type: "Marksheet", issueDate: "Jan 14, 2026", status: "Verified", format: "PDF", size: "1.2 MB" },
    { id: "DOC02", title: "Institutional Bonafide Certificate", type: "Bonafide", issueDate: "Aug 02, 2026", status: "Approved", format: "PDF", size: "450 KB" },
    { id: "DOC03", title: "Mid-Term 2 Examination Hall Ticket", type: "Hall Ticket", issueDate: "Oct 01, 2026", status: "Ready for Download", format: "PDF", size: "820 KB" },
    { id: "DOC04", title: "Digital Student ID Card (Smart NFC Enabled)", type: "Identity", issueDate: "Aug 01, 2024", status: "Active", format: "PDF/PKPASS", size: "640 KB" },
    { id: "DOC05", title: "Merit Scholarship Sanction Order", type: "Financial", issueDate: "Jul 22, 2026", status: "Sanctioned", format: "PDF", size: "380 KB" }
  ],

  aiAgentsConfig: [
    {
      id: "student_advisor",
      name: "Student Advisor Agent",
      badge: "Academic Mentorship",
      icon: "fa-graduation-cap",
      color: "#2563EB",
      desc: "Personalized student support analyzing attendance risk, subject bottlenecks, grade trajectory, and personalized remediation roadmaps.",
      capabilities: [
        "Attendance forecast & mitigation",
        "Exam readiness scoring",
        "Personalized study timetables",
        "Faculty mentor consultation routing"
      ],
      sampleQuery: "I missed 3 statistics classes. How do I maintain 75% eligibility?"
    },
    {
      id: "academic_agent",
      name: "Academic Curriculum Agent",
      badge: "Course & Timetable",
      icon: "fa-book-open",
      color: "#0D9488",
      desc: "Analyzes curriculum coverage, class scheduling clashes, elective demand forecasting, and syllabus progress across all semesters.",
      capabilities: [
        "Timetable clash detection",
        "Syllabus completion audit",
        "Elective quota balancing",
        "Continuous internal assessment tracking"
      ],
      sampleQuery: "Show syllabus completion percentage across all 6th-semester CSE subjects."
    },
    {
      id: "performance_analyst",
      name: "Performance Analyst Agent",
      badge: "Predictive Analytics",
      icon: "fa-chart-line",
      color: "#7C3AED",
      desc: "Applies statistical regressions and machine learning to identify at-risk students before semester exams, predicting CGPA and backlogs.",
      capabilities: [
        "Early academic risk detection",
        "Grade trend regression",
        "Subject failure probability",
        "Department-level performance benchmarks"
      ],
      sampleQuery: "Identify all students with >40% probability of backlog in CS604 Statistics."
    },
    {
      id: "career_agent",
      name: "Career & Skill Roadmap Agent",
      badge: "Career Development",
      icon: "fa-compass",
      color: "#EA580C",
      desc: "Evaluates student Github/projects, coding profiles, and course electives to chart individualized learning pathways for top product roles.",
      capabilities: [
        "Automated resume parsing",
        "Target role skill-gap analysis",
        "Recommended MOOCs & micro-certifications",
        "Project portfolio grading"
      ],
      sampleQuery: "What skills does Aarav need to qualify for Google SDE-1 role?"
    },
    {
      id: "placement_agent",
      name: "Placement Matcher & TPO Agent",
      badge: "Corporate Relations",
      icon: "fa-briefcase",
      color: "#059669",
      desc: "Matches student profiles against company eligibility matrix, schedules rounds, tracks offers, and predicts placement conversions.",
      capabilities: [
        "Automated JD-to-Student matching",
        "Company interview questions bank",
        "Placement drive conversion forecasting",
        "Package tier distribution analytics"
      ],
      sampleQuery: "List all CSE students eligible for Microsoft drive with CGPA >= 8.5."
    },
    {
      id: "finance_agent",
      name: "Finance & Fee Recovery Agent",
      badge: "Accounts & Budget",
      icon: "fa-receipt",
      color: "#D97706",
      desc: "Monitors fee payment cycles, predicts default probabilities, automates polite reminders, and reconciles scholarships.",
      capabilities: [
        "Fee collection probability scoring",
        "Automated installment scheduler",
        "Scholarship fund allocation audit",
        "Department revenue vs budget variance"
      ],
      sampleQuery: "What is the total fee outstanding for 3rd year engineering students?"
    },
    {
      id: "admin_agent",
      name: "Campus Administration Agent",
      badge: "Operations & Governance",
      icon: "fa-building-columns",
      color: "#4F46E5",
      desc: "Executive decision support synthesizing institutional metrics across admissions, faculty workloads, campus assets, and accreditations.",
      capabilities: [
        "NAAC/NIRF metrics aggregator",
        "Faculty workload optimizer",
        "Campus asset utilization audit",
        "Cross-department KPI comparisons"
      ],
      sampleQuery: "Generate NIRF Student-Faculty Ratio and NAAC criteria summary."
    },
    {
      id: "complaint_agent",
      name: "Smart Grievance Dispatcher",
      badge: "Grievance & Ops",
      icon: "fa-headset",
      color: "#DC2626",
      desc: "Natural language triage of student & faculty tickets with automated urgency scoring, SLA monitoring, and department routing.",
      capabilities: [
        "NLP ticket sentiment & severity tagging",
        "Automatic SLA breach escalation",
        "Repeated infrastructure defect cluster detection",
        "Grievance resolution satisfaction analytics"
      ],
      sampleQuery: "Summarize unresolved high-priority hostel and IT complaints."
    }
  ]
};

// Export to window
if (typeof window !== 'undefined') {
  window.CAMPUS_DATA = CAMPUS_DATA;
}
