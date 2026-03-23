export type PlanTier = 'free' | 'premium' | 'pro';

export interface PlanLimits {
  maxGoals: number;
  maxAccounts: number;
  aiMessagesPerMonth: number;
  aiReportsPerMonth: number;
  hasWhatsApp: boolean;
  hasAdvancedAI: boolean;
  hasExportPDF: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxGoals: 4,
    maxAccounts: 1,
    aiMessagesPerMonth: 5,
    aiReportsPerMonth: 0,
    hasWhatsApp: true,
    hasAdvancedAI: false,
    hasExportPDF: false,
  },
  premium: {
    maxGoals: 999, // unlimited
    maxAccounts: 5,
    aiMessagesPerMonth: 50,
    aiReportsPerMonth: 3,
    hasWhatsApp: true,
    hasAdvancedAI: true,
    hasExportPDF: true,
  },
  pro: {
    maxGoals: 999, // unlimited
    maxAccounts: 999, // unlimited
    aiMessagesPerMonth: 200,
    aiReportsPerMonth: 30,
    hasWhatsApp: true,
    hasAdvancedAI: true,
    hasExportPDF: true,
  },
};
