// FAQ data for the CareerAgent application
const FAQ_DATA = {
  /* ─────────────────────────────── */
  "Getting Started": [
    {
      question: "How do I reach the login or registration screen?",
      answer: "Click the \"Get Started\" button on the landing page. You will arrive at the Authentication page where the Login card is shown first and a Register button is available at the bottom.",
      open: false
    },
    {
      question: "Which user type should I pick during login or sign-up?",
      answer: "Choose \"Recruiter\" if you post and manage job listings. Choose \"Job Candidate\" (Job Seeker) if you apply to positions and use CV tools.",
      open: false
    },
    {
      question: "What happens if I exit the registration flow before verifying my email?",
      answer: "Your account remains in a limited, unverified state. You can return to the Verify page anytime; request a fresh 6-digit code if the previous one expired after 60 seconds.",
      open: false
    },
    {
      question: "Why did I receive a Secret PIN right after signing up?",
      answer: "The 6-digit Secret PIN unblocks your account after seven failed log-in attempts and is needed for the Forgot-Password flow. It is displayed once and auto-downloaded as a .txt file for safekeeping.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "Account & Security": [
    {
      question: "What are the exact password rules on CareerAgent?",
      answer: "A valid password must contain at least eight characters, one uppercase letter, one lowercase letter, one number, and one special symbol (e.g. !, @, #).",
      open: false
    },
    {
      question: "I failed my password seven times—what now?",
      answer: "Your account is locked until you enter the Secret PIN you received during registration. After entering the correct PIN you regain seven new attempts.",
      open: false
    },
    {
      question: "Can I turn on Two-Factor Authentication for every login?",
      answer: "At present, two-factor authentication is required only once—during the email-verification step of registration—to keep daily logins fast and simple.",
      open: false
    },
    {
      question: "Is it possible to change my registered email address later?",
      answer: "No. The e-mail address is permanent. To move to a new address you must open a new account or email support (careeragentpro@gmail.com).",
      open: false
    },
    {
      question: "What is removed when I delete my account?",
      answer: "All personal data, CV files, chats, job applications, and analytics are permanently erased from the database. The action is irreversible.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "Recruiter – Posting & Managing Jobs": [
    {
      question: "How do I create a new job post?",
      answer: "On the Recruiter Dashboard click \"➕ Post New Job\". Enter a free-text description—or dictate it—and press \"Create Job Listing\". If mandatory fields are missing, a Fill-Missing-Fields form will appear until job role, location, experience level, job type, and remote option are provided.",
      open: false
    },
    {
      question: "Why does the system edit my job-title wording automatically?",
      answer: "CareerAgent's AI normalises titles for consistency (e.g. \"fullstack\" → \"Full Stack Developer\") so candidates see uniform search results.",
      open: false
    },
    {
      question: "Where can I view everyone who applied to a single listing?",
      answer: "On the Dashboard locate the listing and click its \"Applicants\" button. A side panel shows each candidate's profile, links to CV, LinkedIn and GitHub, plus buttons to chat or track that applicant.",
      open: false
    },
    {
      question: "How do I track all applicants across every job?",
      answer: "Open the top-bar item \"Track Applications\". The table lists every candidate, their status, interview slot, and a quick Next-Step icon.",
      open: false
    },
    {
      question: "What happens when I mark a candidate as Hired?",
      answer: "Their status changes to Hired, the listing can be closed automatically, all other candidates are set to Rejected, and personalised e-mails are dispatched.",
      open: false
    },
    {
      question: "Can I reopen a closed listing later?",
      answer: "Yes. Switch its status back to Active from the Dashboard. All previous data remain intact and new candidates can apply.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "Job Seeker – Finding & Applying": [
    {
      question: "How do I filter job results to match my preferences?",
      answer: "Inside Search Jobs use the left sidebar to filter by role, company, location, experience level, company size, job type, remote option, skills, languages, clearance, education, or work experience.",
      open: false
    },
    {
      question: "What does \"Most Relevant First\" actually mean?",
      answer: "This sort order ranks listings by the points your profile earns versus the job's requirements. Points derive from your Edit-Relevance-Points settings (role, skills, education, etc.).",
      open: false
    },
    {
      question: "Can I apply to the same job twice?",
      answer: "No. The platform blocks duplicate applications. You will see an alert if you already applied.",
      open: false
    },
    {
      question: "What is the Practice button on each job card?",
      answer: "Practice sends the job details to the Interviewer chatbot, which immediately starts a ten-question mock interview tailored to that listing.",
      open: false
    },
    {
      question: "Where do saved jobs appear?",
      answer: "Click the ⭐ icon on a job card. Saved jobs are accessible via the Saved filter in Search Jobs and inside Dashboard → Job Applications.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "CV & AI Tools": [
    {
      question: "How do I upload or replace my CV?",
      answer: "Use Settings → Update CV or the Change-Current-CV button on the Improve CV page. Upload a PDF up to 2 MB; the previous file is deleted.",
      open: false
    },
    {
      question: "What does the Improve My CV button do?",
      answer: "It sends your CV text to CareerAgent's AI, which analyses current ATS trends and returns actionable improvement tips you can download as a .txt file.",
      open: false
    },
    {
      question: "Why can't I open Improve CV without a resume?",
      answer: "The page requires an uploaded CV. If none exists, the upload modal appears automatically and blocks further actions until a PDF is provided.",
      open: false
    },
    {
      question: "What is Edit Relevance Points used for?",
      answer: "It lets Job Seekers fine-tune fields (job role, clearance, education, skills list ≥3, work experience, threshold) that power the relevance-scoring algorithm when you sort jobs by Most Relevant.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "Chat & Messaging": [
    {
      question: "How do I start a direct chat with a recruiter?",
      answer: "Open any Job Listing and click the Chat button. A conversation thread opens; recruiters can also initiate chats from their Dashboard.",
      open: false
    },
    {
      question: "Can I delete a chat with a recruiter?",
      answer: "No. Only chats with CareerAgent chatbots can be deleted. Recruiter–candidate threads stay for record-keeping, though they become read-only if the job is deleted.",
      open: false
    },
    {
      question: "Where are all my recruiter conversations collected?",
      answer: "In Search Jobs click \"View Conversations\" at the bottom to open a modal listing every thread you have with recruiters.",
      open: false
    },
    {
      question: "What delivery status icons do recruiter messages show?",
      answer: "Each message displays a double-tick once it has been read, similar to popular messaging apps.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "Chatbots (Career Advisor & Interviewer)": [
    {
      question: "How do I launch a conversation with a chatbot?",
      answer: "Navigate to the Chatbots page and click the desired bot. Premium users get extra quick-launch buttons directly on each job card that pass job data automatically.",
      open: false
    },
    {
      question: "What limits apply to free chatbot usage?",
      answer: "Free users: 100 messages per conversation and visible history of the last 10 sessions per bot.",
      open: false
    },
    {
      question: "How does the Sync Profile button help?",
      answer: "Premium users click Sync Profile so the bot can read their AI-parsed CV, skills, and personal data, producing precise answers without manual typing.",
      open: false
    },
    {
      question: "What happens if I refresh or lose connection mid-chat?",
      answer: "Your conversation autosaves. Reopen the bot to pick up exactly where you left off once reconnected.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "Interviews & Scheduling": [
    {
      question: "How does a recruiter schedule an interview?",
      answer: "In Track Applications click the calendar icon under Next Step or inside the candidate card. Enter date, time, and any meeting URL (Zoom, Teams, etc.), then press Confirm.",
      open: false
    },
    {
      question: "Are interview links generated automatically?",
      answer: "No. Recruiters paste any meeting link they wish. Candidates receive the URL and may also add the event to Google Calendar from their Dashboard.",
      open: false
    },
    {
      question: "Where do I see my upcoming interviews as a candidate?",
      answer: "Job Seeker Dashboard → Upcoming Interviews widget. Colors: Passed (grey), Near Future (yellow), Today (green).",
      open: false
    },
    {
      question: "Can I talk with a bot before my interview?",
      answer: "Yes. In the Upcoming Interviews widget click \"Talk with Interviewer Bot\" to run a mock session based on that specific job.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "Notifications & Emails": [
    {
      question: "Do notifications arrive in real time?",
      answer: "Yes. The bell icon updates instantly using Socket.IO. A red badge shows how many alerts are unread.",
      open: false
    },
    {
      question: "How long are old notifications kept?",
      answer: "Indefinitely. Scroll within the bell panel to browse earlier alerts; click any line to jump to the relevant page.",
      open: false
    },
    {
      question: "Which actions trigger e-mail as well as on-site alerts?",
      answer: "Key actions: application reviewed, interview scheduled or cancelled, candidate hired or rejected, listing deleted, password reset, and verification codes.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "Settings & Personalisation": [
    {
      question: "Which details can Job Seekers edit later?",
      answer: "Profile picture, birth-date, phone number, GitHub URL, LinkedIn URL, CV file, and Relevance Points.",
      open: false
    },
    {
      question: "What company details can recruiters update?",
      answer: "Company logo, recruiter profile picture, company size, and company website. The company name itself is fixed.",
      open: false
    },
    {
      question: "How do I stop receiving CareerAgent e-mails?",
      answer: "Open Settings → Change Mail Subscription and toggle e-mail delivery off. Alerts will still appear in the bell icon.",
      open: false
    }
  ],

  /* ─────────────────────────────── */
  "Support & Policies": [
    {
      question: "Where can I read the Terms and Privacy policies?",
      answer: "Click \"Terms\" or \"Privacy\" in the top navigation bar. Both pages open as scrollable panels with a red Close button at the bottom.",
      open: false
    },
    {
      question: "How do I contact CareerAgent support directly?",
      answer: "Open the Contact page (nav bar) to send a message, or e-mail careeragentpro@gmail.com. Typical response time is 24–48 hours (business days).",
      open: false
    },
    {
      question: "Which file types and sizes are allowed on the site?",
      answer: "All uploads must be ≤ 2 MB. CVs must be PDF. Images for profile or logos should be common formats (PNG, JPG, etc.).",
      open: false
    }
  ]
};

export default FAQ_DATA; 