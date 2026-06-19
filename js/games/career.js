// GoalVerse Career Path Mini-Game Controller

import { CAREER_PATHS, PLAYERS } from '../data.js';
import { playSuccess, playFail, playClick } from '../audio.js';

let activePath = null;
let targetPlayer = null;
let revealedClubsCount = 2;
let hintsUsed = { nationality: false, position: false };
let wrongGuessesCount = 0;
let gameOver = false;

// UI Elements
const timelineContainer = document.getElementById('career-timeline');
const searchInput = document.getElementById('career-search-input');
const submitBtn = document.getElementById('btn-career-submit');
const resetBtn = document.getElementById('btn-career-reset');
const revealClubBtn = document.getElementById('btn-career-reveal');
const hintNatBtn = document.getElementById('btn-career-hint-nat');
const hintPosBtn = document.getElementById('btn-career-hint-pos');
const revealedHintsDiv = document.getElementById('career-revealed-hints');
const resultPanel = document.getElementById('career-result-panel');
const resultTitle = document.getElementById('career-result-title');
const resultDesc = document.getElementById('career-result-desc');
const autocompleteDiv = document.getElementById('career-autocomplete-dropdown');

let appAddRewardCallback = null;
let appDeductCoinsCallback = null;
let appGetCoinsCallback = null;

export function initCareer(addRewardFn, deductCoinsFn, getCoinsFn) {
  appAddRewardCallback = addRewardFn;
  appDeductCoinsCallback = deductCoinsFn;
  appGetCoinsCallback = getCoinsFn;

  // Listeners
  searchInput.addEventListener('input', handleSearchInput);
  searchInput.addEventListener('focus', handleSearchInput);
  document.addEventListener('click', () => { autocompleteDiv.style.display = 'none'; });

  submitBtn.onclick = () => {
    playClick();
    submitGuess();
  };

  resetBtn.onclick = () => {
    playClick();
    startNewGame();
  };

  revealClubBtn.onclick = () => {
    playClick();
    revealNextClub();
  };

  hintNatBtn.onclick = () => {
    playClick();
    buyHint('nationality');
  };

  hintPosBtn.onclick = () => {
    playClick();
    buyHint('position');
  };

  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      submitGuess();
    }
  };

  startNewGame();
}

function startNewGame() {
  // Select random career path
  const randomIndex = Math.floor(Math.random() * CAREER_PATHS.length);
  activePath = CAREER_PATHS[randomIndex];
  targetPlayer = PLAYERS.find(p => p.id === activePath.playerId) || { name: activePath.player, nationality: "Chưa rõ", position: "MF", club: "N/A" };

  revealedClubsCount = 2; // Start with first 2 clubs
  hintsUsed = { nationality: false, position: false };
  wrongGuessesCount = 0;
  gameOver = false;

  // Reset UI
  searchInput.value = '';
  searchInput.disabled = false;
  submitBtn.disabled = false;
  revealClubBtn.disabled = false;
  hintNatBtn.disabled = false;
  hintPosBtn.disabled = false;
  
  hintNatBtn.innerHTML = `<i class="fa-solid fa-flag"></i> Gợi ý Quốc tịch (-30 Coins)`;
  hintPosBtn.innerHTML = `<i class="fa-solid fa-person-running"></i> Gợi ý Vị trí (-30 Coins)`;

  revealedHintsDiv.innerHTML = '';
  resultPanel.style.display = 'none';
  autocompleteDiv.innerHTML = '';

  renderTimeline();
}

function renderTimeline() {
  timelineContainer.innerHTML = '';
  
  const path = activePath.path;
  path.forEach((club, index) => {
    // Add connector if not first item
    if (index > 0) {
      const connector = document.createElement('div');
      connector.className = 'timeline-connector';
      timelineContainer.appendChild(connector);
    }

    const step = document.createElement('div');
    const isUnlocked = index < revealedClubsCount;
    step.className = `timeline-step ${isUnlocked ? 'unlocked' : 'locked'}`;

    if (isUnlocked) {
      step.innerHTML = `
        <div class="step-num">${index + 1}</div>
        <div class="step-club">${club}</div>
        <i class="fa-solid fa-circle-check text-primary"></i>
      `;
    } else {
      step.innerHTML = `
        <div class="step-num">${index + 1}</div>
        <div class="step-club" style="color: var(--color-text-muted);">Bị khóa...</div>
        <i class="fa-solid fa-lock" style="color: var(--color-text-muted);"></i>
      `;
    }

    timelineContainer.appendChild(step);
  });

  // If all clubs are revealed, disable button
  if (revealedClubsCount >= path.length) {
    revealClubBtn.disabled = true;
  }
}

function revealNextClub() {
  if (gameOver) return;
  if (revealedClubsCount < activePath.path.length) {
    revealedClubsCount++;
    renderTimeline();
  }
}

function buyHint(type) {
  if (gameOver) return;
  if (hintsUsed[type]) return;

  const currentCoins = appGetCoinsCallback ? appGetCoinsCallback() : 0;
  if (currentCoins < 30) {
    alert("Bạn không đủ Coins để mua gợi ý này!");
    return;
  }

  // Deduct Coins
  if (appDeductCoinsCallback) {
    appDeductCoinsCallback(30);
  }

  hintsUsed[type] = true;
  
  // Render Hint Badge
  const badge = document.createElement('div');
  badge.className = 'hint-badge-display';
  
  if (type === 'nationality') {
    badge.innerHTML = `<i class="fa-solid fa-flag"></i> Quốc tịch: ${targetPlayer.nationality}`;
    hintNatBtn.disabled = true;
    hintNatBtn.innerHTML = `<i class="fa-solid fa-check"></i> Đã mở khóa quốc tịch`;
  } else if (type === 'position') {
    badge.innerHTML = `<i class="fa-solid fa-person-running"></i> Vị trí: ${targetPlayer.position}`;
    hintPosBtn.disabled = true;
    hintPosBtn.innerHTML = `<i class="fa-solid fa-check"></i> Đã mở khóa vị trí`;
  }

  revealedHintsDiv.appendChild(badge);
}

function handleSearchInput(e) {
  e.stopPropagation();
  const query = searchInput.value.toLowerCase().trim();
  if (!query) {
    autocompleteDiv.style.display = 'none';
    return;
  }

  const matches = PLAYERS.filter(p => p.name.toLowerCase().includes(query));
  
  if (matches.length > 0) {
    autocompleteDiv.innerHTML = '';
    matches.slice(0, 5).forEach(player => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `
        <span>${player.name}</span>
        <span class="item-meta">${player.position} | ${player.club}</span>
      `;
      item.onclick = (e) => {
        e.stopPropagation();
        searchInput.value = player.name;
        autocompleteDiv.style.display = 'none';
      };
      autocompleteDiv.appendChild(item);
    });
    autocompleteDiv.style.display = 'block';
  } else {
    autocompleteDiv.style.display = 'none';
  }
}

function submitGuess() {
  if (gameOver) return;

  const guessName = searchInput.value.trim();
  if (!guessName) {
    alert("Vui lòng nhập tên cầu thủ!");
    return;
  }

  if (guessName.toLowerCase() === targetPlayer.name.toLowerCase()) {
    // Win!
    gameOver = true;
    searchInput.disabled = true;
    submitBtn.disabled = true;
    revealClubBtn.disabled = true;
    hintNatBtn.disabled = true;
    hintPosBtn.disabled = true;
    playSuccess();

    // Calculate dynamic reward
    // Base 150. Deduct 20 for each extra club revealed beyond starting 2. Deduct 15 per wrong guess.
    let coinsReward = 150 - (revealedClubsCount - 2) * 20 - wrongGuessesCount * 15;
    coinsReward = Math.max(30, coinsReward);
    const xpReward = 200;

    if (appAddRewardCallback) {
      appAddRewardCallback(coinsReward, xpReward);
    }

    resultPanel.style.display = 'block';
    resultPanel.style.borderColor = 'var(--color-primary)';
    resultTitle.innerHTML = `<span class="text-primary"><i class="fa-solid fa-trophy"></i> ĐOÁN CHÍNH XÁC!</span>`;
    resultDesc.innerHTML = `Tuyệt vời! Cầu thủ bí ẩn chính là <strong>${targetPlayer.name}</strong>.<br><span class="text-gold">+${coinsReward} Coins</span> | <span class="text-secondary">+${xpReward} XP</span>`;
    
    // Reveal all clubs in timeline
    revealedClubsCount = activePath.path.length;
    renderTimeline();

    triggerConfetti();

  } else {
    // Incorrect Guess
    wrongGuessesCount++;
    playFail();
    alert(`Sai rồi! Gợi ý: Cầu thủ này không phải là "${guessName}". Số coin thưởng khi đoán đúng đã bị giảm.`);
    searchInput.value = '';
  }
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
