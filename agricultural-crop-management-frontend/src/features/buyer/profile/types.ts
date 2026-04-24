import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// BUYER PROFILE TYPES
// ═══════════════════════════════════════════════════════════════

export interface BuyerProfileData {
  id: number;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  address: string;
  role: 'buyer';
  status: 'active' | 'inactive';
  joinedDate: string;
  lastLogin: string;
  provinceId?: number;
  wardId?: number;
}

// ═══════════════════════════════════════════════════════════════
// EDIT PROFILE FORM SCHEMA
// ═══════════════════════════════════════════════════════════════

export const EditProfileFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  provinceId: z.number().optional(),
  wardId: z.number().optional(),
});

export type EditProfileFormData = z.infer<typeof EditProfileFormSchema>;
