// Plan limits configuration

export const PLAN_LIMITS = {
    FREE: {
        chatbots: 1,
        chatsPerMonth: 50,
        pagesPerSource: 10,
        teamMembers: 1,
        features: {
            customBranding: false,
            apiAccess: false,
            analytics: 'basic',
            leadCapture: true,
            escalation: false,
        },
    },
    STARTER: {
        chatbots: 2,
        chatsPerMonth: 500,
        pagesPerSource: 300,
        teamMembers: 2,
        features: {
            customBranding: false,
            apiAccess: false,
            analytics: 'basic',
            leadCapture: true,
            escalation: false,
        },
    },
    PRO: {
        chatbots: 5,
        chatsPerMonth: 2000,
        pagesPerSource: 1000,
        teamMembers: 5,
        features: {
            customBranding: true,
            apiAccess: false,
            analytics: 'full',
            leadCapture: true,
            escalation: true,
        },
    },
    BUSINESS: {
        chatbots: -1, // unlimited
        chatsPerMonth: 10000,
        pagesPerSource: -1, // unlimited
        teamMembers: 20,
        features: {
            customBranding: true,
            apiAccess: true,
            analytics: 'advanced',
            leadCapture: true,
            escalation: true,
        },
    },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimit(plan: PlanType, key: keyof typeof PLAN_LIMITS.FREE): number {
    const limit = PLAN_LIMITS[plan][key];
    return typeof limit === 'number' ? limit : 0;
}

export function isPlanFeatureEnabled(
    plan: PlanType,
    feature: keyof typeof PLAN_LIMITS.FREE.features
): boolean {
    return !!PLAN_LIMITS[plan].features[feature];
}
