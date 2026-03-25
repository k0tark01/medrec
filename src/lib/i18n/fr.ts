import type { Translations } from "./en";

const fr: Translations = {
  // Common
  appName: "Job Bridge",
  signIn: "Se connecter",
  register: "S'inscrire",
  signOut: "Déconnexion",
  getStarted: "Commencer",
  backToHome: "Retour à l'accueil",
  pleaseWait: "Veuillez patienter...",
  loading: "Chargement...",
  uploading: "Téléversement...",
  submitting: "Envoi en cours...",

  // Nav
  nav: {
    portal: "Portail",
  },

  // Landing page
  landing: {
    badge: "Plateforme de recrutement Tunisie → Allemagne",
    heroTitle: "Votre carrière en",
    heroHighlight: "Allemagne",
    heroTitleEnd: "commence ici",
    heroDesc:
      "Nous gérons vos documents, traductions et soumissions aux partenaires pour que vous puissiez vous concentrer sur l'essentiel — construire votre carrière dans la santé et l'ingénierie.",
    startApplication: "Commencer votre candidature",
    howItWorks: "Comment ça marche",
    stats: {
      placed: "Professionnels placés",
      approval: "Taux d'approbation",
      processing: "Délai moyen de traitement",
      placedValue: "500+",
      approvalValue: "98%",
      processingValue: "3 semaines",
    },
    whoWeHelp: "Qui nous aidons",
    whoWeHelpDesc: "Des parcours spécialisés pour les professionnels de la santé et de l'ingénierie.",
    nurses: "Infirmiers/ères",
    nursesDesc: "Reconnaissance des qualifications infirmières et accompagnement linguistique B1/B2",
    doctors: "Médecins",
    doctorsDesc: "Processus d'approbation, vérification de la licence médicale et traductions",
    engineers: "Ingénieurs",
    engineersDesc: "Équivalence de diplôme, certifications professionnelles et traitement des visas",
    howItWorksTitle: "Comment ça marche",
    howItWorksDesc: "Quatre étapes simples vers votre carrière en Allemagne.",
    step1Title: "Créer un profil",
    step1Desc: "Indiquez votre profession et votre parcours académique",
    step2Title: "Téléverser les documents",
    step2Desc: "Téléversez les originaux et les traductions en allemand",
    step3Title: "Vérification experte",
    step3Desc: "Notre équipe vérifie tout pour garantir l'exactitude",
    step4Title: "Soumission aux partenaires",
    step4Desc: "Nous envoyons votre dossier aux employeurs allemands",
    whyJobBridge: "Pourquoi Job Bridge ?",
    features: {
      smartTracking: "Suivi intelligent des documents",
      smartTrackingDesc:
        "Sachez exactement quels documents sont nécessaires pour votre profession, avec des mises à jour en temps réel.",
      dualUpload: "Système de double téléversement",
      dualUploadDesc:
        "Téléversez les versions originales et traduites côte à côte — sans confusion ni fichiers perdus.",
      expertVerification: "Vérification par des experts",
      expertVerificationDesc:
        "Chaque document est examiné par des spécialistes qui connaissent les exigences d'immigration allemandes.",
      billing: "Facturation complète",
      billingDesc:
        "Facturation transparente avec suivi des acomptes et gestion des frais de succès.",
      partnerNetwork: "Réseau de partenaires",
      partnerNetworkDesc:
        "Pipeline de soumission directe vers des établissements de santé et d'ingénierie allemands vérifiés.",
      secure: "Sécurisé et privé",
      secureDesc:
        "Sécurité de niveau entreprise pour vos documents personnels et professionnels sensibles.",
    },
    ctaTitle: "Prêt à commencer votre parcours ?",
    ctaDesc:
      "Rejoignez des centaines de professionnels qui ont lancé avec succès leur carrière en Allemagne.",
    ctaButton: "Créer un compte gratuit",
    footerRights: "Tous droits réservés.",
  },

  // Auth page
  auth: {
    welcomeBack: "Bon retour",
    createAccount: "Créer votre compte",
    signInDesc: "Connectez-vous pour accéder à votre tableau de bord",
    registerDesc: "Commencez votre parcours vers l'Allemagne aujourd'hui",
    fullName: "Nom complet",
    email: "E-mail",
    password: "Mot de passe",
    nameRequired: "Le nom est requis",
    somethingWrong: "Une erreur s'est produite",
    brandingTitle: "Combler le fossé entre votre talent et les opportunités allemandes",
    brandingDesc:
      "Téléversez vos documents, obtenez une vérification experte, et laissez-nous gérer les soumissions aux partenaires. Votre carrière en Allemagne est à quelques étapes.",
    feature1: "Gestion intelligente des documents",
    feature2: "Vérification et révision par des experts",
    feature3: "Connexions directes avec les employeurs",
    minChars: "Min 8 caractères",
    createAccountBtn: "Créer un compte",
  },

  // Onboarding
  onboarding: {
    title: "Complétez votre profil",
    desc: "Parlez-nous de votre profession pour que nous puissions préparer votre liste de documents.",
    setupTitle: "Configurons votre profil",
    setupDesc:
      "Nous avons besoin de quelques détails sur votre profession pour générer votre liste de documents personnalisée. Cela ne prend qu'une minute.",
    step1: "Compléter votre profil",
    step2: "Téléverser les documents",
    step3: "Être vérifié et se connecter",
    fullName: "Nom complet",
    phone: "Téléphone (optionnel)",
    phonePlaceholder: "+216 XX XXX XXX",
    occupation: "Profession",
    academicStatus: "Statut académique",
    nurse: "Infirmier/ère",
    doctor: "Médecin",
    engineer: "Ingénieur",
    other: "Autre",
    otherPlaceholder: "ex. Pharmacien, Dentiste...",
    graduated: "Diplômé(e)",
    student: "Étudiant(e)",
    ausbildung: "Ausbildung (Formation professionnelle)",
    continueBtn: "Continuer vers le tableau de bord",
    creatingProfile: "Création du profil...",
    selectError: "Veuillez sélectionner votre profession et votre statut académique.",
    failedCreate: "Échec de la création du profil",
  },

  // Sidebar
  sidebar: {
    dashboard: "Tableau de bord",
    documents: "Documents",
    billing: "Facturation",
    reviewQueue: "File d'attente",
    users: "Utilisateurs",
    adminPanel: "Panneau admin",
    switchDark: "Passer en mode sombre",
    switchLight: "Passer en mode clair",
  },

  // Dashboard
  dashboard: {
    welcome: "Bienvenue,",
    documentsLabel: "Documents",
    uploaded: "Téléversés",
    verified: "Vérifiés",
    needsCorrection: "À corriger",
    documentsWord: "documents",
    unpaidInvoices: "Factures impayées",
    allClear: "Tout est en ordre",
    quickActions: "Actions rapides",
    uploadDocuments: "Téléverser les documents",
    viewDocuments: "Voir les documents",
    viewInvoices: "Voir les factures",
    greeting: "Content de vous revoir",
    progressTitle: "Votre progression",
    progressDesc: "Suivez l'avancement de votre dossier",
    nextStep: "Prochaine étape",
    uploadNext: "Téléversez vos documents restants pour avancer.",
    allUploaded: "Tous les documents téléversés ! En attente de vérification.",
    correctionNeeded: "Certains documents nécessitent des corrections. Veuillez vérifier.",
    allVerified: "Tous les documents vérifiés ! Vous êtes sur la bonne voie.",
  },

  // Documents page
  docs: {
    title: "Documents",
    desc: "Téléversez les versions originales et traduites de chaque document requis.",
    submitForReview: "Soumettre pour vérification",
    original: "Original (FR/AR)",
    translation: "Traduction (DE)",
    replace: "Remplacer",
    upload: "Téléverser",
    verifiedLocked: "Vérifié — verrouillé",
    uploadFailed: "Échec du téléversement",
    submissionFailed: "Échec de la soumission",
  },

  // Billing page
  billingPage: {
    title: "Facturation",
    desc: "Consultez vos factures et l'état des paiements.",
    noInvoices: "Aucune facture pour le moment.",
    noDescription: "Aucune description",
  },

  // Review page
  review: {
    title: "File d'attente de vérification",
    desc: "Cliquez sur un candidat pour examiner ses documents.",
    backToQueue: "Retour à la file",
    noAccess: "Vous n'avez pas accès à cette page.",
    noDocsYet: "Aucun document téléversé.",
    noApplicants: "Aucun candidat à examiner.",
    originalLabel: "Original :",
    translationLabel: "Traduction :",
    preview: "Aperçu",
    download: "Télécharger",
    verify: "Vérifier",
    reject: "Rejeter",
    rejectReason: "Raison du rejet :",
    readyForPartner: "Prêt pour le partenaire",
    precheckPassed: "Pré-contrôle validé",
    markSubmitted: "Marquer comme soumis",
    approveApplication: "Approuver la candidature",
    rejectApplication: "Rejeter la candidature",
    rejectApplicationReasonPlaceholder: "Ajoutez une raison claire du rejet",
    downloadFolderZip: "Télécharger le dossier ZIP",
    preparingZip: "Préparation du ZIP...",
    missingFile: "Manquant",
  },

  // Admin page
  admin: {
    title: "Panneau d'administration",
    totalUsers: "Total utilisateurs",
    revenuePaid: "Revenus (payés)",
    pending: "En attente",
    userManagement: "Gestion des utilisateurs",
    invoices: "Factures",
    newInvoice: "Nouvelle facture",
    applicant: "Candidat",
    selectApplicant: "Sélectionner un candidat",
    amount: "Montant (TND)",
    type: "Type",
    deposit: "Acompte",
    successFee: "Frais de succès",
    other: "Autre",
    descriptionOptional: "Description (optionnel)",
    createInvoice: "Créer une facture",
    markPaid: "Marquer payée",
    noInvoicesYet: "Aucune facture créée.",
    failedCreate: "Échec de la création de la facture",
    adminRequired: "Accès administrateur requis.",
    applicantRole: "Candidat",
    reviewerRole: "Réviseur",
    adminRole: "Admin",
  },

  // Users page
  usersPage: {
    title: "Tous les utilisateurs",
    name: "Nom",
    email: "E-mail",
    occupationCol: "Profession",
    role: "Rôle",
    status: "Statut",
    joined: "Inscrit le",
    noUsers: "Aucun utilisateur trouvé.",
    adminRequired: "Accès administrateur requis.",
  },

  // Common UI
  common: {
    search: "Rechercher...",
    filterByStatus: "Tous les statuts",
    noResults: "Aucun résultat trouvé.",
    cancel: "Annuler",
    confirm: "Confirmer",
  },

  // Email verification
  emailVerification: {
    title: "Vérifiez votre e-mail",
    desc: "Nous avons envoyé un lien de vérification à votre adresse e-mail. Veuillez vérifier votre boîte de réception et cliquer sur le lien.",
    resend: "Renvoyer l'e-mail de vérification",
    resent: "E-mail de vérification envoyé !",
    checking: "Vérification du statut...",
    verified: "E-mail vérifié avec succès !",
    notVerified: "E-mail non encore vérifié. Veuillez vérifier votre boîte de réception.",
  },

  // Password Reset
  passwordReset: {
    forgotPassword: "Mot de passe oublié ?",
    title: "Réinitialiser votre mot de passe",
    desc: "Entrez votre e-mail et nous vous enverrons un lien de réinitialisation.",
    email: "Adresse e-mail",
    sendLink: "Envoyer le lien",
    sending: "Envoi en cours...",
    sent: "Lien envoyé ! Vérifiez votre boîte de réception.",
    backToLogin: "Retour à la connexion",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    resetPassword: "Réinitialiser le mot de passe",
    resetting: "Réinitialisation...",
    success: "Mot de passe réinitialisé ! Vous pouvez maintenant vous connecter.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    invalidLink: "Lien invalide ou expiré.",
  },

  // Profile Editing
  profileEdit: {
    title: "Modifier le profil",
    desc: "Mettez à jour vos informations personnelles.",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Profil mis à jour avec succès !",
    failed: "Échec de la mise à jour du profil.",
    editProfile: "Modifier le profil",
  },

  // File Preview
  filePreview: {
    title: "Aperçu du fichier",
    close: "Fermer",
    openInNewTab: "Ouvrir dans un nouvel onglet",
    previewUnavailable: "Aperçu non disponible pour ce type de fichier.",
  },

  // Audit Log
  auditLog: {
    title: "Journal d'audit",
    noLogs: "Aucune entrée dans le journal d'audit.",
    action: "Action",
    user: "Utilisateur",
    target: "Cible",
    date: "Date",
    details: "Détails",
    actions: {
      verifyDoc: "Document vérifié",
      rejectDoc: "Document rejeté",
      readyForPartner: "Marqué prêt pour le partenaire",
      markSubmitted: "Marqué soumis au partenaire",
      roleChange: "Rôle utilisateur modifié",
      createInvoice: "Facture créée",
      markPaid: "Facture marquée payée",
      profileUpdate: "Profil mis à jour",
      correctionRequested: "Corrections demandées",
      approveApplication: "Candidature approuvée",
      rejectApplication: "Candidature rejetée",
      submitDossier: "Dossier soumis pour vérification",
    },
  },
};

export default fr;
