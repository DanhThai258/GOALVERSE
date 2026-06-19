// GoalVerse Wordle Footballer Mini-Game Controller

import { PLAYERS } from '../data.js';
import { playSuccess, playFail, playClick } from '../audio.js';

let targetPlayer = null;
let maxGuesses = 8;
let guesses = [];
let gameOver = false;

// UI Elements
const searchInput = document.getElementById('wordle-search-input');
const submitBtn = document.getElementById('btn-wordle-submit');
const resetBtn = document.getElementById('btn-wordle-reset');
const autocompleteDiv = document.getElementById('wordle-autocomplete-dropdown');
const gridContainer = document.getElementById('wordle-grid-rows');
const resultPanel = document.getElementById('wordle-result-panel');
const resultTitle = document.getElementById('wordle-result-title');
const resultDesc = document.getElementById('wordle-result-desc');

// UI Starting Clues & Hint Buttons
const startHintEl = document.getElementById('wordle-start-hint');
const hint1Btn = document.getElementById('btn-wordle-hint-1');
const hint2Btn = document.getElementById('btn-wordle-hint-2');
const hint3Btn = document.getElementById('btn-wordle-hint-3');
const hint4Btn = document.getElementById('btn-wordle-hint-4');
const hintsText = document.getElementById('wordle-hints-text');

let appAddRewardCallback = null;

export function initWordle(addRewardFn) {
  appAddRewardCallback = addRewardFn;
  
  // Set up listeners
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

  // Hint clicks
  hint1Btn.onclick = () => {
    playClick();
    hintsText.innerHTML = `<i class="fa-solid fa-earth-americas text-gold"></i> GIẢI ĐẤU: Cầu thủ đang thi đấu tại giải <strong>${targetPlayer.league}</strong>.`;
    disableHintBtn(hint1Btn, "Đã hiện giải đấu");
  };

  hint2Btn.onclick = () => {
    playClick();
    hintsText.innerHTML = `<i class="fa-solid fa-clock text-secondary"></i> TUỔI: Cầu thủ bí ẩn năm nay <strong>${targetPlayer.age} tuổi</strong>.`;
    disableHintBtn(hint2Btn, "Đã hiện tuổi");
  };

  hint3Btn.onclick = () => {
    playClick();
    hintsText.innerHTML = `<i class="fa-solid fa-font text-primary"></i> CHỮ CÁI ĐẦU: Tên bắt đầu bằng chữ <strong>"${targetPlayer.name.charAt(0)}"</strong>.`;
    disableHintBtn(hint3Btn, "Đã hiện chữ đầu");
  };

  hint4Btn.onclick = () => {
    playClick();
    hintsText.innerHTML = `<i class="fa-solid fa-shield-halved text-danger"></i> CLB: Cầu thủ đang đá cho <strong>${targetPlayer.club}</strong>.`;
    disableHintBtn(hint4Btn, "Đã hiện CLB");
  };

  // Keyboard navigation
  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      submitGuess();
    }
  };

  startNewGame();
}

function disableHintBtn(btn, text) {
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.innerHTML = `<i class="fa-solid fa-check"></i> ${text}`;
}

function resetHintBtn(btn, initialHtml) {
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.innerHTML = initialHtml;
}

function unlockHintBtn(btn, activeHtml) {
  btn.disabled = false;
  btn.style.opacity = '1';
  btn.innerHTML = activeHtml;
}

function startNewGame() {
  // Select random player
  const randomIndex = Math.floor(Math.random() * PLAYERS.length);
  targetPlayer = PLAYERS[randomIndex];
  guesses = [];
  gameOver = false;

  // Clear inputs and panels
  searchInput.value = '';
  searchInput.disabled = false;
  submitBtn.disabled = false;
  gridContainer.innerHTML = '';
  resultPanel.style.display = 'none';
  autocompleteDiv.innerHTML = '';

  // 1. Render starting clues banner (Position & Nationality)
  const posNames = { GK: "Thủ môn (GK)", DF: "Hậu vệ (DF)", MF: "Tiền vệ (MF)", FW: "Tiền đạo (FW)" };
  startHintEl.innerHTML = `<i class="fa-solid fa-star text-gold"></i> Manh mối ban đầu: Cầu thủ đá vị trí <strong>${posNames[targetPlayer.position] || targetPlayer.position}</strong>, quốc tịch <strong>${targetPlayer.nationality}</strong>.`;

  // 2. Reset Hints Buttons
  resetHintBtn(hint1Btn, '<i class="fa-solid fa-earth-americas"></i> Giải đấu (Lượt 1)');
  resetHintBtn(hint2Btn, '<i class="fa-solid fa-clock"></i> Tuổi tác (Lượt 2)');
  resetHintBtn(hint3Btn, '<i class="fa-solid fa-font"></i> Chữ cái đầu (Lượt 3)');
  resetHintBtn(hint4Btn, '<i class="fa-solid fa-shield-halved"></i> CLB chủ quản (Lượt 4)');
  hintsText.textContent = '';

  // Render empty rows
  for (let i = 0; i < maxGuesses; i++) {
    renderEmptyRow();
  }
}

function renderEmptyRow() {
  const row = document.createElement('div');
  row.className = 'wordle-guess-row';
  
  for (let i = 0; i < 5; i++) {
    const cell = document.createElement('div');
    cell.className = 'wordle-cell';
    row.appendChild(cell);
  }
  
  gridContainer.appendChild(row);
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

function submitGuess() {
  if (gameOver) return;

  const guessName = searchInput.value.trim();
  const guessedPlayer = PLAYERS.find(p => p.name.toLowerCase() === guessName.toLowerCase());

  if (!guessedPlayer) {
    alert("Vui lòng chọn cầu thủ hợp lệ trong danh sách gợi ý!");
    return;
  }

  if (guesses.includes(guessedPlayer.id)) {
    alert("Cầu thủ này đã được đoán rồi!");
    return;
  }

  guesses.push(guessedPlayer.id);
  
  // Replace an empty row with feedback
  const rowIndex = guesses.length - 1;
  const rows = gridContainer.getElementsByClassName('wordle-guess-row');
  if (rowIndex < rows.length) {
    renderFeedbackRow(rows[rowIndex], guessedPlayer);
  }

  searchInput.value = '';
  closeAutocomplete();

  // Update hints buttons unlock state (unlocking on guesses 1, 2, 3, and 4)
  if (guesses.length >= 1 && hint1Btn.disabled && !hint1Btn.innerHTML.includes('Đã hiện')) {
    unlockHintBtn(hint1Btn, '<i class="fa-solid fa-earth-americas"></i> Xem giải đấu');
  }
  if (guesses.length >= 2 && hint2Btn.disabled && !hint2Btn.innerHTML.includes('Đã hiện')) {
    unlockHintBtn(hint2Btn, '<i class="fa-solid fa-clock"></i> Xem tuổi tác');
  }
  if (guesses.length >= 3 && hint3Btn.disabled && !hint3Btn.innerHTML.includes('Đã hiện')) {
    unlockHintBtn(hint3Btn, '<i class="fa-solid fa-font"></i> Xem chữ cái đầu');
  }
  if (guesses.length >= 4 && hint4Btn.disabled && !hint4Btn.innerHTML.includes('Đã hiện')) {
    unlockHintBtn(hint4Btn, '<i class="fa-solid fa-shield-halved"></i> Xem CLB chủ quản');
  }

  // Check Game State
  if (guessedPlayer.id === targetPlayer.id) {
    // Win
    gameOver = true;
    searchInput.disabled = true;
    submitBtn.disabled = true;
    
    // Lock all hints
    hint1Btn.disabled = true;
    hint2Btn.disabled = true;
    hint3Btn.disabled = true;
    hint4Btn.disabled = true;
    
    playSuccess();
    
    // Reward coins & XP
    const coinsReward = Math.max(25, 120 - (guesses.length - 1) * 15);
    const xpReward = 150;
    
    if (appAddRewardCallback) {
      appAddRewardCallback(coinsReward, xpReward);
    }

    resultPanel.style.display = 'block';
    resultPanel.style.borderColor = 'var(--color-primary)';
    resultTitle.innerHTML = `<span class="text-primary"><i class="fa-solid fa-trophy"></i> CHIẾN THẮNG!</span>`;
    resultDesc.innerHTML = `Chính xác! Cầu thủ bí ẩn chính là <strong>${targetPlayer.name}</strong>.<br>Bạn đoán đúng sau <strong>${guesses.length}</strong> lượt sút.<br><span class="text-gold">+${coinsReward} Coins</span> | <span class="text-secondary">+${xpReward} XP</span>`;
    
    triggerConfetti();

  } else if (guesses.length >= maxGuesses) {
    // Lose
    gameOver = true;
    searchInput.disabled = true;
    submitBtn.disabled = true;
    
    hint1Btn.disabled = true;
    hint2Btn.disabled = true;
    hint3Btn.disabled = true;
    hint4Btn.disabled = true;
    
    playFail();

    resultPanel.style.display = 'block';
    resultPanel.style.borderColor = 'var(--color-danger)';
    resultTitle.innerHTML = `<span class="text-danger"><i class="fa-solid fa-circle-xmark"></i> THUA CUỘC</span>`;
    resultDesc.innerHTML = `Bạn đã dùng hết số lượt đoán! Cầu thủ bí ẩn là <strong>${targetPlayer.name}</strong> (${targetPlayer.club}). Hãy thử lại lượt mới nhé.`;
  }
}

function renderFeedbackRow(rowElement, guessed) {
  rowElement.innerHTML = '';

  // 1. Name Cell
  const cellName = createCell(guessed.name, guessed.id === targetPlayer.id ? 'correct' : 'incorrect');
  rowElement.appendChild(cellName);

  // 2. Nationality Cell
  const natCorrect = guessed.nationality === targetPlayer.nationality;
  const cellNat = createCell(guessed.nationality, natCorrect ? 'correct' : 'incorrect');
  rowElement.appendChild(cellNat);

  // 3. Age Cell
  let ageClass = 'incorrect';
  let ageSymbol = '';
  if (guessed.age === targetPlayer.age) {
    ageClass = 'correct';
  } else {
    ageClass = 'incorrect';
    ageSymbol = guessed.age < targetPlayer.age ? ' <i class="fa-solid fa-arrow-up text-primary age-diff"></i>' : ' <i class="fa-solid fa-arrow-down text-danger age-diff"></i>';
  }
  const cellAge = createCell(`${guessed.age}${ageSymbol}`, ageClass);
  rowElement.appendChild(cellAge);

  // 4. Club Cell
  const clubCorrect = guessed.club === targetPlayer.club;
  let clubClass = 'incorrect';
  if (clubCorrect) {
    clubClass = 'correct';
  } else if (guessed.league === targetPlayer.league) {
    clubClass = 'partial';
  }
  const cellClub = createCell(guessed.club, clubClass);
  rowElement.appendChild(cellClub);

  // 5. Position Cell
  const posCorrect = guessed.position === targetPlayer.position;
  const cellPos = createCell(guessed.position, posCorrect ? 'correct' : 'incorrect');
  rowElement.appendChild(cellPos);
}

function createCell(content, typeClass) {
  const cell = document.createElement('div');
  cell.className = `wordle-cell ${typeClass}`;
  cell.innerHTML = content;
  return cell;
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
