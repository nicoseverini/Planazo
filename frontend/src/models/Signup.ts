import { z } from "zod";

const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Password must include upper, lower, and number");

const InterestValues = ["FOOD", "CULTURE", "NATURE"] as const;
const TravelTypeValues = ["SOLO", "PAREJA", "AMIGOS"] as const;

export const SignupFormSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: PasswordSchema,
  name: z.string().min(1, "Name is required"),
  lastname: z.string().min(1, "Lastname is required"),
  gender: z.string().min(1, "Gender is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  interests: z.array(z.enum(InterestValues)).optional(),
  budget: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || value.trim() === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      "Budget must be zero or greater",
    ),
  travelType: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || value.trim() === "" || TravelTypeValues.includes(value as typeof TravelTypeValues[number]),
      "Travel type must be valid",
    ),
  languages: z.string().optional(),
});

export type SignupFormValues = z.infer<typeof SignupFormSchema>;

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  lastname: string;
  gender: string;
  birthDate: string;
  interests?: Array<(typeof InterestValues)[number]>;
  budget?: number;
  travelType?: (typeof TravelTypeValues)[number];
  languages?: string[];
};


