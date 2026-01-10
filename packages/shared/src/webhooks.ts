import crypto from 'crypto';

// Webhook event types
export const WEBHOOK_EVENT_TYPES = [
    'TRAINING_STARTED',
    'TRAINING_COMPLETE',
    'TRAINING_FAILED',
    'CONVERSATION_NEW',
    'CONVERSATION_ENDED',
    'ESCALATION_REQUESTED',
    'LEAD_CAPTURED',
    'USAGE_WARNING',
] as const;

export type WebhookEventType = typeof WEBHOOK_EVENT_TYPES[number];

// Webhook payload structure
export interface WebhookPayload {
    id: string;
    type: WebhookEventType;
    timestamp: string;
    data: Record<string, unknown>;
}

// Generate a webhook signing secret
export function generateWebhookSecret(): string {
    return 'whsec_' + crypto.randomBytes(24).toString('hex');
}

// Create HMAC-SHA256 signature for webhook payload
export function signWebhookPayload(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return hmac.digest('hex');
}

// Verify webhook signature
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = signWebhookPayload(payload, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// Create a webhook payload with standard structure
export function createWebhookPayload(
    type: WebhookEventType,
    data: Record<string, unknown>
): WebhookPayload {
    return {
        id: `evt_${crypto.randomBytes(12).toString('hex')}`,
        type,
        timestamp: new Date().toISOString(),
        data,
    };
}

// Webhook delivery options
export interface WebhookDeliveryOptions {
    url: string;
    secret: string;
    payload: WebhookPayload;
    timeoutMs?: number;
}

// Webhook delivery result
export interface WebhookDeliveryResult {
    success: boolean;
    statusCode?: number;
    error?: string;
    responseTime?: number;
}

// Deliver a webhook with retry logic
export async function deliverWebhook(
    options: WebhookDeliveryOptions
): Promise<WebhookDeliveryResult> {
    const { url, secret, payload, timeoutMs = 5000 } = options;

    const payloadString = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signaturePayload = `${timestamp}.${payloadString}`;
    const signature = signWebhookPayload(signaturePayload, secret);

    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': `sha256=${signature}`,
                'X-Webhook-Timestamp': timestamp,
                'X-Webhook-Id': payload.id,
            },
            body: payloadString,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseTime = Date.now() - startTime;

        if (response.ok) {
            return {
                success: true,
                statusCode: response.status,
                responseTime,
            };
        }

        return {
            success: false,
            statusCode: response.status,
            error: `HTTP ${response.status}: ${response.statusText}`,
            responseTime,
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: `Request timeout after ${timeoutMs}ms`,
                    responseTime,
                };
            }
            return {
                success: false,
                error: error.message,
                responseTime,
            };
        }

        return {
            success: false,
            error: 'Unknown error occurred',
            responseTime,
        };
    }
}

// Retry configuration
export interface RetryConfig {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
};

// Calculate delay with exponential backoff
export function calculateBackoffDelay(
    attempt: number,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
    const delay = config.baseDelayMs * Math.pow(2, attempt);
    return Math.min(delay, config.maxDelayMs);
}

// Webhook event descriptions for UI
export const WEBHOOK_EVENT_DESCRIPTIONS: Record<WebhookEventType, { label: string; description: string }> = {
    TRAINING_STARTED: {
        label: 'Training Started',
        description: 'Triggered when a chatbot starts training on new content',
    },
    TRAINING_COMPLETE: {
        label: 'Training Complete',
        description: 'Triggered when a chatbot finishes training successfully',
    },
    TRAINING_FAILED: {
        label: 'Training Failed',
        description: 'Triggered when training encounters an error',
    },
    CONVERSATION_NEW: {
        label: 'New Conversation',
        description: 'Triggered when a visitor starts a new chat',
    },
    CONVERSATION_ENDED: {
        label: 'Conversation Ended',
        description: 'Triggered when a conversation is closed',
    },
    ESCALATION_REQUESTED: {
        label: 'Escalation Requested',
        description: 'Triggered when a visitor requests human support',
    },
    LEAD_CAPTURED: {
        label: 'Lead Captured',
        description: 'Triggered when a visitor submits their contact info',
    },
    USAGE_WARNING: {
        label: 'Usage Warning',
        description: 'Triggered when approaching monthly usage limits',
    },
};
