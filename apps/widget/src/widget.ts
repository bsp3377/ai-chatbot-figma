/**
 * ChatBot AI Widget
 * Embeddable chat widget with lead capture, escalation, and real API integration
 */

interface ChatBotConfig {
  chatbotId: string;
  color?: string;
  position?: 'bottom-right' | 'bottom-left';
  buttonText?: string;
  apiUrl?: string;
}

interface ServerConfig {
  id: string;
  name: string;
  welcomeMessage: string;
  color: string;
  position: string;
  buttonText: string;
  leadCapture: {
    enabled: boolean;
    fields: string[];
  };
  escalation: {
    enabled: boolean;
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

class ChatBotWidget {
  private config: ChatBotConfig;
  private serverConfig: ServerConfig | null = null;
  private container: HTMLDivElement | null = null;
  private isOpen: boolean = false;
  private isLoading: boolean = false;
  private showLeadForm: boolean = false;
  private leadSubmitted: boolean = false;
  private leadData: LeadData = {};
  private messages: Message[] = [];
  private visitorId: string;
  private conversationId: string | null = null;

  constructor(config: ChatBotConfig) {
    this.config = {
      color: '#3B82F6',
      position: 'bottom-right',
      buttonText: 'Chat with us',
      apiUrl: window.location.origin,
      ...config,
    };
    this.visitorId = this.getOrCreateVisitorId();
    this.init();
  }

  private getOrCreateVisitorId(): string {
    const key = `chatbot_visitor_${this.config.chatbotId}`;
    let id = localStorage.getItem(key);
    if (!id) {
      id = 'visitor_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(key, id);
    }
    return id;
  }

  private async init(): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/widget/config/${this.config.chatbotId}`
      );
      if (response.ok) {
        this.serverConfig = await response.json();
        this.config.color = this.serverConfig!.color;
        this.config.position = this.serverConfig!.position as 'bottom-right' | 'bottom-left';
        this.config.buttonText = this.serverConfig!.buttonText;

        // Show lead form if enabled and not previously submitted
        const leadKey = `chatbot_lead_${this.config.chatbotId}`;
        this.leadSubmitted = localStorage.getItem(leadKey) === 'true';
        this.showLeadForm = this.serverConfig!.leadCapture?.enabled && !this.leadSubmitted;
      }
    } catch (error) {
      console.error('Failed to load chatbot config:', error);
    }

    this.injectStyles();
    this.container = document.createElement('div');
    this.container.id = 'chatbot-ai-widget';
    document.body.appendChild(this.container);
    this.render();

    const welcomeMessage = this.serverConfig?.welcomeMessage || 'Hi! How can I help you today?';
    this.messages.push({
      id: '1',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    });
  }

  private injectStyles(): void {
    const existingStyle = document.getElementById('chatbot-ai-styles');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement('style');
    style.id = 'chatbot-ai-styles';
    style.textContent = `
      #chatbot-ai-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: fixed;
        ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
        bottom: 20px;
        z-index: 999999;
      }
      
      .chatbot-button {
        background: ${this.config.color};
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .chatbot-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }
      
      .chatbot-window {
        position: absolute;
        bottom: 70px;
        ${this.config.position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
        width: 380px;
        height: 550px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease;
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .chatbot-header {
        background: ${this.config.color};
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .chatbot-avatar {
        width: 40px;
        height: 40px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .chatbot-header-info h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .chatbot-header-info p {
        margin: 2px 0 0;
        font-size: 12px;
        opacity: 0.8;
      }
      
      .chatbot-close {
        margin-left: auto;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        opacity: 0.8;
      }
      
      .chatbot-close:hover {
        opacity: 1;
      }
      
      .chatbot-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .chatbot-message {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }
      
      .chatbot-message.assistant {
        background: #f1f5f9;
        color: #1e293b;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      
      .chatbot-message.user {
        background: ${this.config.color};
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
      
      .chatbot-input-area {
        padding: 12px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 8px;
      }
      
      .chatbot-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        font-size: 14px;
        outline: none;
      }
      
      .chatbot-input:focus {
        border-color: ${this.config.color};
      }
      
      .chatbot-input:disabled {
        background: #f8fafc;
      }
      
      .chatbot-send {
        background: ${this.config.color};
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .chatbot-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .chatbot-typing {
        display: flex;
        gap: 4px;
        padding: 10px 14px;
        background: #f1f5f9;
        border-radius: 16px;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      
      .chatbot-typing span {
        width: 8px;
        height: 8px;
        background: #94a3b8;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
      }
      
      .chatbot-typing span:nth-child(1) { animation-delay: -0.32s; }
      .chatbot-typing span:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      
      .chatbot-actions {
        padding: 8px 12px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      
      .chatbot-action-btn {
        background: transparent;
        border: 1px solid #e2e8f0;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        color: #64748b;
        transition: all 0.2s;
      }
      
      .chatbot-action-btn:hover {
        background: #f1f5f9;
        border-color: ${this.config.color};
        color: ${this.config.color};
      }
      
      .chatbot-powered {
        text-align: center;
        padding: 8px;
        font-size: 11px;
        color: #94a3b8;
      }
      
      .chatbot-powered a {
        color: ${this.config.color};
        text-decoration: none;
      }
      
      /* Lead Form Styles */
      .chatbot-lead-form {
        flex: 1;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .chatbot-lead-form h4 {
        margin: 0;
        font-size: 18px;
        color: #1e293b;
        text-align: center;
      }
      
      .chatbot-lead-form p {
        margin: 0;
        font-size: 14px;
        color: #64748b;
        text-align: center;
      }
      
      .chatbot-form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .chatbot-form-group label {
        font-size: 12px;
        font-weight: 500;
        color: #475569;
      }
      
      .chatbot-form-group input {
        padding: 10px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
      }
      
      .chatbot-form-group input:focus {
        border-color: ${this.config.color};
      }
      
      .chatbot-lead-submit {
        background: ${this.config.color};
        color: white;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 8px;
      }
      
      .chatbot-lead-submit:hover {
        opacity: 0.9;
      }
      
      .chatbot-lead-skip {
        background: none;
        border: none;
        color: #64748b;
        font-size: 12px;
        cursor: pointer;
        text-decoration: underline;
      }
      
      @media (max-width: 420px) {
        .chatbot-window {
          width: calc(100vw - 40px);
          height: 70vh;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private render(): void {
    if (!this.container) return;

    const chatbotName = this.serverConfig?.name || 'Support Bot';

    if (this.isOpen) {
      this.container.innerHTML = `
        <div class="chatbot-window">
          <div class="chatbot-header">
            <div class="chatbot-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="14" rx="2"/>
                <circle cx="9" cy="10" r="2"/>
                <circle cx="15" cy="10" r="2"/>
                <path d="M9 14s1 2 3 2 3-2 3-2"/>
              </svg>
            </div>
            <div class="chatbot-header-info">
              <h3>${this.escapeHtml(chatbotName)}</h3>
              <p>Online</p>
            </div>
            <button class="chatbot-close" id="chatbot-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          ${this.showLeadForm && !this.leadSubmitted ? this.renderLeadForm() : this.renderChat()}
          
          <div class="chatbot-powered">
            Powered by <a href="https://chatbotai.com" target="_blank">ChatBot AI</a>
          </div>
        </div>
        <button class="chatbot-button" id="chatbot-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Close
        </button>
      `;
    } else {
      this.container.innerHTML = `
        <button class="chatbot-button" id="chatbot-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          ${this.config.buttonText}
        </button>
      `;
    }

    this.attachEventListeners();
    if (this.isOpen && !this.showLeadForm) {
      this.scrollToBottom();
    }
  }

  private renderLeadForm(): string {
    return `
      <div class="chatbot-lead-form">
        <h4>👋 Before we chat</h4>
        <p>Tell us a bit about yourself so we can help you better.</p>
        
        <div class="chatbot-form-group">
          <label for="lead-name">Name</label>
          <input type="text" id="lead-name" placeholder="Your name" />
        </div>
        
        <div class="chatbot-form-group">
          <label for="lead-email">Email *</label>
          <input type="email" id="lead-email" placeholder="you@example.com" required />
        </div>
        
        <div class="chatbot-form-group">
          <label for="lead-company">Company</label>
          <input type="text" id="lead-company" placeholder="Your company" />
        </div>
        
        <button class="chatbot-lead-submit" id="lead-submit">Start Chat</button>
        <button class="chatbot-lead-skip" id="lead-skip">Skip for now</button>
      </div>
    `;
  }

  private renderChat(): string {
    return `
      <div class="chatbot-messages" id="chatbot-messages">
        ${this.messages.map(m => `
          <div class="chatbot-message ${m.role}">${this.escapeHtml(m.content)}</div>
        `).join('')}
        ${this.isLoading ? `
          <div class="chatbot-typing" id="chatbot-typing">
            <span></span><span></span><span></span>
          </div>
        ` : ''}
      </div>
      ${this.serverConfig?.escalation?.enabled ? `
      <div class="chatbot-actions">
        <button class="chatbot-action-btn" id="chatbot-escalate">
          💬 Talk to Human
        </button>
      </div>
      ` : ''}
      <div class="chatbot-input-area">
        <input 
          type="text" 
          class="chatbot-input" 
          id="chatbot-input" 
          placeholder="Type a message..."
          ${this.isLoading ? 'disabled' : ''}
        />
        <button class="chatbot-send" id="chatbot-send" ${this.isLoading ? 'disabled' : ''}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    `;
  }

  private attachEventListeners(): void {
    const button = document.getElementById('chatbot-button');
    const closeBtn = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input') as HTMLInputElement;
    const sendBtn = document.getElementById('chatbot-send');
    const escalateBtn = document.getElementById('chatbot-escalate');
    const leadSubmit = document.getElementById('lead-submit');
    const leadSkip = document.getElementById('lead-skip');

    button?.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.render();
      if (this.isOpen && !this.showLeadForm) {
        setTimeout(() => {
          document.getElementById('chatbot-input')?.focus();
        }, 100);
      }
    });

    closeBtn?.addEventListener('click', () => {
      this.isOpen = false;
      this.render();
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    sendBtn?.addEventListener('click', () => this.sendMessage());
    escalateBtn?.addEventListener('click', () => this.requestEscalation());
    leadSubmit?.addEventListener('click', () => this.submitLeadForm());
    leadSkip?.addEventListener('click', () => this.skipLeadForm());
  }

  private async submitLeadForm(): Promise<void> {
    const nameInput = document.getElementById('lead-name') as HTMLInputElement;
    const emailInput = document.getElementById('lead-email') as HTMLInputElement;
    const companyInput = document.getElementById('lead-company') as HTMLInputElement;

    const email = emailInput?.value.trim();
    if (!email) {
      emailInput?.focus();
      return;
    }

    this.leadData = {
      name: nameInput?.value.trim() || undefined,
      email,
      company: companyInput?.value.trim() || undefined,
    };

    // Submit lead data to API
    try {
      await fetch(`${this.config.apiUrl}/api/widget/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: this.config.chatbotId,
          visitorId: this.visitorId,
          conversationId: this.conversationId,
          ...this.leadData,
        }),
      });
    } catch (error) {
      console.error('Lead submission error:', error);
    }

    // Mark as submitted
    this.leadSubmitted = true;
    this.showLeadForm = false;
    localStorage.setItem(`chatbot_lead_${this.config.chatbotId}`, 'true');

    // Add personalized welcome
    if (this.leadData.name) {
      this.messages[0].content = `Hi ${this.leadData.name}! How can I help you today?`;
    }

    this.render();
    setTimeout(() => {
      document.getElementById('chatbot-input')?.focus();
    }, 100);
  }

  private skipLeadForm(): void {
    this.showLeadForm = false;
    this.render();
    setTimeout(() => {
      document.getElementById('chatbot-input')?.focus();
    }, 100);
  }

  private async sendMessage(): Promise<void> {
    const input = document.getElementById('chatbot-input') as HTMLInputElement;
    const content = input?.value.trim();

    if (!content || this.isLoading) return;

    this.messages.push({
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    });

    input.value = '';
    this.isLoading = true;
    this.render();

    try {
      const response = await fetch(`${this.config.apiUrl}/api/widget/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: this.config.chatbotId,
          visitorId: this.visitorId,
          conversationId: this.conversationId,
          messages: this.messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const newConversationId = response.headers.get('X-Conversation-Id');
      if (newConversationId) {
        this.conversationId = newConversationId;

        // Submit lead data with conversation if we have it
        if (this.leadData.email && !this.leadSubmitted) {
          await fetch(`${this.config.apiUrl}/api/widget/lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatbotId: this.config.chatbotId,
              conversationId: this.conversationId,
              ...this.leadData,
            }),
          });
          this.leadSubmitted = true;
        }
      }

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      const assistantMsgId = (Date.now() + 1).toString();
      this.messages.push({
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      });
      this.isLoading = false;
      this.render();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.substring(2));
                assistantMessage += text;
                this.messages[this.messages.length - 1].content = assistantMessage;
                this.render();
              } catch {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      this.messages.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      });
    }

    this.isLoading = false;
    this.render();
  }

  private async requestEscalation(): Promise<void> {
    let email = this.leadData.email;

    if (!email) {
      email = prompt('Enter your email so we can reach out to you:') || undefined;
      if (!email) return;
    }

    try {
      await fetch(`${this.config.apiUrl}/api/widget/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: this.conversationId,
          email,
          name: this.leadData.name,
        }),
      });

      this.messages.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Thanks! Our team will reach out to you at ${email} shortly.`,
        timestamp: new Date(),
      });
      this.render();
    } catch (error) {
      console.error('Escalation error:', error);
    }
  }

  private scrollToBottom(): void {
    const container = document.getElementById('chatbot-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  public open(): void {
    this.isOpen = true;
    this.render();
  }

  public close(): void {
    this.isOpen = false;
    this.render();
  }

  public destroy(): void {
    this.container?.remove();
    document.getElementById('chatbot-ai-styles')?.remove();
  }
}

// Global initialization
declare global {
  interface Window {
    ChatBotAI: typeof ChatBotWidget;
    cba: (command: string, config?: ChatBotConfig) => void;
  }
}

window.ChatBotAI = ChatBotWidget;

window.cba = (command: string, config?: ChatBotConfig) => {
  if (command === 'init' && config) {
    new ChatBotWidget(config);
  }
};

// Auto-init from script tag
document.addEventListener('DOMContentLoaded', () => {
  const script = document.querySelector('script[data-chatbot-id]') as HTMLScriptElement;
  if (script) {
    const chatbotId = script.getAttribute('data-chatbot-id');
    const apiUrl = script.getAttribute('data-api-url') || window.location.origin;
    if (chatbotId) {
      new ChatBotWidget({ chatbotId, apiUrl });
    }
  }
});

export default ChatBotWidget;
