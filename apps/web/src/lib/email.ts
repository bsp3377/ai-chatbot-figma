import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// From email address - update with your verified domain
const FROM_EMAIL = process.env.FROM_EMAIL || 'ChatBot AI <notifications@chatbotai.com>';

/**
 * Send escalation notification email to support team
 */
export async function sendEscalationEmail(options: {
    to: string;
    chatbotName: string;
    visitorEmail: string;
    visitorName?: string;
    conversationId: string;
    messages: Array<{ role: string; content: string; createdAt: string }>;
}) {
    const { to, chatbotName, visitorEmail, visitorName, conversationId, messages } = options;

    const transcript = messages
        .map(m => `${m.role === 'USER' ? '👤 Visitor' : '🤖 Bot'}: ${m.content}`)
        .join('\n\n');

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: `🚨 Human support requested - ${chatbotName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e293b;">Human Support Requested</h2>
                    
                    <p style="color: #475569;">
                        A visitor has requested to speak with a human on your chatbot <strong>${chatbotName}</strong>.
                    </p>
                    
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Visitor:</strong> ${visitorName || 'Unknown'}</p>
                        <p style="margin: 8px 0 0;"><strong>Email:</strong> <a href="mailto:${visitorEmail}">${visitorEmail}</a></p>
                        <p style="margin: 8px 0 0;"><strong>Conversation ID:</strong> ${conversationId}</p>
                    </div>
                    
                    <h3 style="color: #1e293b;">Conversation Transcript</h3>
                    
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
${transcript}
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                        Reply directly to this email to respond to the visitor at ${visitorEmail}.
                    </p>
                </div>
            `,
            replyTo: visitorEmail,
        });

        if (error) {
            console.error('Failed to send escalation email:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Escalation email error:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Send training complete notification email
 */
export async function sendTrainingCompleteEmail(options: {
    to: string;
    chatbotName: string;
    chatbotId: string;
    chunksCreated: number;
    durationMs: number;
    dashboardUrl: string;
}) {
    const { to, chatbotName, chatbotId, chunksCreated, durationMs, dashboardUrl } = options;

    const durationSecs = Math.round(durationMs / 1000);

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: `✅ Training complete - ${chatbotName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #22c55e;">🎉 Training Complete!</h2>
                    
                    <p style="color: #475569;">
                        Your chatbot <strong>${chatbotName}</strong> has finished training and is ready to chat.
                    </p>
                    
                    <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>📚 Knowledge chunks:</strong> ${chunksCreated}</p>
                        <p style="margin: 8px 0 0;"><strong>⏱️ Training time:</strong> ${durationSecs} seconds</p>
                    </div>
                    
                    <a href="${dashboardUrl}/chatbots/${chatbotId}/test" 
                       style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                        Test Your Chatbot →
                    </a>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                        You can also <a href="${dashboardUrl}/chatbots/${chatbotId}/widget">get the embed code</a> to add the chatbot to your website.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Failed to send training email:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Training email error:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Send lead captured notification email
 */
export async function sendLeadCapturedEmail(options: {
    to: string;
    chatbotName: string;
    leadEmail: string;
    leadName?: string;
    leadCompany?: string;
    conversationId?: string;
    dashboardUrl: string;
}) {
    const { to, chatbotName, leadEmail, leadName, leadCompany, conversationId, dashboardUrl } = options;

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: `🎯 New lead captured - ${chatbotName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3B82F6;">New Lead Captured! 🎯</h2>
                    
                    <p style="color: #475569;">
                        A new lead was captured by your chatbot <strong>${chatbotName}</strong>.
                    </p>
                    
                    <div style="background: #eff6ff; border: 1px solid #3B82F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>📧 Email:</strong> <a href="mailto:${leadEmail}">${leadEmail}</a></p>
                        ${leadName ? `<p style="margin: 8px 0 0;"><strong>👤 Name:</strong> ${leadName}</p>` : ''}
                        ${leadCompany ? `<p style="margin: 8px 0 0;"><strong>🏢 Company:</strong> ${leadCompany}</p>` : ''}
                    </div>
                    
                    ${conversationId ? `
                    <a href="${dashboardUrl}/conversations/${conversationId}" 
                       style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                        View Conversation →
                    </a>
                    ` : ''}
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                        This notification was sent from ChatBot AI.
                    </p>
                </div>
            `,
            replyTo: leadEmail,
        });

        if (error) {
            console.error('Failed to send lead email:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Lead email error:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Send training failed notification email
 */
export async function sendTrainingFailedEmail(options: {
    to: string;
    chatbotName: string;
    chatbotId: string;
    error: string;
    dashboardUrl: string;
}) {
    const { to, chatbotName, chatbotId, error: errorMessage, dashboardUrl } = options;

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: `❌ Training failed - ${chatbotName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ef4444;">Training Failed ❌</h2>
                    
                    <p style="color: #475569;">
                        Unfortunately, training for your chatbot <strong>${chatbotName}</strong> encountered an error.
                    </p>
                    
                    <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #dc2626;"><strong>Error:</strong> ${errorMessage}</p>
                    </div>
                    
                    <a href="${dashboardUrl}/chatbots/${chatbotId}/knowledge" 
                       style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                        View Knowledge Base →
                    </a>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                        Please check your data sources and try again. If the problem persists, contact support.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Failed to send training failed email:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Training failed email error:', error);
        return { success: false, error: (error as Error).message };
    }
}
