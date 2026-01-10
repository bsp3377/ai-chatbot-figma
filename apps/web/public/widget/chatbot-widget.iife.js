var m=Object.defineProperty;var x=(n,o,t)=>o in n?m(n,o,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[o]=t;var c=(n,o,t)=>x(n,typeof o!="symbol"?o+"":o,t);this.ChatBotAI=function(){"use strict";class n{constructor(t){c(this,"config");c(this,"serverConfig",null);c(this,"container",null);c(this,"isOpen",!1);c(this,"isLoading",!1);c(this,"messages",[]);c(this,"visitorId");c(this,"conversationId",null);this.config={color:"#3B82F6",position:"bottom-right",buttonText:"Chat with us",apiUrl:window.location.origin,...t},this.visitorId=this.getOrCreateVisitorId(),this.init()}getOrCreateVisitorId(){const t=`chatbot_visitor_${this.config.chatbotId}`;let e=localStorage.getItem(t);return e||(e="visitor_"+Math.random().toString(36).substring(2,15),localStorage.setItem(t,e)),e}async init(){var e;try{const i=await fetch(`${this.config.apiUrl}/api/widget/config/${this.config.chatbotId}`);i.ok&&(this.serverConfig=await i.json(),this.config.color=this.serverConfig.color,this.config.position=this.serverConfig.position,this.config.buttonText=this.serverConfig.buttonText)}catch(i){console.error("Failed to load chatbot config:",i)}this.injectStyles(),this.container=document.createElement("div"),this.container.id="chatbot-ai-widget",document.body.appendChild(this.container),this.render();const t=((e=this.serverConfig)==null?void 0:e.welcomeMessage)||"Hi! How can I help you today?";this.messages.push({id:"1",role:"assistant",content:t,timestamp:new Date})}injectStyles(){const t=document.getElementById("chatbot-ai-styles");t&&t.remove();const e=document.createElement("style");e.id="chatbot-ai-styles",e.textContent=`
      #chatbot-ai-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: fixed;
        ${this.config.position==="bottom-right"?"right: 20px;":"left: 20px;"}
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
        ${this.config.position==="bottom-right"?"right: 0;":"left: 0;"}
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
      
      @media (max-width: 420px) {
        .chatbot-window {
          width: calc(100vw - 40px);
          height: 70vh;
        }
      }
    `,document.head.appendChild(e)}render(){var e,i,s;if(!this.container)return;const t=((e=this.serverConfig)==null?void 0:e.name)||"Support Bot";this.isOpen?this.container.innerHTML=`
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
              <h3>${this.escapeHtml(t)}</h3>
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
            ${this.messages.map(a=>`
              <div class="chatbot-message ${a.role}">${this.escapeHtml(a.content)}</div>
            `).join("")}
            ${this.isLoading?`
              <div class="chatbot-typing" id="chatbot-typing">
                <span></span><span></span><span></span>
              </div>
            `:""}
          </div>
          ${(s=(i=this.serverConfig)==null?void 0:i.escalation)!=null&&s.enabled?`
          <div class="chatbot-actions">
            <button class="chatbot-action-btn" id="chatbot-escalate">
              💬 Talk to Human
            </button>
          </div>
          `:""}
          <div class="chatbot-input-area">
            <input 
              type="text" 
              class="chatbot-input" 
              id="chatbot-input" 
              placeholder="Type a message..."
              ${this.isLoading?"disabled":""}
            />
            <button class="chatbot-send" id="chatbot-send" ${this.isLoading?"disabled":""}>
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
      `:this.container.innerHTML=`
        <button class="chatbot-button" id="chatbot-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          ${this.config.buttonText}
        </button>
      `,this.attachEventListeners(),this.isOpen&&this.scrollToBottom()}attachEventListeners(){const t=document.getElementById("chatbot-button"),e=document.getElementById("chatbot-close"),i=document.getElementById("chatbot-input"),s=document.getElementById("chatbot-send"),a=document.getElementById("chatbot-escalate");t==null||t.addEventListener("click",()=>{this.isOpen=!this.isOpen,this.render(),this.isOpen&&setTimeout(()=>{var r;(r=document.getElementById("chatbot-input"))==null||r.focus()},100)}),e==null||e.addEventListener("click",()=>{this.isOpen=!1,this.render()}),i==null||i.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),this.sendMessage())}),s==null||s.addEventListener("click",()=>this.sendMessage()),a==null||a.addEventListener("click",()=>this.requestEscalation())}async sendMessage(){var i;const t=document.getElementById("chatbot-input"),e=t==null?void 0:t.value.trim();if(!(!e||this.isLoading)){this.messages.push({id:Date.now().toString(),role:"user",content:e,timestamp:new Date}),t.value="",this.isLoading=!0,this.render();try{const s=await fetch(`${this.config.apiUrl}/api/widget/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chatbotId:this.config.chatbotId,visitorId:this.visitorId,conversationId:this.conversationId,messages:this.messages.map(d=>({role:d.role,content:d.content}))})}),a=s.headers.get("X-Conversation-Id");if(a&&(this.conversationId=a),!s.ok)throw new Error("Chat request failed");const r=(i=s.body)==null?void 0:i.getReader(),p=new TextDecoder;let h="";const g=(Date.now()+1).toString();if(this.messages.push({id:g,role:"assistant",content:"",timestamp:new Date}),this.isLoading=!1,this.render(),r)for(;;){const{done:d,value:b}=await r.read();if(d)break;const f=p.decode(b).split(`
`);for(const l of f)if(l.startsWith("0:"))try{const u=JSON.parse(l.substring(2));h+=u,this.messages[this.messages.length-1].content=h,this.render()}catch{}}}catch(s){console.error("Chat error:",s),this.messages.push({id:(Date.now()+1).toString(),role:"assistant",content:"Sorry, I encountered an error. Please try again.",timestamp:new Date})}this.isLoading=!1,this.render()}}async requestEscalation(){if(!this.conversationId){alert("Please start a conversation first.");return}const t=prompt("Enter your email so we can reach out to you:");if(t)try{await fetch(`${this.config.apiUrl}/api/widget/escalate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationId:this.conversationId,email:t})}),this.messages.push({id:Date.now().toString(),role:"assistant",content:`Thanks! Our team will reach out to you at ${t} shortly.`,timestamp:new Date}),this.render()}catch(e){console.error("Escalation error:",e)}}scrollToBottom(){const t=document.getElementById("chatbot-messages");t&&(t.scrollTop=t.scrollHeight)}escapeHtml(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}open(){this.isOpen=!0,this.render()}close(){this.isOpen=!1,this.render()}destroy(){var t,e;(t=this.container)==null||t.remove(),(e=document.getElementById("chatbot-ai-styles"))==null||e.remove()}}return window.ChatBotAI=n,window.cba=(o,t)=>{o==="init"&&t&&new n(t)},document.addEventListener("DOMContentLoaded",()=>{const o=document.querySelector("script[data-chatbot-id]");if(o){const t=o.getAttribute("data-chatbot-id"),e=o.getAttribute("data-api-url")||window.location.origin;t&&new n({chatbotId:t,apiUrl:e})}}),n}();
