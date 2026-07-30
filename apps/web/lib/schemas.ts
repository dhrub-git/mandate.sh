import { z } from "zod";
import {
  Industry,
  EmployeeCount,
  RevenueRange,
  AIInteraction,
  GovernanceStructure,
  AIRole,
} from "@repo/database/enums";

export const onboardingSchema = z.object({
  // Step 1: Basics
  name: z.string().min(2, "Company name is required"),
  address: z.string().min(5, "Valid address is required"),
  industry: z.nativeEnum(Industry),

  // Step 2: Scale
  employeeCount: z.nativeEnum(EmployeeCount),
  revenue: z.nativeEnum(RevenueRange),

  // Step 3: Reach
  operatingRegions: z.array(z.string()).min(1, "Select at least one region"),
  euInteraction: z.enum(AIInteraction).optional(),

  // Step 4: Compliance
  certifications: z.array(z.string()),
  governance: z.nativeEnum(GovernanceStructure),

  // Step 5: Role
  aiRole: z.nativeEnum(AIRole),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
