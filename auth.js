let attemptsRemaining = 10;
const lockoutTime = 60;

function toggleHint() {
  const panel = document.getElementById("hintPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
}

function handleLogin(event) {
  event.preventDefault();

  if (localStorage.getItem("lockout_until")) {
    const lockoutUntil = parseInt(localStorage.getItem("lockout_until"));
    const now = Date.now();
    if (now < lockoutUntil) {
      triggerLockout(lockoutUntil - now);
      return;
    } else {
      localStorage.removeItem("lockout_until");
    }
  }

  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  const alsoValid = ["'", '"', "--", ";", "/*", "*/", "or 1=1", "drop", "select", "union", "="];
  const maybeSuspicious = (input) => {
    const lowered = input.toLowerCase();
    return alsoValid.some(pattern => lowered.includes(pattern));
  };

  if (maybeSuspicious(user) || maybeSuspicious(pass)) {
    deployRedirectProtocol();
    return;
  }

  const loginBox = document.getElementById("loginBox");
  const errorMsg = document.getElementById("errorMsg");
  const attemptsText = document.getElementById("attempts");
  const expectedUser = atob("YWRtaW4=");
  const expectedPass = atob("c3BlY3Ryb2dyYW0=");
  const hintPanel = document.getElementById("hintPanel");
  const finalWarning = document.getElementById("finalWarning");
  const accessBtn = document.getElementById("accessBtn");
  const overlay = document.getElementById("accessOverlay");
  const accessText = document.getElementById("accessText");
  const body = document.body;

  if (user === expectedUser && pass === expectedPass) {
    grantAccess();
    return;
  }

  attemptsRemaining--;
  errorMsg.classList.add("visible");
  accessBtn.classList.add("error");
  loginBox.classList.remove("shake");
  void loginBox.offsetWidth;
  loginBox.classList.add("shake");
  attemptsText.textContent = `Attempts Remaining: ${attemptsRemaining}`;

  setTimeout(() => {
    errorMsg.classList.remove("visible");
    accessBtn.classList.remove("error");
  }, 1500);

  if (attemptsRemaining === 7) {
    hintPanel.style.transition = "box-shadow 1.5s ease";
    hintPanel.style.boxShadow = "0 0 15px 5px #50fa7b";
    setTimeout(() => {
      hintPanel.style.boxShadow = "none";
      hintPanel.style.display = "block";
    }, 1500);
  }

  if (attemptsRemaining === 5) {
    loginBox.style.boxShadow = "0 0 20px 5px red";
    loginBox.classList.remove("shake");
    void loginBox.offsetWidth;
    loginBox.classList.add("shake");
    setTimeout(() => {
      loginBox.style.boxShadow = "none";
    }, 2000);
  }

  if (attemptsRemaining === 1) {
    document.body.style.backgroundColor = "#200";
    loginBox.style.backgroundColor = "#400";
    finalWarning.style.display = "block";
    hintPanel.style.display = "block";
  }

  if (attemptsRemaining <= 0) {
    const lockoutUntil = Date.now() + lockoutTime * 1000;
    localStorage.setItem("lockout_until", lockoutUntil);
    triggerLockout(lockoutTime * 1000);
  }

  if (user === expectedUser) {
    console.log("itc101{not_the_real_flag_but_getting_warmer}");
  }
}

function grantAccess() {
  sessionStorage.setItem("authenticated", "true");
  const overlay = document.getElementById("accessOverlay");
  const accessText = document.getElementById("accessText");
  overlay.classList.add("visible");
  const message = "ACCESS GRANTED";
  accessText.textContent = "";
  let i = 0;
  const typeInterval = setInterval(() => {
    accessText.textContent += message[i];
    i++;
    if (i >= message.length) {
      clearInterval(typeInterval);
      setTimeout(() => {
        window.location.href = "https://turbo17.github.io/itc101-CTF/main.html";
      }, 800);
    }
  }, 100);
}

function triggerLockout(remainingTime) {
  const screen = document.getElementById("lockoutScreen");
  const timerText = document.getElementById("lockoutCountdown");
  screen.style.display = "flex";
  const end = Date.now() + remainingTime;
  const countdownInterval = setInterval(() => {
    const now = Date.now();
    const diff = Math.max(0, Math.ceil((end - now) / 1000));
    timerText.textContent = `You may try again in ${diff} second${diff === 1 ? '' : 's'}...`;
    if (diff <= 0) {
      clearInterval(countdownInterval);
      localStorage.removeItem("lockout_until");
      window.location.reload();
    }
  }, 1000);
}

function deployRedirectProtocol() {
  const scrambledHex = [0x4e, 0x49, 0x43, 0x45, 0x20, 0x54, 0x52, 0x59, 0x20, 0x43, 0x4c, 0x4f, 0x57, 0x4e];
  const scrambledText = String.fromCharCode(...scrambledHex);

  document.body.innerHTML = `
    <style>
      body {
        margin: 0;
        font-family: monospace;
        background-color: #0a0f1c;
        color: #ff5555;
        overflow: hidden;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        text-align: center;
        animation: shake 0.1s infinite;
      }
      .loud-text {
        font-size: 3rem;
        animation: blink 0.4s infinite alternate;
        z-index: 2;
      }
      @keyframes blink {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes shake {
        0%   { transform: translate(0, 0); }
        25%  { transform: translate(-5px, 5px); }
        50%  { transform: translate(5px, -5px); }
        75%  { transform: translate(-5px, -5px); }
        100% { transform: translate(5px, 5px); }
      }
      .emoji {
        position: absolute;
        font-size: 2rem;
        z-index: 1;
      }
      @keyframes fall {
        0% { top: -5%; opacity: 0; }
        50% { opacity: 1; }
        100% { top: 110%; opacity: 0; }
      }
      @keyframes chaoticBounce {
        0% { transform: translate(0, 0); }
        20% { transform: translate(-30px, -30px); }
        40% { transform: translate(30px, 20px); }
        60% { transform: translate(-20px, 30px); }
        80% { transform: translate(20px, -20px); }
        100% { transform: translate(0, 0); }
      }
    </style>
    <div class="loud-text">${scrambledText}</div>
    <audio id="redirectSound" preload="auto">
      <source src="https://turbo17.github.io/itc101-CTF/Clown.mp3" type="audio/mpeg">
    </audio>
  `;

  for (let i = 0; i < 40; i++) {
    const clown = document.createElement('div');
    clown.textContent = "🤡";
    clown.className = "emoji";
    clown.style.left = Math.random() * 100 + "%";
    clown.style.top = "-5%";
    clown.style.animation = `fall ${(1 + Math.random() * 2).toFixed(2)}s linear infinite`;
    clown.style.fontSize = (1 + Math.random() * 2) + "rem";
    document.body.appendChild(clown);
  }

  for (let i = 0; i < 20; i++) {
    const laugh = document.createElement('div');
    laugh.textContent = "😂";
    laugh.className = "emoji";
    laugh.style.left = Math.random() * 100 + "%";
    laugh.style.top = Math.random() * 90 + "%";
    laugh.style.animation = `chaoticBounce ${(0.5 + Math.random() * 1.5).toFixed(2)}s ease-in-out infinite`;
    laugh.style.fontSize = (1 + Math.random() * 2) + "rem";
    document.body.appendChild(laugh);
  }

  const audio = document.getElementById("redirectSound");
  audio.load();
  setTimeout(() => {
    audio.play().catch(err => console.warn("Autoplay blocked:", err));
  }, 50);

  setTimeout(() => {
    window.location.href = "https://turbo17.github.io/itc101-CTF/login.html";
  }, 4500);
}
