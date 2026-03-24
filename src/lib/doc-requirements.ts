import type { Occupation, AcademicStatus } from "./types";

// Maps occupation + academicStatus to required document types
const BASE_DOCS = ["Passport", "CV", "B1_Certificate"];

const OCCUPATION_DOCS: Record<Occupation, string[]> = {
  Nurse: ["Nursing_Diploma", "Nursing_License", "Clinical_Training_Certificate"],
  Doctor: ["Medical_Diploma", "Medical_License", "Specialty_Certificate", "Approbation_Docs"],
  Engineer: ["Engineering_Diploma", "Professional_Certification", "Work_Experience_Letter"],
  Other: ["Professional_Diploma", "Work_Experience_Letter"],
};

const ACADEMIC_EXTRAS: Partial<Record<AcademicStatus, string[]>> = {
  Student: ["Enrollment_Certificate", "Transcript"],
  Ausbildung: ["Ausbildung_Contract", "Training_Plan"],
};

export function getRequiredDocs(occupation: Occupation, academicStatus: AcademicStatus): string[] {
  return [
    ...BASE_DOCS,
    ...OCCUPATION_DOCS[occupation],
    ...(ACADEMIC_EXTRAS[academicStatus] ?? []),
  ];
}

export function formatDocType(docType: string): string {
  return docType.replace(/_/g, " ");
}
