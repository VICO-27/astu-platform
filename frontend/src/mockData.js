// ASTU Platform Mock Data Layer

// 1. Announcements (Left Panel scrolling ads/announcements)
export const mockAnnouncements = [
  {
    id: 1,
    name: "Dr. Aster Kebede",
    role: "Pre-Engineering Dean",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    description: "Welcome fresh students to Adama Science & Technology University! Fresh orientation will take place on June 8 in the main auditorium."
  },
  {
    id: 2,
    name: "ASTU Hackathon Club",
    role: "Student Organization",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    description: "Registration for ASTU Annual Hackathon 2026 is now open! Build projects, win cash prizes, and get mentorship. Link in portal."
  },
  {
    id: 3,
    name: "Library Administration",
    role: "Official Notice",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    description: "The digital library has been upgraded. Access 10,000+ new research papers, IEEE journals, and course-specific lecture notes."
  },
  {
    id: 4,
    name: "Abebe Bikila",
    role: "Software Engineering Student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    description: "Looking for 2 team members (React developer and UI designer) for our Database Management Course project. Ping me on Project workspace!"
  },
  {
    id: 5,
    name: "Registrar Office",
    role: "Important Update",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    description: "Deadline for Semester II course drop/add forms is set for Friday, June 12. Submit your forms online through the official portal."
  }
];

// Duplicate list for a truly seamless infinite marquee loop scroll
export const scrollingAnnouncements = [...mockAnnouncements, ...mockAnnouncements, ...mockAnnouncements];

// 2. ASTU Departments Showcase (Category A - Engineering, Category B - Applied Science)
// Local video path strings are mapped so the user can easily swap emojis/images with local MP4 clips.
// I also provide a high-quality stock video URL as a placeholder so it works out of the box.
export const mockDepartments = [
  // Category A - Engineering
  {
    id: "cse",
    name: "Computer Science & Engineering",
    code: "CSE",
    category: "Engineering",
    description: "Fostering excellence in computing, algorithms, artificial intelligence, software engineering, and hardware systems architecture.",
    videoUrl: "/videos/cse.mp4",
    localVideoPath: "/videos/cse.mp4",
    icon: "💻"
  },
  {
    id: "ece",
    name: "Electrical & Computer Engineering",
    code: "ECE",
    category: "Engineering",
    description: "Innovating in power systems, telecommunications, signal processing, and micro-electronics engineering.",
    videoUrl: "/videos/cse.mp4",
    localVideoPath: "/videos/cse.mp4",
    icon: "🔌"
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    code: "MECH",
    category: "Engineering",
    description: "Driving the future of robotics, thermal systems, automotive engineering, and automated industrial manufacturing processes.",
    videoUrl: "/videos/mech.mp4",
    localVideoPath: "/videos/mech.mp4",
    icon: "⚙️"
  },
  {
    id: "civil",
    name: "Civil Engineering",
    code: "CIVIL",
    category: "Engineering",
    description: "Designing and building sustainable infrastructure, seismic-resilient structures, and smart urban transport systems.",
    videoUrl: "/videos/civil.mp4",
    localVideoPath: "/videos/civil.mp4",
    icon: "🏗️"
  },
  {
    id: "chem",
    name: "Chemical Engineering",
    code: "CHEM",
    category: "Engineering",
    description: "Transforming raw materials into valuable products using advanced chemical processes, thermodynamics, and bio-processing.",
    videoUrl: "/videos/pharma.mp4",
    localVideoPath: "/videos/pharma.mp4",
    icon: "🧪"
  },
  {
    id: "se",
    name: "Software Engineering",
    code: "SE",
    category: "Engineering",
    description: "Specializing in large-scale software engineering, agile methodologies, mobile apps, and full-stack web platforms.",
    videoUrl: "/videos/cse.mp4",
    localVideoPath: "/videos/cse.mp4",
    icon: "📱"
  },
  // Category B - Applied Science
  {
    id: "physics",
    name: "Physics",
    code: "PHYS",
    category: "Applied Science",
    description: "Exploring the fundamental laws of nature, materials science, quantum mechanics, and nanotechnology applications.",
    videoUrl: "/videos/math.mp4",
    localVideoPath: "/videos/math.mp4",
    icon: "⚛️"
  },
  {
    id: "chemistry",
    name: "Chemistry",
    code: "CHEM-SCI",
    category: "Applied Science",
    description: "Investigating organic synthesis, electrochemistry, molecular modeling, and environment-friendly chemistry processes.",
    videoUrl: "/videos/pharma.mp4",
    localVideoPath: "/videos/pharma.mp4",
    icon: "⚗️"
  },
  {
    id: "maths",
    name: "Mathematics",
    code: "MATH",
    category: "Applied Science",
    description: "Unraveling complex problems through mathematical modeling, cryptography, operations research, and statistical analytics.",
    videoUrl: "/videos/math.mp4",
    localVideoPath: "/videos/math.mp4",
    icon: "🔢"
  },
  {
    id: "biotech",
    name: "Biotechnology",
    code: "BIOTECH",
    category: "Applied Science",
    description: "Applying biological engineering concepts to medicine, agricultural crop resilience, genetics, and pharmaceutical research.",
    videoUrl: "/videos/pharma.mp4",
    localVideoPath: "/videos/pharma.mp4",
    icon: "🧬"
  }
];

// 3. Courses and Materials list for search index autocomplete
export const mockCourses = [
  { id: "cse-3021", name: "Introduction to Artificial Intelligence", code: "CSE3021", dept: "Computer Science & Engineering", year: 3, sem: 1 },
  { id: "cse-3122", name: "Database Management Systems", code: "CSE3122", dept: "Computer Science & Engineering", year: 3, sem: 1 },
  { id: "cse-4011", name: "Software Architecture & Design Patterns", code: "CSE4011", dept: "Computer Science & Engineering", year: 4, sem: 1 },
  { id: "ece-2022", name: "Network Theory & Circuit Analysis", code: "ECE2022", dept: "Electrical & Computer Engineering", year: 2, sem: 2 },
  { id: "ece-3221", name: "Principles of Digital Communications", code: "ECE3221", dept: "Electrical & Computer Engineering", year: 3, sem: 1 },
  { id: "mech-2111", name: "Engineering Mechanics: Statics & Dynamics", code: "MECH2111", dept: "Mechanical Engineering", year: 2, sem: 1 },
  { id: "mech-3312", name: "Introduction to Fluid Dynamics", code: "MECH3312", dept: "Mechanical Engineering", year: 3, sem: 2 },
  { id: "phys-1011", name: "General Physics I", code: "PHYS1011", dept: "Physics", year: 1, sem: 1 },
  { id: "math-2011", name: "Applied Mathematics I", code: "MATH2011", dept: "Mathematics", year: 2, sem: 1 },
  { id: "biotech-3012", name: "Genetics and Molecular Biology", code: "BIOTECH3012", dept: "Biotechnology", year: 3, sem: 2 }
];

export const mockMaterials = [
  { id: "m-1", title: "Lecture Slides: Neural Networks Fundamentals", type: "pdf", course: "Introduction to Artificial Intelligence", downloads: 142 },
  { id: "m-2", title: "SQL Lab Assignment: Joins & Relational Algebra", type: "pdf", course: "Database Management Systems", downloads: 98 },
  { id: "m-3", title: "YouTube: Understanding Design Patterns", type: "youtube", course: "Software Architecture & Design Patterns", downloads: 204 },
  { id: "m-4", title: "Reference Book: Fluid Mechanics 8th Edition", type: "pdf", course: "Introduction to Fluid Dynamics", downloads: 350 },
  { id: "m-5", title: "Assignment: Multi-variable Calculus Solutions", type: "markdown", course: "Applied Mathematics I", downloads: 182 }
];

// Helper search index
export const searchIndex = [
  ...mockDepartments.map(d => ({ type: "Department", name: d.name, code: d.code, link: `/courses?dept=${d.id}` })),
  ...mockCourses.map(c => ({ type: "Course", name: c.name, code: c.code, link: `/courses?course=${c.id}` })),
  ...mockMaterials.map(m => ({ type: "Material", name: m.title, code: m.type.toUpperCase(), link: `/materials?id=${m.id}` }))
];

// 4. Mock AI Answers for the Home Page chatbot
export const getMockAIResponse = (query) => {
  const q = query.toLowerCase();
  
  if (q.includes("hackathon")) {
    return "The ASTU Annual Hackathon 2026 is scheduled for June 12-14. Registration is open to all engineering and applied science students. You can team up with up to 4 members. The prizes include 50,000 ETB for 1st place, internship opportunities, and cloud credits!";
  }
  
  if (q.includes("course") || q.includes("register") || q.includes("enroll")) {
    return "To register or view your courses on the ASTU Platform, make sure you log in with your university-linked Google Account. The platform will automatically load your department, academic year, and current semester, displaying a personalized dashboard matching the ASTU syllabus.";
  }
  
  if (q.includes("library") || q.includes("books")) {
    return "ASTU's digital library portal offers free access to IEEE journals, ACM Digital Library, and thousands of textbooks. You can find reference materials directly in the **Materials** section on this platform or by visiting the physical library near the main registrar building.";
  }

  if (q.includes("cse") || q.includes("computer science")) {
    return "The Computer Science & Engineering (CSE) department is one of ASTU's elite departments, offering tracks in Software Engineering, Artificial Intelligence, and Computer Networks. It features hands-on labs and is situated in the Engineering Block.";
  }

  if (q.includes("material") || q.includes("pdf") || q.includes("download")) {
    return "You can download lecture notes, lab sheets, and past exams from the **Materials** page. Simply search by course name or filter by Department, Year, and Semester. You can preview them in-browser or download them to study offline.";
  }
  
  // Default response
  return `Adama Science and Technology University (ASTU) is a premier technology university in Ethiopia. 

Based on your question: "${query}", here is some guidance:
- You can navigate to **Courses** to access interactive study content and get chapter-level AI assistance.
- Use **Jump On** in the navbar to quickly switch to **Projects** (the Kanban board and team workspace) or **Materials** (the download center).
- For official administrative requests, you can click on the **Account** menu and select **Portal** to open the official ASTU Registrar Portal.

Feel free to ask me about specific departments, syllabus queries, or technical features of this platform!`;
};
