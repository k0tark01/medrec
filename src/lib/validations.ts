import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export const onboardingSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
  phone: z.string().optional(),
  occupation: z.enum(["Nurse", "Doctor", "Engineer", "Other"], { message: "Please select an occupation" }),
  academicStatus: z.enum(["Graduated", "Student", "Ausbildung"], { message: "Please select academic status" }),
});

export const invoiceSchema = z.object({
  profileId: z.string().min(1, "Please select an applicant"),
  amount: z.number().positive("Amount must be positive"),
  invoiceType: z.enum(["Deposit", "Success_Fee", "Other"]),
  description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
