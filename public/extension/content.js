// content.js

// 1. Setup UI Container
const container = document.createElement('div');
container.id = 'fenrir-floating-timer';
document.body.appendChild(container);

// 2. Inject Styles
const style = document.createElement('style');
style.textContent = `
  #fenrir-floating-timer {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    user-select: none;
  }
  .fenrir-glass {
    background: rgba(10, 14, 30, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 28px;
    padding: 20px;
    color: white;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    min-width: 180px;
    animation: fenrir-pop 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
  @keyframes fenrir-pop {
    from { transform: scale(0.8) translateY(20px); opacity: 0; }
    to { transform: scale(1) translateY(0); opacity: 1; }
  }
  .fenrir-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #94a3b8;
    font-weight: 800;
  }
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8B5CF6;
    box-shadow: 0 0 12px #8B5CF6;
  }
  .status-dot.offline {
    background: #475569;
    box-shadow: none;
  }
  #fenrir-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 38px;
    font-weight: 800;
    line-height: 1;
    background: linear-gradient(135deg, #fff 30%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  }
  .login-prompt {
    text-align: center;
  }
  .login-prompt p {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 16px;
    line-height: 1.4;
  }
  .btn-primary {
    background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%);
    border: none;
    color: white;
    padding: 10px 24px;
    border-radius: 14px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
  }
`;
document.head.appendChild(style);

function updateUI(isLoggedIn, timerData = null) {
  if (!isLoggedIn) {
    container.innerHTML = `
            <div class="fenrir-glass">
                <div class="fenrir-header">
                    <span class="status-dot offline"></span>
                    FENRIR FOCUS
                </div>
                <div class="login-prompt">
                    <p>Log in to your dashboard<br/>to start your journey.</p>
                    <a href="http://localhost:9002/login" target="_blank" class="btn-primary">AUTHENTICATE</a>
                </div>
            </div>
        `;
  } else {
    const time = timerData?.time || "00:00";
    const subject = timerData?.subject || "Deep Focus";
    container.innerHTML = `
            <div class="fenrir-glass">
                <div class="fenrir-header">
                    <span class="status-dot"></span>
                    ${subject}
                </div>
                <div id="fenrir-time">${time}</div>
            </div>
        `;
  }
}

// Check auth and update UI
function checkAuth() {
  chrome.storage.local.get(['fenrirAuth'], (result) => {
    updateUI(!!result.fenrirAuth);
  });
}

checkAuth();

// Mock persistence for demo
let duration = 25 * 60;
setInterval(() => {
  chrome.storage.local.get(['fenrirAuth'], (result) => {
    if (result.fenrirAuth) {
      duration--;
      const m = Math.floor(Math.max(0, duration) / 60).toString().padStart(2, '0');
      const s = (Math.max(0, duration) % 60).toString().padStart(2, '0');
      updateUI(true, { time: `${m}:${s}`, subject: 'Cosmic Study' });
    } else {
      updateUI(false);
    }
  });
}, 1000);
