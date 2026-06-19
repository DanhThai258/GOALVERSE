// GoalVerse Core Application Controller

import { CARD_THEMES } from './data.js';
import { toggleSound, getSoundStatus, playClick, playSuccess, playFail } from './audio.js';

// Import game initializers
import { initWordle } from './games/wordle.js';
import { initCareer } from './games/career.js';
import { initReveal } from './games/reveal.js';
import { initLogoQuiz } from './games/logo_quiz.js';
import { initQuiz } from './games/quiz.js';
import { initPlayerDb } from './games/player_db.js';

// State
let userState = {
  username: "",
  favClub: "",
  isLoggedIn: false,
  coins: 200,
  xp: 0,
  level: 1,
  activeTheme: "gold",
  ownedThemes: ["gold"],
  lastSpinTime: 0
};

// Simulated leaderboard is replaced by dynamic local profiles database

// Spin rewards
const WHEEL_SECTORS = [
  { label: "+50 Coins", type: "coins", value: 50, color: "#ffe066" },
  { label: "+100 XP", type: "xp", value: 100, color: "#00f0ff" },
  { label: "+100 Coins", type: "coins", value: 100, color: "#ffb703" },
  { label: "Mất lượt!", type: "none", value: 0, color: "#4b5563" },
  { label: "+150 Coins", type: "coins", value: 150, color: "#e09f00" },
  { label: "+200 XP", type: "xp", value: 200, color: "#00cc52" },
  { label: "+300 Coins", type: "coins", value: 300, color: "#ffb703" },
  { label: "JACKPOT!", type: "jackpot", value: 500, color: "#ff007f" }
];

const SPIN_COOLDOWN = 60 * 1000; // 1 minute cooldown for testing convenience

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initRouter();
  initAudio();
  initPlayerDb();
  initWheel();
  updateHeaderUI();
  renderLeaderboard();

  // Initialize games
  initWordle(addRewards);
  initCareer(addRewards, deductCoins, getCoins);
  initReveal(addRewards, deductCoins, getCoins);
  initLogoQuiz(addRewards, deductCoins, getCoins);
  initQuiz(addRewards);

  // Close modals
  document.getElementById('btn-close-levelup').onclick = () => {
    playClick();
    document.getElementById('modal-level-up').classList.remove('active');
  };

  // Login: Handle Club Selection Grid
  let selectedClub = "";
  const clubCards = document.querySelectorAll(".club-select-card");
  clubCards.forEach(card => {
    card.onclick = () => {
      playClick();
      clubCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedClub = card.getAttribute("data-club");
    };
  });

  // Login: Submit Login Form
  const loginSubmitBtn = document.getElementById("btn-login-submit");
  loginSubmitBtn.onclick = () => {
    playClick();
    const usernameInput = document.getElementById("login-username");
    const username = usernameInput.value.trim();

    if (!username) {
      alert("Vui lòng nhập tên người chơi / HLV!");
      return;
    }

    if (!selectedClub) {
      alert("Vui lòng chọn CLB bóng đá yêu thích của bạn!");
      return;
    }

    // Check if player profile already exists in the local leaderboard list
    let localLeaderboard = JSON.parse(localStorage.getItem("goalverse_leaderboard") || "[]");
    let existingProfile = localLeaderboard.find(u => u.name.toLowerCase() === username.toLowerCase());

    if (existingProfile) {
      // Load existing user profile state
      userState = {
        username: existingProfile.name,
        favClub: existingProfile.favClub,
        isLoggedIn: true,
        coins: existingProfile.coins || 200,
        xp: existingProfile.xp || 0,
        level: existingProfile.level || 1,
        activeTheme: existingProfile.activeTheme || "gold",
        ownedThemes: existingProfile.ownedThemes || ["gold"],
        lastSpinTime: existingProfile.lastSpinTime || 0
      };
      alert(`Chào mừng quay trở lại, HLV ${existingProfile.name}! Tiến trình chơi của bạn đã được tải.`);
    } else {
      // Initialize new player profile state
      userState = {
        username: username,
        favClub: selectedClub,
        isLoggedIn: true,
        coins: 200,
        xp: 0,
        level: 1,
        activeTheme: "gold",
        ownedThemes: ["gold"],
        lastSpinTime: 0
      };

      // Add to local database
      localLeaderboard.push({
        name: username,
        level: 1,
        coins: 200,
        xp: 0,
        activeTheme: "gold",
        ownedThemes: ["gold"],
        favClub: selectedClub,
        lastSpinTime: 0
      });
      localStorage.setItem("goalverse_leaderboard", JSON.stringify(localLeaderboard));
      alert(`Khởi tạo hồ sơ HLV ${username} thành công! Chúc bạn chơi game vui vẻ.`);
    }

    saveState();
    playSuccess();

    // Hide login screen, display main dashboard
    document.getElementById("login-screen-overlay").style.display = "none";
    document.querySelector(".app-container").style.display = "flex";

    // Trigger confetti
    triggerConfetti();
    renderLeaderboard();
  };

  // Logout Button
  const logoutBtn = document.getElementById("link-logout");
  if (logoutBtn) {
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      playClick();
      if (confirm("Bạn có chắc chắn muốn đăng xuất? (Tiến trình chơi của bạn vẫn được lưu trên máy này).")) {
        // Just mark active user as logged out, don't clear leaderboard
        userState.isLoggedIn = false;
        localStorage.setItem("goalverse_user_state", JSON.stringify(userState));
        window.location.reload();
      }
    };
  }
});

// Load state from localstorage
function loadState() {
  const data = localStorage.getItem("goalverse_user_state");
  if (data) {
    try {
      userState = { ...userState, ...JSON.parse(data) };
    } catch (e) {
      console.error(e);
    }
  }

  // Toggle Visibility based on Auth Status
  const loginOverlay = document.getElementById("login-screen-overlay");
  const appContainer = document.querySelector(".app-container");

  if (userState.isLoggedIn) {
    loginOverlay.style.display = "none";
    appContainer.style.display = "flex";
  } else {
    loginOverlay.style.display = "flex";
    appContainer.style.display = "none";
  }
}

// Save state
function saveState() {
  localStorage.setItem("goalverse_user_state", JSON.stringify(userState));
  
  // Sync changes to the local leaderboard database
  if (userState.username && userState.isLoggedIn) {
    let localLeaderboard = JSON.parse(localStorage.getItem("goalverse_leaderboard") || "[]");
    let idx = localLeaderboard.findIndex(u => u.name.toLowerCase() === userState.username.toLowerCase());
    
    const profileData = {
      name: userState.username,
      level: userState.level,
      coins: userState.coins,
      xp: userState.xp,
      activeTheme: userState.activeTheme,
      ownedThemes: userState.ownedThemes,
      favClub: userState.favClub,
      lastSpinTime: userState.lastSpinTime
    };

    if (idx !== -1) {
      localLeaderboard[idx] = profileData;
    } else {
      localLeaderboard.push(profileData);
    }
    localStorage.setItem("goalverse_leaderboard", JSON.stringify(localLeaderboard));
  }
  
  updateHeaderUI();
}

function getCoins() {
  return userState.coins;
}

function deductCoins(amount) {
  userState.coins = Math.max(0, userState.coins - amount);
  saveState();
  playClick();
}

// Reward logic
function addRewards(coins, xp) {
  userState.coins += coins;
  userState.xp += xp;

  // Level Up Check
  // Level threshold formula: level * 800
  const xpNeeded = userState.level * 800;
  if (userState.xp >= xpNeeded) {
    userState.xp -= xpNeeded;
    userState.level += 1;
    userState.coins += 100; // thăng cấp thưởng 100 coins
    
    // Level Up Modal
    setTimeout(() => {
      document.getElementById('modal-level-num').textContent = userState.level;
      document.getElementById('modal-level-up').classList.add('active');
      playSuccess();
      triggerConfetti();
    }, 1000);
  }

  saveState();
  renderLeaderboard();
}

// UI Header Updates
function updateHeaderUI() {
  document.getElementById("header-coins").textContent = userState.coins;
  document.getElementById("header-xp").textContent = `${userState.xp} / ${userState.level * 800} XP`;
  document.getElementById("header-level").textContent = userState.level;
  document.getElementById("header-username").textContent = userState.username || "HLV";
  document.getElementById("header-avatar-initial").textContent = userState.username ? userState.username.charAt(0).toUpperCase() : "U";
  
  // Update XP Bar
  const pct = (userState.xp / (userState.level * 800)) * 100;
  document.getElementById("header-xp-bar").style.width = `${pct}%`;

  // Apply card theme to user avatar shell
  const avatarShell = document.getElementById("user-profile-widget").querySelector(".user-avatar-shell");
  const theme = CARD_THEMES.find(t => t.id === userState.activeTheme) || CARD_THEMES[0];
  
  avatarShell.className = "user-avatar-shell"; // Reset
  avatarShell.style.background = theme.bg;
  avatarShell.style.borderColor = theme.id === 'gold' ? '#ffb703' : 'transparent';
  avatarShell.style.backgroundImage = theme.border;

  if (theme.anim === 'rainbow-border') {
    avatarShell.classList.add('rainbow-border');
  } else {
    avatarShell.style.boxShadow = `0 0 10px ${theme.glow}`;
  }
}

// Single Page Application routing
function initRouter() {
  const routes = {
    "dashboard": "view-dashboard",
    "wordle": "view-wordle",
    "career": "view-career",
    "reveal": "view-reveal",
    "logo-quiz": "view-logo-quiz",
    "quiz": "view-quiz",
    "leaderboard": "view-leaderboard",
    "player-db": "view-player-db"
  };

  const handleRoute = () => {
    let hash = window.location.hash.replace("#", "");
    if (!routes[hash]) {
      hash = "dashboard";
    }

    // Toggle View Sections
    Object.values(routes).forEach(viewId => {
      document.getElementById(viewId).classList.remove("active");
    });
    document.getElementById(routes[hash]).classList.add("active");

    // Toggle Navigation links active class
    const menuLinks = document.querySelectorAll(".menu-link");
    menuLinks.forEach(link => link.classList.remove("active"));
    
    const activeLink = document.getElementById(`link-${hash}`);
    if (activeLink) activeLink.classList.add("active");

    // Breadcrumbs
    const titles = {
      "dashboard": "Dashboard",
      "wordle": "Wordle Cầu Thủ",
      "career": "Hành Trình Sự Nghiệp",
      "reveal": "Đoán Cầu Thủ Qua Ảnh",
      "logo-quiz": "Đoán Logo CLB",
      "quiz": "Trắc Nghiệm Bóng Đá",
      "leaderboard": "Bảng Xếp Hạng",
      "player-db": "Tra Cứu Cầu Thủ"
    };
    document.getElementById("header-active-title").textContent = titles[hash] || "GoalVerse";
    
    window.scrollTo(0, 0);
  };

  window.addEventListener("hashchange", handleRoute);
  
  // Set default view on load
  if (!window.location.hash) {
    window.location.hash = "dashboard";
  } else {
    handleRoute();
  }
}

// Audio Control Button
function initAudio() {
  const audioBtn = document.getElementById("btn-audio-toggle");
  if (!audioBtn) return;
  
  const updateIcon = () => {
    const isSound = getSoundStatus();
    audioBtn.innerHTML = isSound ? `<i class="fa-solid fa-volume-high"></i>` : `<i class="fa-solid fa-volume-xmark" style="color: var(--color-danger);"></i>`;
  };

  audioBtn.onclick = () => {
    const isSound = getSoundStatus();
    toggleSound(!isSound);
    playClick();
    updateIcon();
  };

  updateIcon();
}

// Lucky Wheel Canvas & Logic
function initWheel() {
  const canvas = document.getElementById("wheel-canvas");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("btn-spin-wheel");
  const spinStatus = document.getElementById("wheel-spin-status");

  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const r = width / 2 - 10;

  // Draw wheel sectors
  const drawWheel = () => {
    const numSectors = WHEEL_SECTORS.length;
    const arc = (Math.PI * 2) / numSectors;

    ctx.clearRect(0, 0, width, height);

    WHEEL_SECTORS.forEach((sec, idx) => {
      const startAngle = idx * arc;
      const endAngle = startAngle + arc;

      // Draw Sector
      ctx.beginPath();
      ctx.fillStyle = sec.color;
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(10, 14, 22, 0.4)";
      ctx.stroke();

      // Write Reward Labels
      ctx.save();
      ctx.fillStyle = idx === 3 ? "#fff" : "#0a0f16"; // Make timeout label white
      ctx.font = "bold 10px Orbitron";
      ctx.textAlign = "right";
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.fillText(sec.label, r - 15, 4);
      ctx.restore();
    });

    // Outer border
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();
  };

  drawWheel();

  // Cooldown timer update
  const checkCooldown = () => {
    const now = Date.now();
    const timeDiff = now - userState.lastSpinTime;
    
    if (timeDiff < SPIN_COOLDOWN) {
      spinBtn.disabled = true;
      const remainingSec = Math.ceil((SPIN_COOLDOWN - timeDiff) / 1000);
      spinStatus.textContent = `Lượt mới sau: ${remainingSec}s`;
      setTimeout(checkCooldown, 1000);
    } else {
      spinBtn.disabled = false;
      spinStatus.textContent = "Đang sẵn sàng!";
    }
  };

  checkCooldown();

  // Spin Click
  spinBtn.onclick = () => {
    playClick();
    const now = Date.now();
    if (now - userState.lastSpinTime < SPIN_COOLDOWN) return;

    spinBtn.disabled = true;
    spinStatus.textContent = "Đang quay...";

    // Calculate random spin angle
    // At least 4 full circles (1440 deg) + random sector index
    const sectorArc = 360 / WHEEL_SECTORS.length;
    const winningIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    
    // We want the selector (top pointer at 270 deg) to point at winningIndex.
    // Calculations: sector center = winningIndex * sectorArc + sectorArc / 2
    // pointer is at 270 deg.
    // Spin formula:
    const targetAngle = 360 * 5 - (winningIndex * sectorArc + sectorArc / 2) - 90;

    canvas.style.transition = 'transform 4.5s cubic-bezier(0.15, 0.95, 0.3, 1)';
    canvas.style.transform = `rotate(${targetAngle}deg)`;

    userState.lastSpinTime = Date.now();
    saveState();

    setTimeout(() => {
      // Announce Reward
      const reward = WHEEL_SECTORS[winningIndex];
      
      if (reward.type === "coins" || reward.type === "jackpot") {
        userState.coins += reward.value;
        playSuccess();
        alert(`Chúc mừng! Bạn quay vào ô: ${reward.label}. Thưởng +${reward.value} Coins!`);
      } else if (reward.type === "xp") {
        userState.xp += reward.value;
        playSuccess();
        alert(`Chúc mừng! Bạn quay vào ô: ${reward.label}. Thưởng +${reward.value} XP!`);
      } else {
        playFail();
        alert("Rất tiếc! Bạn đã quay vào ô: Mất lượt. Hẹn gặp lại ở lượt sau!");
      }

      // Reset transition and rotation back
      canvas.style.transition = 'none';
      // keep it rotated visually (modulo 360)
      canvas.style.transform = `rotate(${targetAngle % 360}deg)`;

      saveState();
      checkCooldown();
    }, 4600);
  };
}

// Shop Rendering has been replaced by Player Database

// Leaderboard Renders
function renderLeaderboard() {
  const tbody = document.getElementById("leaderboard-tbody");
  tbody.innerHTML = "";

  // Read all local player profiles from localStorage
  const localLeaderboard = JSON.parse(localStorage.getItem("goalverse_leaderboard") || "[]");

  if (localLeaderboard.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="color: var(--color-text-muted); padding: 30px;">
          <i class="fa-solid fa-users-slash" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
          Chưa có tài khoản nào đăng ký trên thiết bị này.
        </td>
      </tr>
    `;
    return;
  }

  // Sort profiles descending by cumulative XP: (Level - 1) * 800 + activeXP
  const sortedList = [...localLeaderboard].sort((a, b) => {
    const totalXPA = ((a.level || 1) - 1) * 800 + (a.xp || 0);
    const totalXPB = ((b.level || 1) - 1) * 800 + (b.xp || 0);
    return totalXPB - totalXPA;
  });

  sortedList.forEach((item, index) => {
    const row = document.createElement("tr");
    const isCurrentActive = userState.username && (item.name.toLowerCase() === userState.username.toLowerCase());
    row.className = `leaderboard-row ${isCurrentActive ? 'user-row' : ''}`;

    const rank = index + 1;
    let rankBadge = rank;
    if (rank === 1) rankBadge = `<span class="rank-badge gold"><i class="fa-solid fa-trophy"></i></span>`;
    else if (rank === 2) rankBadge = `<span class="rank-badge silver">2</span>`;
    else if (rank === 3) rankBadge = `<span class="rank-badge bronze">3</span>`;

    // Get active theme name or styling tag
    const theme = CARD_THEMES.find(t => t.id === item.activeTheme) || CARD_THEMES[0];
    const themeTag = `<span class="badge-tag" style="background: ${theme.border}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; border: 1px solid ${theme.glow || 'rgba(255,255,255,0.1)'};">${theme.name}</span>`;

    // Display "(Bạn)" next to the name if it is the current active player
    const displayName = isCurrentActive ? `${item.name} (Bạn)` : item.name;

    row.innerHTML = `
      <td class="rank-cell">${rankBadge}</td>
      <td>
        <div class="player-cell">
          <div class="player-table-avatar" style="background: ${theme.bg}; color: ${theme.color}; border-color: ${theme.glow};">
            ${item.name.charAt(0)}
          </div>
          <div>
            <span class="player-table-name">${displayName}</span>
            <div style="margin-top: 2px;">${themeTag} <span style="font-size: 9px; color: var(--color-text-muted);">(${item.favClub || 'Chưa chọn CLB'})</span></div>
          </div>
        </div>
      </td>
      <td class="font-numeric" style="font-weight: 700;">LV. ${item.level}</td>
      <td class="font-numeric text-gold"><i class="fa-solid fa-coins"></i> ${item.coins}</td>
      <td class="font-numeric text-secondary">${((item.level || 1) - 1) * 800 + (item.xp || 0)} XP</td>
    `;

    tbody.appendChild(row);
  });
}

function triggerConfetti() {
  const holder = document.getElementById('confetti-holder');
  holder.innerHTML = '';
  const colors = ['#00ff66', '#00f0ff', '#ffd700', '#ff007f', '#ffffff'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.width = Math.random() * 8 + 6 + 'px';
    piece.style.height = Math.random() * 12 + 8 + 'px';
    holder.appendChild(piece);
  }
  setTimeout(() => {
    holder.innerHTML = '';
  }, 3000);
}
