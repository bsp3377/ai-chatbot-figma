/**
 * ChatBot AI Widget
 * Embeddable chat widget for websites
 */

interface ChatBotConfig {
    chatbotId: string;
    color?: string;
    position?: 'bottom-right' | 'bottom-left';
    buttonText?: string;
    apiUrl?: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

class ChatBotWidget {
    private config: ChatBotConfig;
    private container: HTMLDivElement | null = null;
    private isOpen: boolean = false;
    private messages: Message[] = [];
    private visitorId: string;

    constructor(config: ChatBotConfig) {
        this.config = {
            color: '#3B82F6',
            position: 'bottom-right',
            buttonText: 'Chat with us',
            apiUrl: 'https://api.chatbotai.com',
            ...config,
        };
        this.visitorId = this.getOrCreateVisitorId();
        this.init();
    }

    private getOrCreateVisitorId(): string {
        let id = localStorage.getItem('chatbot_visitor_id');
        if (!id) {
            id = 'visitor_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('chatbot_visitor_id', id);
        }
        return id;
    }

    private init(): void {
        // Inject styles
        this.injectStyles();

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'chatbot-ai-widget';
        document.body.appendChild(this.container);

        // Render initial state (button only)
        this.render();

        // Add welcome message
        this.messages.push({
            id: '1',
            role: 'assistant',
            content: 'Hi! How can I help you today?',
            timestamp: new Date(),
        });
    }

    private injectStyles(): void {
        const style = document.createElement('style');
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
        height: 500px;
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
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.4;
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
    `;
        document.head.appendChild(style);
    }

    private render(): void {
        if (!this.container) return;

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
              <h3>Support Bot</h3>
              <p>Online</p>
            </div>
            <button class="chatbot-close" id="chatbot-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="chatbot-messages" id="chatbot-messages">
            ${this.messages.map(m => `
              <div class="chatbot-message ${m.role}">${this.escapeHtml(m.content)}</div>
            `).join('')}
          </div>
          <div class="chatbot-input-area">
            <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Type a message..." />
            <button class="chatbot-send" id="chatbot-send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
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
    }

    private attachEventListeners(): void {
        const button = document.getElementById('chatbot-button');
        const closeBtn = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input') as HTMLInputElement;
        const sendBtn = document.getElementById('chatbot-send');

        button?.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            this.render();
            if (this.isOpen) {
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
    }

    private async sendMessage(): Promise<void> {
        const input = document.getElementById('chatbot-input') as HTMLInputElement;
        const content = input?.value.trim();

        if (!content) return;

        // Add user message
        this.messages.push({
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        });

        input.value = '';
        this.render();
        this.scrollToBottom();

        // Show typing indicator
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.insertAdjacentHTML('beforeend', `
        <div class="chatbot-typing" id="chatbot-typing">
          <span></span><span></span><span></span>
        </div>
      `);
            this.scrollToBottom();
        }

        // Simulate API call (replace with real API in production)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Remove typing indicator and add response
        document.getElementById('chatbot-typing')?.remove();

        const responses = [
            "Thanks for your message! I'm here to help with any questions you have.",
            "That's a great question! Let me help you with that.",
            "I understand. Based on your question, here's what I can tell you.",
            "Happy to help! Feel free to ask me anything about our products or services.",
        ];

        this.messages.push({
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
        });

        this.render();
        this.scrollToBottom();
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
    }
}

// Global initialization function
declare global {
    interface Window {
        ChatBotAI: typeof ChatBotWidget;
        cba: (command: string, config?: ChatBotConfig) => void;
    }
}

window.ChatBotAI = ChatBotWidget;

// Simple init function
window.cba = (command: string, config?: ChatBotConfig) => {
    if (command === 'init' && config) {
        new ChatBotWidget(config);
    }
};

export default ChatBotWidget;
