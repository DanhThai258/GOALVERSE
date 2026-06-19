// GoalVerse Guess the Player via Blurred Card Mini-Game Controller

import { PLAYERS, CARD_THEMES } from '../data.js';
import { playSuccess, playFail, playClick } from '../audio.js';

let targetPlayer = null;
let guessesRemaining = 5;
let gameOver = false;
let unlockedHints = {
  nation: false,
  pos: false,
  league: false,
  club: false
};

// UI Elements
const searchInput = document.getElementById('reveal-search-input');
const submitBtn = document.getElementById('btn-reveal-submit');
const resetBtn = document.getElementById('btn-reveal-reset');
const autocompleteDiv = document.getElementById('reveal-autocomplete-dropdown');
const resultPanel = document.getElementById('reveal-result-panel');
const resultTitle = document.getElementById('reveal-result-title');
const resultDesc = document.getElementById('reveal-result-desc');
const nextBtn = document.getElementById('btn-reveal-next');
const startHintEl = document.getElementById('reveal-start-hint');

const statAttempts = document.getElementById('reveal-stat-attempts');
const statBlur = document.getElementById('reveal-stat-blur');
const statHintsCount = document.getElementById('reveal-stat-hints-count');

// Card elements
const playerCard = document.getElementById('reveal-player-card');
const cardGlow = document.getElementById('reveal-card-glow');
const cardRatingNum = document.getElementById('reveal-card-rating-num');
const cardPosLabel = document.getElementById('reveal-card-pos-label');
const avatarImg = document.getElementById('reveal-avatar-img');
const cardNameLabel = document.getElementById('reveal-card-name-label');
const pillNation = document.getElementById('reveal-pill-nation');
const pillClub = document.getElementById('reveal-pill-club');

// Hint buttons
const btnHintNation = document.getElementById('btn-reveal-hint-nation');
const btnHintPos = document.getElementById('btn-reveal-hint-pos');
const btnHintLeague = document.getElementById('btn-reveal-hint-league');
const btnHintClub = document.getElementById('btn-reveal-hint-club');
const unlockedHintsList = document.getElementById('unlocked-hints-list');

// Callbacks from app.js
let appAddRewards = null;
let appDeductCoins = null;
let appGetCoins = null;

// Blur mapping
const BLUR_STEPS = {
  5: { value: 12, label: "50%" },
  4: { value: 8, label: "35%" },
  3: { value: 5, label: "20%" },
  2: { value: 3, label: "10%" },
  1: { value: 1, label: "5%" },
  0: { value: 0, label: "0%" }
};

export function initReveal(addRewardsFn, deductCoinsFn, getCoinsFn) {
  appAddRewards = addRewardsFn;
  appDeductCoins = deductCoinsFn;
  appGetCoins = getCoinsFn;

  // Listeners
  searchInput.addEventListener('input', handleSearchInput);
  searchInput.addEventListener('focus', handleSearchInput);
  document.addEventListener('click', closeAutocomplete);

  submitBtn.onclick = () => {
    playClick();
    submitGuess();
  };

  resetBtn.onclick = () => {
    playClick();
    startNewGame();
  };

  nextBtn.onclick = () => {
    playClick();
    startNewGame();
  };

  // Hint button clicks
  btnHintNation.onclick = () => { buyHint('nation', 20, btnHintNation); };
  btnHintPos.onclick = () => { buyHint('pos', 20, btnHintPos); };
  btnHintLeague.onclick = () => { buyHint('league', 25, btnHintLeague); };
  btnHintClub.onclick = () => { buyHint('club', 30, btnHintClub); };

  // Enter to submit
  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      submitGuess();
    }
  };

  startNewGame();
}

async function fetchPlayerImage(playerName) {
  // Chiến thuật 1: Truy cập trực tiếp theo tiêu đề có xử lý redirects=1 (cho các tên trùng khớp hoặc chuyển hướng)
  let url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(playerName)}&pithumbsize=300&origin=*&pilicense=any&redirects=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.query && data.query.pages) {
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId !== "-1" && pages[pageId].thumbnail) {
        return pages[pageId].thumbnail.source;
      }
    }
  } catch (e) {
    console.error("Wikipedia direct load failed for:", playerName, e);
  }

  // Chiến thuật 2: Sử dụng Search Generator (tìm kiếm bài viết khớp nhất, giải quyết lỗi thiếu dấu hoặc sai chính tả nhẹ)
  url = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(playerName)}&gsrlimit=1&prop=pageimages&pithumbsize=300&origin=*&pilicense=any&redirects=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.query && data.query.pages) {
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId !== "-1" && pages[pageId].thumbnail) {
        return pages[pageId].thumbnail.source;
      }
    }
  } catch (e) {
    console.error("Wikipedia search query failed for:", playerName, e);
  }

  return null;
}

async function getPlayerPhoto(playerName) {
  let url = await fetchPlayerImage(playerName);
  if (!url) {
    // Thử tìm theo tên không dấu (chuẩn hóa diacritics)
    const normalizedName = playerName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedName !== playerName) {
      url = await fetchPlayerImage(normalizedName);
    }
  }
  return url;
}

function startNewGame() {
  // Select random player
  const randomIndex = Math.floor(Math.random() * PLAYERS.length);
  targetPlayer = PLAYERS[randomIndex];

  guessesRemaining = 5;
  gameOver = false;
  unlockedHints = {
    nation: false,
    pos: false,
    league: false,
    club: false
  };

  // Reset inputs and UI state
  searchInput.value = '';
  searchInput.disabled = false;
  submitBtn.disabled = false;
  resultPanel.style.display = 'none';
  autocompleteDiv.innerHTML = '';
  unlockedHintsList.innerHTML = '';

  // Reset hint buttons
  resetHintButton(btnHintNation, '<span class="hint-label"><i class="fa-solid fa-flag"></i> Quốc tịch</span><span class="hint-cost font-numeric">-20 Coins</span>');
  resetHintButton(btnHintPos, '<span class="hint-label"><i class="fa-solid fa-person-running"></i> Vị trí</span><span class="hint-cost font-numeric">-20 Coins</span>');
  resetHintButton(btnHintLeague, '<span class="hint-label"><i class="fa-solid fa-earth-americas"></i> Giải đấu</span><span class="hint-cost font-numeric">-25 Coins</span>');
  resetHintButton(btnHintClub, '<span class="hint-label"><i class="fa-solid fa-shield-halved"></i> CLB Chủ quản</span><span class="hint-cost font-numeric">-30 Coins</span>');

  // Show loading spinner
  avatarImg.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size: 28px; color: var(--color-primary);"></i>';

  const currentPlayerId = targetPlayer.id;
  getPlayerPhoto(targetPlayer.name).then(imgUrl => {
    if (targetPlayer.id !== currentPlayerId) return;
    if (imgUrl) {
      avatarImg.innerHTML = `<img src="${imgUrl}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">`;
    } else {
      avatarImg.innerHTML = '<i class="fa-solid fa-user-ninja"></i>';
    }
  });

  // Apply card theme to player card
  applyCardTheme();

  // Show starting clue (Position and League)
  const posNames = { GK: "Thủ môn (GK)", DF: "Hậu vệ (DF)", MF: "Tiền vệ (MF)", FW: "Tiền đạo (FW)" };
  startHintEl.innerHTML = `<i class="fa-solid fa-circle-info"></i> Gợi ý xuất phát: Cầu thủ thi đấu ở vị trí <strong>${posNames[targetPlayer.position] || targetPlayer.position}</strong> tại giải <strong>${targetPlayer.league}</strong>.`;

  // Draw masked card info
  updateCardUI();
  updateStatsUI();
}

function resetHintButton(btn, originalHtml) {
  btn.disabled = false;
  btn.innerHTML = originalHtml;
  btn.style.opacity = '1';
}

function getActiveTheme() {
  const data = localStorage.getItem("goalverse_user_state");
  if (data) {
    try {
      const state = JSON.parse(data);
      return state.activeTheme || "gold";
    } catch (e) {}
  }
  return "gold";
}

function applyCardTheme() {
  const activeThemeId = getActiveTheme();
  const theme = CARD_THEMES.find(t => t.id === activeThemeId) || CARD_THEMES[0];

  // Apply styles
  playerCard.className = "reveal-player-card"; // Reset classes
  playerCard.style.background = theme.bg;
  playerCard.style.borderColor = theme.id === 'gold' ? '#ffb703' : 'transparent';
  playerCard.style.backgroundImage = theme.border;
  playerCard.style.color = theme.color;
  playerCard.style.textShadow = theme.txtShadow || 'none';

  if (theme.anim === 'rainbow-border') {
    playerCard.classList.add('rainbow-border');
  } else {
    playerCard.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.5), 0 0 15px ${theme.glow}`;
  }

  // Glow color
  cardGlow.style.boxShadow = `inset 0 0 15px ${theme.glow}`;
}

function updateCardUI() {
  // Rating mask
  cardRatingNum.textContent = gameOver ? targetPlayer.rating : "?";
  
  // Position mask
  cardPosLabel.textContent = (gameOver || unlockedHints.pos) ? targetPlayer.position : "POS";

  // Name mask: replace letters with bullets, preserve spaces
  if (gameOver) {
    cardNameLabel.textContent = targetPlayer.name;
  } else {
    cardNameLabel.textContent = targetPlayer.name
      .split(' ')
      .map(word => '•'.repeat(word.length))
      .join(' ');
  }

  // Pills mask
  pillNation.innerHTML = (gameOver || unlockedHints.nation)
    ? `<i class="fa-solid fa-flag"></i> ${targetPlayer.nationality}`
    : `<i class="fa-solid fa-flag"></i> ???`;

  pillClub.innerHTML = (gameOver || unlockedHints.club)
    ? `<i class="fa-solid fa-shield-halved"></i> ${targetPlayer.club}`
    : `<i class="fa-solid fa-shield-halved"></i> ???`;

  // Apply filter blur
  const currentBlur = gameOver ? 0 : BLUR_STEPS[guessesRemaining].value;
  avatarImg.style.filter = `blur(${currentBlur}px)`;
  avatarImg.style.webkitFilter = `blur(${currentBlur}px)`;
}

function updateStatsUI() {
  statAttempts.textContent = `${guessesRemaining}/5`;
  statBlur.textContent = BLUR_STEPS[guessesRemaining].label;

  let hintsCount = 0;
  if (unlockedHints.nation) hintsCount++;
  if (unlockedHints.pos) hintsCount++;
  if (unlockedHints.league) hintsCount++;
  if (unlockedHints.club) hintsCount++;
  statHintsCount.textContent = `${hintsCount}/4`;
}

function handleSearchInput() {
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

function closeAutocomplete() {
  autocompleteDiv.style.display = 'none';
}

function buyHint(type, cost, btnEl) {
  if (gameOver) return;
  if (unlockedHints[type]) return;

  const currentCoins = appGetCoins ? appGetCoins() : 0;
  if (currentCoins < cost) {
    alert("Bạn không đủ Coins để mua manh mối này! Hãy chơi các trò chơi khác để kiếm thêm.");
    return;
  }

  // Deduct coins
  if (appDeductCoins) {
    appDeductCoins(cost);
  }

  // Unlock hint
  unlockedHints[type] = true;

  // Disable button
  btnEl.disabled = true;
  btnEl.style.opacity = '0.5';
  btnEl.innerHTML = `<span class="hint-label"><i class="fa-solid fa-check"></i> Đã mở</span>`;

  // Display the unlocked hint text
  let hintText = "";
  if (type === 'nation') {
    hintText = `Quốc tịch: <strong>${targetPlayer.nationality}</strong>`;
  } else if (type === 'pos') {
    const posNames = { GK: "Thủ môn (GK)", DF: "Hậu vệ (DF)", MF: "Tiền vệ (MF)", FW: "Tiền đạo (FW)" };
    hintText = `Vị trí thi đấu: <strong>${posNames[targetPlayer.position] || targetPlayer.position}</strong>`;
  } else if (type === 'league') {
    hintText = `Giải đấu: <strong>${targetPlayer.league}</strong>`;
  } else if (type === 'club') {
    hintText = `CLB chủ quản: <strong>${targetPlayer.club}</strong>`;
  }

  const hintItem = document.createElement('div');
  hintItem.className = 'unlocked-hint-item';
  hintItem.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${hintText}</span>`;
  unlockedHintsList.appendChild(hintItem);

  // Update card display
  updateCardUI();
  updateStatsUI();
}

function submitGuess() {
  if (gameOver) return;

  const guessName = searchInput.value.trim();
  const guessedPlayer = PLAYERS.find(p => p.name.toLowerCase() === guessName.toLowerCase());

  if (!guessedPlayer) {
    alert("Vui lòng chọn một cầu thủ hợp lệ trong danh sách gợi ý!");
    return;
  }

  // Clear search box and drop suggestions
  searchInput.value = '';
  autocompleteDiv.style.display = 'none';

  if (guessedPlayer.id === targetPlayer.id) {
    // CORRECT!
    gameOver = true;
    guessesRemaining = Math.max(1, guessesRemaining); // safe fallback
    
    // Reward payout calculation
    const coinsEarned = 150 - (5 - guessesRemaining) * 20;
    const xpEarned = 180;

    if (appAddRewards) {
      appAddRewards(coinsEarned, xpEarned);
    }

    // Reveal completely
    avatarImg.style.filter = "blur(0px)";
    avatarImg.style.webkitFilter = "blur(0px)";
    updateCardUI();

    playSuccess();

    // Show victory panel
    resultTitle.textContent = "ĐOÁN CHÍNH XÁC!";
    resultTitle.className = "text-primary mb-2";
    resultDesc.innerHTML = `Chúc mừng bạn! Cầu thủ bí ẩn chính là <strong>${targetPlayer.name}</strong> (${targetPlayer.club}).<br><span class="text-gold" style="font-weight: 800; font-size: 16px;"><i class="fa-solid fa-coins"></i> +${coinsEarned} Coins | +${xpEarned} XP đã được cộng!</span>`;
    resultPanel.style.display = 'block';

    // Disable input
    searchInput.disabled = true;
    submitBtn.disabled = true;

    triggerConfetti();

  } else {
    // WRONG GUESS
    guessesRemaining--;
    playFail();

    if (guessesRemaining > 0) {
      alert(`Đoán sai rồi! Đó không phải là ${guessedPlayer.name}. Hãy thử lại, ảnh đã bớt mờ hơn!`);
      updateCardUI();
      updateStatsUI();
    } else {
      // GAME OVER
      gameOver = true;
      avatarImg.style.filter = "blur(0px)";
      avatarImg.style.webkitFilter = "blur(0px)";
      updateCardUI();
      updateStatsUI();

      resultTitle.textContent = "HẾT LƯỢT ĐOÁN!";
      resultTitle.className = "text-danger mb-2";
      resultDesc.innerHTML = `Rất tiếc! Bạn đã hết lượt sút. Cầu thủ bí ẩn là <strong>${targetPlayer.name}</strong> (${targetPlayer.club}).`;
      resultPanel.style.display = 'block';

      // Disable input
      searchInput.disabled = true;
      submitBtn.disabled = true;
    }
  }
}

function triggerConfetti() {
  const holder = document.getElementById('confetti-holder');
  if (!holder) return;
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
