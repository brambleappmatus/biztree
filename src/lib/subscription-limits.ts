import { CalendarType } from "@prisma/client";

export type PlanTier = 'Free' | 'Business' | 'Pro';

export interface PlanLimits {
    maxServices: number;
    maxWorkers: number;
    maxProducts: number;
    allowedCalendarTypes: CalendarType[];
    features: {
        googleCalendar: boolean;
        concurrentBookings: boolean;
        workerSelection: boolean;
        tables: boolean;
        smsReminders: boolean;
        advancedAnalytics: boolean;
    };
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
    Free: {
        maxServices: 3,
        maxWorkers: 0,
        maxProducts: 5,
        allowedCalendarTypes: ['HOURLY_SERVICE'],
        features: {
            googleCalendar: false,
            concurrentBookings: false,
            workerSelection: false,
            tables: false,
            smsReminders: false,
            advancedAnalytics: false,
        }
    },
    Business: {
        maxServices: 1000, // Effectively unlimited
        maxWorkers: 3,
        maxProducts: 20,
        allowedCalendarTypes: ['HOURLY_SERVICE', 'DAILY_RENTAL'],
        features: {
            googleCalendar: true,
            concurrentBookings: true,
            workerSelection: true,
            tables: false,
            smsReminders: false,
            advancedAnalytics: true,
        }
    },
    Pro: {
        maxServices: 1000,
        maxWorkers: 1000,
        maxProducts: 50,
        allowedCalendarTypes: ['HOURLY_SERVICE', 'DAILY_RENTAL', 'TABLE_RESERVATION'],
        features: {
            googleCalendar: true,
            concurrentBookings: true,
            workerSelection: true,
            tables: true,
            smsReminders: true,
            advancedAnalytics: true,
        }
    }
};

export function getPlanLimits(tierName: string | null | undefined): PlanLimits {
    // Default to Free if no tier or unknown tier
    const tier = (tierName || 'Free') as PlanTier;
    return PLAN_LIMITS[tier] || PLAN_LIMITS.Free;
}

export function checkServiceLimit(tierName: string | null | undefined, currentCount: number): boolean {
    const limits = getPlanLimits(tierName);
    return currentCount < limits.maxServices;
}

export function checkWorkerLimit(tierName: string | null | undefined, currentCount: number): boolean {
    const limits = getPlanLimits(tierName);
    return currentCount < limits.maxWorkers;
}

export function checkProductLimit(tierName: string | null | undefined, currentCount: number): boolean {
    const limits = getPlanLimits(tierName);
    return currentCount < limits.maxProducts;
}

export function isFeatureAllowed(
    tierName: string | null | undefined,
    feature: keyof PlanLimits['features'],
    enabledFeatures?: string[]
): boolean {
    // If dynamic features are provided, use them
    if (enabledFeatures) {
        // Map internal feature keys to DB feature keys if they differ
        if (feature === 'tables') {
            return enabledFeatures.includes('calendar_floor_plan');
        }
        return enabledFeatures.includes(feature);
    }

    const limits = getPlanLimits(tierName);
    return limits.features[feature];
}

export function isCalendarTypeAllowed(tierName: string | null | undefined, type: CalendarType): boolean {
    const limits = getPlanLimits(tierName);
    return limits.allowedCalendarTypes.includes(type);
}

export function getRequiredTierForFeature(feature: keyof PlanLimits['features']): PlanTier | null {
    // Check in order: Business first, then Pro
    if (PLAN_LIMITS.Business.features[feature]) {
        return 'Business';
    }
    if (PLAN_LIMITS.Pro.features[feature]) {
        return 'Pro';
    }
    return null; // Feature is free
}

export function getRequiredTierForCalendarType(type: CalendarType): PlanTier | null {
    // Check in order: Business first, then Pro
    if (PLAN_LIMITS.Business.allowedCalendarTypes.includes(type)) {
        return 'Business';
    }
    if (PLAN_LIMITS.Pro.allowedCalendarTypes.includes(type)) {
        return 'Pro';
    }
    return null; // Type is free
}
