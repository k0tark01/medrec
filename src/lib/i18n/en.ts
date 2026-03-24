const en = {
  // Common
  appName: "Job Bridge",
  signIn: "Sign In",
  register: "Register",
  signOut: "Sign Out",
  getStarted: "Get Started",
  backToHome: "Back to home",
  pleaseWait: "Please wait...",
  loading: "Loading...",
  uploading: "Uploading...",
  submitting: "Submitting...",

  // Nav
  nav: {
    portal: "Portal",
  },

  // Landing page
  landing: {
    badge: "Tunisia → Germany Recruitment Platform",
    heroTitle: "Your career in",
    heroHighlight: "Germany",
    heroTitleEnd: "starts here",
    heroDesc:
      "We handle your documents, translations, and partner submissions so you can focus on what matters — building your career in healthcare and engineering.",
    startApplication: "Start Your Application",
    howItWorks: "How It Works",
    stats: {
      placed: "Professionals placed",
      approval: "Document approval rate",
      processing: "Average processing time",
      placedValue: "500+",
      approvalValue: "98%",
      processingValue: "3 weeks",
    },
    whoWeHelp: "Who We Help",
    whoWeHelpDesc: "Specialized pathways for healthcare and engineering professionals.",
    nurses: "Nurses",
    nursesDesc: "Recognition of nursing qualifications and B1/B2 language support",
    doctors: "Doctors",
    doctorsDesc: "Approbation process, medical license verification and translations",
    engineers: "Engineers",
    engineersDesc: "Degree equivalence, professional certifications and visa processing",
    howItWorksTitle: "How It Works",
    howItWorksDesc: "Four simple steps to your German career.",
    step1Title: "Create Profile",
    step1Desc: "Tell us your profession and academic background",
    step2Title: "Upload Documents",
    step2Desc: "Upload originals and German translations",
    step3Title: "Expert Review",
    step3Desc: "Our team verifies everything for accuracy",
    step4Title: "Partner Submission",
    step4Desc: "We send your dossier to German employers",
    whyJobBridge: "Why Job Bridge?",
    features: {
      smartTracking: "Smart Document Tracking",
      smartTrackingDesc:
        "Know exactly which documents are needed for your profession, with real-time status updates.",
      dualUpload: "Dual Upload System",
      dualUploadDesc:
        "Upload both original and translated versions side by side — no confusion, no lost files.",
      expertVerification: "Expert Verification",
      expertVerificationDesc:
        "Every document is reviewed by specialists who know German immigration requirements.",
      billing: "End-to-End Billing",
      billingDesc:
        "Transparent invoicing with deposit tracking and success fee management.",
      partnerNetwork: "Partner Network",
      partnerNetworkDesc:
        "Direct submission pipeline to vetted German healthcare facilities and engineering firms.",
      secure: "Secure & Private",
      secureDesc:
        "Enterprise-grade security for your sensitive personal and professional documents.",
    },
    ctaTitle: "Ready to start your journey?",
    ctaDesc:
      "Join hundreds of professionals who have successfully launched their careers in Germany.",
    ctaButton: "Create Free Account",
    footerRights: "All rights reserved.",
  },

  // Auth page
  auth: {
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    signInDesc: "Sign in to continue to your dashboard",
    registerDesc: "Start your journey to Germany today",
    fullName: "Full Name",
    email: "Email",
    password: "Password",
    nameRequired: "Name is required",
    somethingWrong: "Something went wrong",
    brandingTitle: "Bridge the gap between your talent and German opportunities",
    brandingDesc:
      "Upload your documents, get expert verification, and let us handle partner submissions. Your German career is just a few steps away.",
    feature1: "Smart document management",
    feature2: "Expert review & verification",
    feature3: "Direct employer connections",
    minChars: "Min 8 characters",
    createAccountBtn: "Create Account",
  },

  // Onboarding
  onboarding: {
    title: "Complete Your Profile",
    desc: "Tell us about your profession so we can prepare your document checklist.",
    setupTitle: "Let's set up your profile",
    setupDesc:
      "We need a few details about your profession to generate your personalized document checklist. This only takes a minute.",
    step1: "Complete your profile",
    step2: "Upload documents",
    step3: "Get verified & connect",
    fullName: "Full Name",
    phone: "Phone (optional)",
    phonePlaceholder: "+216 XX XXX XXX",
    occupation: "Occupation",
    academicStatus: "Academic Status",
    nurse: "Nurse",
    doctor: "Doctor",
    engineer: "Engineer",
    other: "Other",
    otherPlaceholder: "e.g. Pharmacist, Dentist...",
    graduated: "Graduated",
    student: "Student",
    ausbildung: "Ausbildung (Vocational Training)",
    continueBtn: "Continue to Dashboard",
    creatingProfile: "Creating Profile...",
    selectError: "Please select your occupation and academic status.",
    failedCreate: "Failed to create profile",
  },

  // Sidebar
  sidebar: {
    dashboard: "Dashboard",
    documents: "Documents",
    billing: "Billing",
    reviewQueue: "Review Queue",
    users: "Users",
    adminPanel: "Admin Panel",
    switchDark: "Switch to dark mode",
    switchLight: "Switch to light mode",
  },

  // Dashboard
  dashboard: {
    welcome: "Welcome,",
    documentsLabel: "Documents",
    uploaded: "Uploaded",
    verified: "Verified",
    needsCorrection: "Needs Correction",
    documentsWord: "documents",
    unpaidInvoices: "Unpaid Invoices",
    allClear: "All clear",
    quickActions: "Quick Actions",
    uploadDocuments: "Upload Documents",
    viewDocuments: "View Documents",
    viewInvoices: "View Invoices",
    greeting: "Good to see you back",
    progressTitle: "Your Progress",
    progressDesc: "Track your application journey",
    nextStep: "Next Step",
    uploadNext: "Upload your remaining documents to move forward.",
    allUploaded: "All documents uploaded! Waiting for review.",
    correctionNeeded: "Some documents need corrections. Please review.",
    allVerified: "All documents verified! You're on track.",
  },

  // Documents page
  docs: {
    title: "Documents",
    desc: "Upload original + translated versions of each required document.",
    submitForReview: "Submit for Review",
    original: "Original (FR/AR)",
    translation: "Translation (DE)",
    replace: "Replace",
    upload: "Upload",
    verifiedLocked: "Verified — locked",
    uploadFailed: "Upload failed",
    submissionFailed: "Submission failed",
  },

  // Billing page
  billingPage: {
    title: "Billing",
    desc: "View your invoices and payment status.",
    noInvoices: "No invoices yet.",
    noDescription: "No description",
  },

  // Review page
  review: {
    title: "Review Queue",
    desc: "Click an applicant to review their documents.",
    backToQueue: "Back to Queue",
    noAccess: "You don't have access to this page.",
    noDocsYet: "No documents uploaded yet.",
    noApplicants: "No applicants to review.",
    originalLabel: "Original:",
    translationLabel: "Translation:",
    preview: "Preview",
    download: "Download",
    verify: "Verify",
    reject: "Reject",
    rejectReason: "Reason for rejection:",
    readyForPartner: "Ready for Partner",
    markSubmitted: "Mark Submitted",
  },

  // Admin page
  admin: {
    title: "Admin Panel",
    totalUsers: "Total Users",
    revenuePaid: "Revenue (Paid)",
    pending: "Pending",
    userManagement: "User Management",
    invoices: "Invoices",
    newInvoice: "New Invoice",
    applicant: "Applicant",
    selectApplicant: "Select applicant",
    amount: "Amount (TND)",
    type: "Type",
    deposit: "Deposit",
    successFee: "Success Fee",
    other: "Other",
    descriptionOptional: "Description (optional)",
    createInvoice: "Create Invoice",
    markPaid: "Mark Paid",
    noInvoicesYet: "No invoices created yet.",
    failedCreate: "Failed to create invoice",
    adminRequired: "Admin access required.",
    applicantRole: "Applicant",
    reviewerRole: "Reviewer",
    adminRole: "Admin",
  },

  // Users page
  usersPage: {
    title: "All Users",
    name: "Name",
    email: "Email",
    occupationCol: "Occupation",
    role: "Role",
    status: "Status",
    joined: "Joined",
    noUsers: "No users found.",
    adminRequired: "Admin access required.",
  },

  // Common UI
  common: {
    search: "Search...",
    filterByStatus: "All statuses",
    noResults: "No results found.",
    cancel: "Cancel",
    confirm: "Confirm",
  },

  // Email verification
  emailVerification: {
    title: "Verify Your Email",
    desc: "We sent a verification link to your email address. Please check your inbox and click the link to verify.",
    resend: "Resend Verification Email",
    resent: "Verification email sent!",
    checking: "Checking verification status...",
    verified: "Email verified successfully!",
    notVerified: "Email not yet verified. Please check your inbox.",
  },

  // Password Reset
  passwordReset: {
    forgotPassword: "Forgot password?",
    title: "Reset Your Password",
    desc: "Enter your email and we'll send you a reset link.",
    email: "Email Address",
    sendLink: "Send Reset Link",
    sending: "Sending...",
    sent: "Reset link sent! Check your inbox.",
    backToLogin: "Back to login",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    resetPassword: "Reset Password",
    resetting: "Resetting...",
    success: "Password reset successfully! You can now sign in.",
    passwordMismatch: "Passwords do not match.",
    invalidLink: "Invalid or expired reset link.",
  },

  // Profile Editing
  profileEdit: {
    title: "Edit Profile",
    desc: "Update your personal information.",
    save: "Save Changes",
    saving: "Saving...",
    saved: "Profile updated successfully!",
    failed: "Failed to update profile.",
    editProfile: "Edit Profile",
  },

  // File Preview
  filePreview: {
    title: "File Preview",
    close: "Close",
    openInNewTab: "Open in New Tab",
    previewUnavailable: "Preview not available for this file type.",
  },

  // Audit Log
  auditLog: {
    title: "Audit Log",
    noLogs: "No audit log entries yet.",
    action: "Action",
    user: "User",
    target: "Target",
    date: "Date",
    details: "Details",
    actions: {
      verifyDoc: "Verified document",
      rejectDoc: "Rejected document",
      readyForPartner: "Marked ready for partner",
      markSubmitted: "Marked submitted to partner",
      roleChange: "Changed user role",
      createInvoice: "Created invoice",
      markPaid: "Marked invoice paid",
      profileUpdate: "Updated profile",
    },
  },
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Translations = DeepString<typeof en>;
export default en;
