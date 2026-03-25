import type { Translations } from "./en";

const de: Translations = {
  // Common
  appName: "Job Bridge",
  signIn: "Anmelden",
  register: "Registrieren",
  signOut: "Abmelden",
  getStarted: "Loslegen",
  backToHome: "Zurück zur Startseite",
  pleaseWait: "Bitte warten...",
  loading: "Laden...",
  uploading: "Hochladen...",
  submitting: "Wird eingereicht...",

  // Nav
  nav: {
    portal: "Portal",
  },

  // Landing page
  landing: {
    badge: "Rekrutierungsplattform Tunesien → Deutschland",
    heroTitle: "Ihre Karriere in",
    heroHighlight: "Deutschland",
    heroTitleEnd: "beginnt hier",
    heroDesc:
      "Wir kümmern uns um Ihre Dokumente, Übersetzungen und Partnereinreichungen, damit Sie sich auf das Wesentliche konzentrieren können — Ihre Karriere im Gesundheitswesen und Ingenieurbereich.",
    startApplication: "Bewerbung starten",
    howItWorks: "So funktioniert's",
    stats: {
      placed: "Vermittelte Fachkräfte",
      approval: "Dokumenten-Genehmigungsrate",
      processing: "Durchschnittliche Bearbeitungszeit",
      placedValue: "500+",
      approvalValue: "98%",
      processingValue: "3 Wochen",
    },
    whoWeHelp: "Wen wir unterstützen",
    whoWeHelpDesc: "Spezialisierte Wege für Fachkräfte im Gesundheitswesen und Ingenieurbereich.",
    nurses: "Pflegekräfte",
    nursesDesc: "Anerkennung von Pflegequalifikationen und B1/B2-Sprachunterstützung",
    doctors: "Ärzte",
    doctorsDesc: "Approbationsverfahren, Überprüfung der ärztlichen Zulassung und Übersetzungen",
    engineers: "Ingenieure",
    engineersDesc: "Abschlussanerkennung, Berufszertifizierungen und Visumsbearbeitung",
    howItWorksTitle: "So funktioniert's",
    howItWorksDesc: "Vier einfache Schritte zu Ihrer Karriere in Deutschland.",
    step1Title: "Profil erstellen",
    step1Desc: "Teilen Sie uns Ihren Beruf und akademischen Hintergrund mit",
    step2Title: "Dokumente hochladen",
    step2Desc: "Laden Sie Originale und deutsche Übersetzungen hoch",
    step3Title: "Expertenprüfung",
    step3Desc: "Unser Team überprüft alles auf Richtigkeit",
    step4Title: "Partnereinreichung",
    step4Desc: "Wir senden Ihre Unterlagen an deutsche Arbeitgeber",
    whyJobBridge: "Warum Job Bridge?",
    features: {
      smartTracking: "Intelligente Dokumentenverfolgung",
      smartTrackingDesc:
        "Wissen Sie genau, welche Dokumente für Ihren Beruf benötigt werden, mit Echtzeit-Statusaktualisierungen.",
      dualUpload: "Duales Upload-System",
      dualUploadDesc:
        "Laden Sie Original- und übersetzte Versionen nebeneinander hoch — ohne Verwirrung oder verlorene Dateien.",
      expertVerification: "Expertenverifizierung",
      expertVerificationDesc:
        "Jedes Dokument wird von Spezialisten überprüft, die die deutschen Einwanderungsanforderungen kennen.",
      billing: "Komplette Abrechnung",
      billingDesc:
        "Transparente Rechnungsstellung mit Anzahlungsverfolgung und Erfolgshonorarverwaltung.",
      partnerNetwork: "Partnernetzwerk",
      partnerNetworkDesc:
        "Direkte Einreichungspipeline zu geprüften deutschen Gesundheitseinrichtungen und Ingenieurbüros.",
      secure: "Sicher & Privat",
      secureDesc:
        "Unternehmenssicherheit für Ihre sensiblen persönlichen und beruflichen Dokumente.",
    },
    ctaTitle: "Bereit, Ihre Reise zu beginnen?",
    ctaDesc:
      "Schließen Sie sich Hunderten von Fachkräften an, die ihre Karriere in Deutschland erfolgreich gestartet haben.",
    ctaButton: "Kostenloses Konto erstellen",
    footerRights: "Alle Rechte vorbehalten.",
  },

  // Auth page
  auth: {
    welcomeBack: "Willkommen zurück",
    createAccount: "Konto erstellen",
    signInDesc: "Melden Sie sich an, um zu Ihrem Dashboard zu gelangen",
    registerDesc: "Starten Sie heute Ihre Reise nach Deutschland",
    fullName: "Vollständiger Name",
    email: "E-Mail",
    password: "Passwort",
    nameRequired: "Name ist erforderlich",
    somethingWrong: "Etwas ist schiefgelaufen",
    brandingTitle: "Überbrücken Sie die Lücke zwischen Ihrem Talent und deutschen Möglichkeiten",
    brandingDesc:
      "Laden Sie Ihre Dokumente hoch, erhalten Sie eine Expertenverifizierung und lassen Sie uns die Partnereinreichungen übernehmen. Ihre Karriere in Deutschland ist nur wenige Schritte entfernt.",
    feature1: "Intelligentes Dokumentenmanagement",
    feature2: "Expertenprüfung & Verifizierung",
    feature3: "Direkte Arbeitgeberverbindungen",
    minChars: "Mindestens 8 Zeichen",
    createAccountBtn: "Konto erstellen",
  },

  // Onboarding
  onboarding: {
    title: "Profil vervollständigen",
    desc: "Erzählen Sie uns von Ihrem Beruf, damit wir Ihre Dokumenten-Checkliste vorbereiten können.",
    setupTitle: "Richten wir Ihr Profil ein",
    setupDesc:
      "Wir benötigen einige Details zu Ihrem Beruf, um Ihre persönliche Dokumen­ten-Checkliste zu erstellen. Das dauert nur eine Minute.",
    step1: "Profil vervollständigen",
    step2: "Dokumente hochladen",
    step3: "Verifiziert werden & verbinden",
    fullName: "Vollständiger Name",
    phone: "Telefon (optional)",
    phonePlaceholder: "+216 XX XXX XXX",
    occupation: "Beruf",
    academicStatus: "Akademischer Status",
    nurse: "Pflegefachkraft",
    doctor: "Arzt/Ärztin",
    engineer: "Ingenieur/in",
    other: "Andere",
    otherPlaceholder: "z.B. Apotheker, Zahnarzt...",
    graduated: "Abgeschlossen",
    student: "Student/in",
    ausbildung: "Ausbildung (Berufsausbildung)",
    continueBtn: "Weiter zum Dashboard",
    creatingProfile: "Profil wird erstellt...",
    selectError: "Bitte wählen Sie Ihren Beruf und akademischen Status.",
    failedCreate: "Profil konnte nicht erstellt werden",
  },

  // Sidebar
  sidebar: {
    dashboard: "Dashboard",
    documents: "Dokumente",
    billing: "Abrechnung",
    reviewQueue: "Prüfungswarteschlange",
    users: "Benutzer",
    adminPanel: "Admin-Bereich",
    switchDark: "Dunkelmodus aktivieren",
    switchLight: "Hellmodus aktivieren",
  },

  // Dashboard
  dashboard: {
    welcome: "Willkommen,",
    documentsLabel: "Dokumente",
    uploaded: "Hochgeladen",
    verified: "Verifiziert",
    needsCorrection: "Korrektur nötig",
    documentsWord: "Dokumente",
    unpaidInvoices: "Unbezahlte Rechnungen",
    allClear: "Alles in Ordnung",
    quickActions: "Schnellaktionen",
    uploadDocuments: "Dokumente hochladen",
    viewDocuments: "Dokumente anzeigen",
    viewInvoices: "Rechnungen anzeigen",
    greeting: "Schön Sie wiederzusehen",
    progressTitle: "Ihr Fortschritt",
    progressDesc: "Verfolgen Sie Ihren Bewerbungsprozess",
    nextStep: "Nächster Schritt",
    uploadNext: "Laden Sie Ihre verbleibenden Dokumente hoch, um fortzufahren.",
    allUploaded: "Alle Dokumente hochgeladen! Warten auf Überprüfung.",
    correctionNeeded: "Einige Dokumente benötigen Korrekturen. Bitte überprüfen.",
    allVerified: "Alle Dokumente verifiziert! Sie sind auf dem richtigen Weg.",
  },

  // Documents page
  docs: {
    title: "Dokumente",
    desc: "Laden Sie Original- und übersetzte Versionen jedes erforderlichen Dokuments hoch.",
    submitForReview: "Zur Prüfung einreichen",
    original: "Original (FR/AR)",
    translation: "Übersetzung (DE)",
    replace: "Ersetzen",
    upload: "Hochladen",
    verifiedLocked: "Verifiziert — gesperrt",
    uploadFailed: "Hochladen fehlgeschlagen",
    submissionFailed: "Einreichung fehlgeschlagen",
  },

  // Billing page
  billingPage: {
    title: "Abrechnung",
    desc: "Sehen Sie Ihre Rechnungen und den Zahlungsstatus ein.",
    noInvoices: "Noch keine Rechnungen.",
    noDescription: "Keine Beschreibung",
  },

  // Review page
  review: {
    title: "Prüfungswarteschlange",
    desc: "Klicken Sie auf einen Bewerber, um seine Dokumente zu prüfen.",
    backToQueue: "Zurück zur Warteschlange",
    noAccess: "Sie haben keinen Zugriff auf diese Seite.",
    noDocsYet: "Noch keine Dokumente hochgeladen.",
    noApplicants: "Keine Bewerber zu prüfen.",
    originalLabel: "Original:",
    translationLabel: "Übersetzung:",
    preview: "Vorschau",
    download: "Herunterladen",
    verify: "Verifizieren",
    reject: "Ablehnen",
    rejectReason: "Grund der Ablehnung:",
    readyForPartner: "Bereit für Partner",
    precheckPassed: "Vorprüfung bestanden",
    markSubmitted: "Als eingereicht markieren",
    approveApplication: "Bewerbung freigeben",
    rejectApplication: "Bewerbung ablehnen",
    rejectApplicationReasonPlaceholder: "Fügen Sie einen klaren Ablehnungsgrund hinzu",
    downloadFolderZip: "ZIP-Ordner herunterladen",
    preparingZip: "ZIP wird vorbereitet...",
    missingFile: "Fehlt",
  },

  // Admin page
  admin: {
    title: "Admin-Bereich",
    totalUsers: "Benutzer gesamt",
    revenuePaid: "Umsatz (bezahlt)",
    pending: "Ausstehend",
    userManagement: "Benutzerverwaltung",
    invoices: "Rechnungen",
    newInvoice: "Neue Rechnung",
    applicant: "Bewerber",
    selectApplicant: "Bewerber auswählen",
    amount: "Betrag (TND)",
    type: "Typ",
    deposit: "Anzahlung",
    successFee: "Erfolgshonorar",
    other: "Sonstiges",
    descriptionOptional: "Beschreibung (optional)",
    createInvoice: "Rechnung erstellen",
    markPaid: "Als bezahlt markieren",
    noInvoicesYet: "Noch keine Rechnungen erstellt.",
    failedCreate: "Rechnung konnte nicht erstellt werden",
    adminRequired: "Admin-Zugang erforderlich.",
    applicantRole: "Bewerber",
    reviewerRole: "Prüfer",
    adminRole: "Admin",
  },

  // Users page
  usersPage: {
    title: "Alle Benutzer",
    name: "Name",
    email: "E-Mail",
    occupationCol: "Beruf",
    role: "Rolle",
    status: "Status",
    joined: "Beigetreten",
    noUsers: "Keine Benutzer gefunden.",
    adminRequired: "Admin-Zugang erforderlich.",
  },

  // Common UI
  common: {
    search: "Suchen...",
    filterByStatus: "Alle Status",
    noResults: "Keine Ergebnisse gefunden.",
    cancel: "Abbrechen",
    confirm: "Bestätigen",
  },

  // Email verification
  emailVerification: {
    title: "E-Mail bestätigen",
    desc: "Wir haben einen Bestätigungslink an Ihre E-Mail-Adresse gesendet. Bitte überprüfen Sie Ihren Posteingang und klicken Sie auf den Link.",
    resend: "Bestätigungs-E-Mail erneut senden",
    resent: "Bestätigungs-E-Mail gesendet!",
    checking: "Überprüfe Bestätigungsstatus...",
    verified: "E-Mail erfolgreich bestätigt!",
    notVerified: "E-Mail noch nicht bestätigt. Bitte überprüfen Sie Ihren Posteingang.",
  },

  // Password Reset
  passwordReset: {
    forgotPassword: "Passwort vergessen?",
    title: "Passwort zurücksetzen",
    desc: "Geben Sie Ihre E-Mail ein und wir senden Ihnen einen Link zum Zurücksetzen.",
    email: "E-Mail-Adresse",
    sendLink: "Link senden",
    sending: "Wird gesendet...",
    sent: "Link gesendet! Überprüfen Sie Ihren Posteingang.",
    backToLogin: "Zurück zur Anmeldung",
    newPassword: "Neues Passwort",
    confirmPassword: "Passwort bestätigen",
    resetPassword: "Passwort zurücksetzen",
    resetting: "Wird zurückgesetzt...",
    success: "Passwort erfolgreich zurückgesetzt! Sie können sich jetzt anmelden.",
    passwordMismatch: "Passwörter stimmen nicht überein.",
    invalidLink: "Ungültiger oder abgelaufener Link.",
  },

  // Profile Editing
  profileEdit: {
    title: "Profil bearbeiten",
    desc: "Aktualisieren Sie Ihre persönlichen Daten.",
    save: "Änderungen speichern",
    saving: "Wird gespeichert...",
    saved: "Profil erfolgreich aktualisiert!",
    failed: "Profil konnte nicht aktualisiert werden.",
    editProfile: "Profil bearbeiten",
  },

  // File Preview
  filePreview: {
    title: "Dateivorschau",
    close: "Schließen",
    openInNewTab: "In neuem Tab öffnen",
    previewUnavailable: "Vorschau für diesen Dateityp nicht verfügbar.",
  },

  // Audit Log
  auditLog: {
    title: "Audit-Protokoll",
    noLogs: "Noch keine Einträge im Audit-Protokoll.",
    action: "Aktion",
    user: "Benutzer",
    target: "Ziel",
    date: "Datum",
    details: "Details",
    actions: {
      verifyDoc: "Dokument verifiziert",
      rejectDoc: "Dokument abgelehnt",
      readyForPartner: "Als partnerbereit markiert",
      markSubmitted: "Als eingereicht markiert",
      roleChange: "Benutzerrolle geändert",
      createInvoice: "Rechnung erstellt",
      markPaid: "Rechnung als bezahlt markiert",
      profileUpdate: "Profil aktualisiert",
      correctionRequested: "Korrekturen angefordert",
      approveApplication: "Bewerbung genehmigt",
      rejectApplication: "Bewerbung abgelehnt",
      submitDossier: "Dossier zur Prüfung eingereicht",
    },
  },
};

export default de;
