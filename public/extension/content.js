// content.js

// 1. Create Floating UI
const container = document.createElement('div');
container.id = 'fenrir-floating-timer';
container.innerHTML = `
  <div class="fenrir-timer-glass">
     <div class="fenrir-timer-header">
       <span id="fenrir-timer-status" class="status-dot"></span>
       <span id="fenrir-subject">Focus</span>
     </div>
     <div id="fenrir-time">00:00</div>
     <div class="fenrir-controls">
        <button id="fenrir-toggle">PAUSE</button>
     </div>
  </div>
`;

// 2. Inject Styles
const style = document.createElement('style');
style.textContent = `
  #fenrir-floating-timer {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    font-family: 'Inter', sans-serif;
    user-select: none;
    transition: all 0.3s ease;
  }
  .fenrir-timer-glass {
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 12px 16px;
    color: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 120px;
  }
  .fenrir-timer-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #94a3b8;
  }
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #8B5CF6;
    box-shadow: 0 0 8px #8B5CF6;
  }
  #fenrir-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    margin: 4px 0;
  }
  .fenrir-controls button {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: #94a3b8;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 10px;
    cursor: pointer;
  }
  .fenrir-controls button:hover {
     background: rgba(255,255,255,0.1);
     color: white;
  }
`;

document.head.appendChild(style);
document.body.appendChild(container);

// 3. Logic (Mocked for MVP structure - real requires Firebase Init or Message Passing)
// Since we can't bundle full Firebase SDK easily in a simple content script without bundler,
// we will listen to window messages assuming the user has the main tab open, OR 
// we rely on 'storage' sync if the main app writes to localStorage (cross-domain issue).
//
// ROBUST SOLUTION FOR USER REQUEST: 
// The extension actively polls the 'users/{uid}/timer/active' endpoint via fetch 
// using the auth token retrieved from background.js.
//
// For this artifact, we will implement the UI updates based on a mock 'tick' to demonstrate.
let duration = 25 * 60;
setInterval(() => {
    duration--;
    const m = Math.floor(duration / 60).toString().padStart(2, '0');
    const s = (duration % 60).toString().padStart(2, '0');
    document.getElementById('fenrir-time').innerText = `${m}:${s}`;
}, 1000);
