// GoalVerse Football Quiz Mini-Game Controller

import { QUIZZES } from '../data.js';
import { playSuccess, playFail, playClick } from '../audio.js';

let activeQuestions = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let correctAnswersCount = 0;
let selectedLevel = 1;
let levelTimeLimits = {
  1: 200, // 20.0 seconds
  2: 150, // 15.0 seconds
  3: 120, // 12.0 seconds
  4: 100, // 10.0 seconds
  5: 70   // 7.0 seconds
};
let timerVal = 150;
let timerInterval = null;
let isAnswered = false;

// UI Panels
const levelSelectionDiv = document.getElementById('quiz-level-selection');
const levelsGrid = document.getElementById('quiz-levels-grid');
const gameplayContainer = document.getElementById('quiz-gameplay-container');

// HUD Elements
const questionCounter = document.getElementById('quiz-question-counter');
const timerBar = document.getElementById('quiz-timer-bar');
const currentLevelName = document.getElementById('quiz-current-level-name');
const currentScoreVal = document.getElementById('quiz-current-score');
const currentStreakVal = document.getElementById('quiz-current-streak');

// Game Board Elements
const quizBoard = document.getElementById('quiz-board');
const questionText = document.getElementById('quiz-question-text');
const optionsContainer = document.getElementById('quiz-options-container');

// Summary Panel Elements
const summaryPanel = document.getElementById('quiz-summary-panel');
const summaryIcon = document.getElementById('quiz-summary-icon');
const summaryTitle = document.getElementById('quiz-summary-title');
const summaryResultText = document.getElementById('quiz-summary-result-text');
const summaryCorrect = document.getElementById('quiz-summary-correct');
const summaryXp = document.getElementById('quiz-summary-xp');
const summaryCoins = document.getElementById('quiz-summary-coins');

// Buttons
const exitBtn = document.getElementById('btn-quiz-exit');
const retryBtn = document.getElementById('btn-quiz-retry');
const backBtn = document.getElementById('btn-quiz-back');

let appAddRewardCallback = null;

const LEVEL_NAMES = {
  1: "HLV Tập Sự",
  2: "HLV Nghiệp Dư",
  3: "HLV Chuyên Nghiệp",
  4: "HLV Đỉnh Cao",
  5: "HLV Huyền Thoại"
};

const DIFFICULTY_LABELS = {
  1: { text: "Dễ - 20s", class: "easy" },
  2: { text: "Vừa - 15s", class: "medium" },
  3: { text: "Khó - 12s", class: "hard" },
  4: { text: "Rất Khó - 10s", class: "expert" },
  5: { text: "Huyền Thoại - 7s", class: "legend" }
};

export function initQuiz(addRewardFn) {
  appAddRewardCallback = addRewardFn;

  // Bind controls
  backBtn.onclick = () => {
    playClick();
    showLevelSelection();
  };

  exitBtn.onclick = () => {
    playClick();
    showLevelSelection();
  };

  retryBtn.onclick = () => {
    playClick();
    startNewQuiz(selectedLevel);
  };

  showLevelSelection();
}

function getUnlockedLevel() {
  const data = localStorage.getItem("goalverse_user_state");
  if (data) {
    try {
      const state = JSON.parse(data);
      return state.quizUnlockedLevel || 1;
    } catch (e) {
      console.error("Error reading unlocked level:", e);
    }
  }
  return 1;
}

function saveUnlockedLevel(levelToUnlock) {
  const data = localStorage.getItem("goalverse_user_state");
  if (data) {
    try {
      const state = JSON.parse(data);
      state.quizUnlockedLevel = Math.max(state.quizUnlockedLevel || 1, levelToUnlock);
      localStorage.setItem("goalverse_user_state", JSON.stringify(state));

      // Sync to local leaderboard database
      const leaderboardData = localStorage.getItem("goalverse_leaderboard");
      if (leaderboardData && state.username) {
        const leaderboard = JSON.parse(leaderboardData);
        const idx = leaderboard.findIndex(u => u.name.toLowerCase() === state.username.toLowerCase());
        if (idx !== -1) {
          leaderboard[idx].quizUnlockedLevel = state.quizUnlockedLevel;
          localStorage.setItem("goalverse_leaderboard", JSON.stringify(leaderboard));
        }
      }

      // Dispatch event to sync UI in app.js if needed
      window.dispatchEvent(new Event('goalverse_state_changed'));
    } catch (e) {
      console.error("Error saving unlocked level:", e);
    }
  }
}

function showLevelSelection() {
  clearInterval(timerInterval);
  levelSelectionDiv.style.display = 'block';
  gameplayContainer.style.display = 'none';

  renderLevelGrid();
}

function renderLevelGrid() {
  levelsGrid.innerHTML = '';
  const unlockedLevel = getUnlockedLevel();

  for (let lvl = 1; lvl <= 5; lvl++) {
    const isLocked = lvl > unlockedLevel;
    const isPassed = lvl < unlockedLevel;

    const card = document.createElement('div');
    card.className = `quiz-level-card ${isLocked ? 'locked' : ''}`;

    let statusText = "Đang chơi";
    let statusClass = "status";
    if (isLocked) {
      statusText = '<i class="fa-solid fa-lock"></i> Đã khóa';
    } else if (isPassed) {
      statusText = '<i class="fa-solid fa-circle-check"></i> Hoàn thành';
      statusClass = "status passed";
    }

    const diff = DIFFICULTY_LABELS[lvl];

    card.innerHTML = `
      <div class="quiz-level-info">
        <div class="quiz-level-title">
          <span>Cấp độ ${lvl}: ${LEVEL_NAMES[lvl]}</span>
        </div>
        <div class="quiz-level-meta">
          <span class="level-badge ${diff.class}">${diff.text}</span>
          <span class="level-badge ${statusClass}">${statusText}</span>
        </div>
      </div>
      <div class="quiz-level-action">
        <button class="btn ${isLocked ? 'btn-secondary' : 'btn-primary'} btn-play-level" ${isLocked ? 'disabled' : ''}>
          ${isLocked ? 'ĐÃ KHÓA' : 'BẮT ĐẦU'}
        </button>
      </div>
    `;

    // Click to start
    if (!isLocked) {
      const playBtn = card.querySelector('.btn-play-level');
      playBtn.onclick = () => {
        playClick();
        startNewQuiz(lvl);
      };
    }

    levelsGrid.appendChild(card);
  }
}

function startNewQuiz(levelNum) {
  selectedLevel = levelNum;

  // Filter 10 questions for the selected level
  const filteredQuestions = QUIZZES.filter(q => q.level === levelNum);
  
  // Shuffle questions to ensure diversity and no repetitive sequences
  const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
  
  // Take up to 10 questions
  activeQuestions = shuffled.slice(0, 10);

  currentIndex = 0;
  score = 0;
  streak = 0;
  correctAnswersCount = 0;
  isAnswered = false;

  // Toggle view panels
  levelSelectionDiv.style.display = 'none';
  gameplayContainer.style.display = 'block';
  quizBoard.style.display = 'block';
  summaryPanel.style.display = 'none';

  // HUD Update
  currentLevelName.textContent = LEVEL_NAMES[selectedLevel];
  updateHUD();
  displayQuestion();
}

function updateHUD() {
  questionCounter.textContent = `Câu hỏi ${currentIndex + 1}/10`;
  currentScoreVal.textContent = score;
  currentStreakVal.textContent = `x${Math.min(3, streak + 1)}`;
}

function displayQuestion() {
  isAnswered = false;
  optionsContainer.innerHTML = '';
  
  const question = activeQuestions[currentIndex];
  questionText.textContent = question.question;

  const letters = ['A', 'B', 'C', 'D'];
  question.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-button';
    btn.innerHTML = `
      <span class="quiz-option-letter">${letters[index]}</span>
      <span>${optText}</span>
    `;
    btn.onclick = () => {
      if (isAnswered) return;
      playClick();
      selectAnswer(index);
    };
    optionsContainer.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  const maxTime = levelTimeLimits[selectedLevel];
  timerVal = maxTime;
  timerBar.style.width = '100%';
  timerBar.className = 'quiz-countdown-fill';

  timerInterval = setInterval(() => {
    timerVal--;
    const pct = (timerVal / maxTime) * 100;
    timerBar.style.width = `${pct}%`;

    if (timerVal < (maxTime * 0.25)) {
      timerBar.className = 'quiz-countdown-fill danger';
    } else if (timerVal < (maxTime * 0.5)) {
      timerBar.className = 'quiz-countdown-fill warning';
    }

    if (timerVal <= 0) {
      clearInterval(timerInterval);
      selectAnswer(-1); // Timeout
    }
  }, 100);
}

function selectAnswer(selectedIndex) {
  isAnswered = true;
  clearInterval(timerInterval);

  const question = activeQuestions[currentIndex];
  const buttons = optionsContainer.getElementsByClassName('quiz-option-button');

  // Lock buttons
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }

  const isCorrect = selectedIndex === question.answer;

  if (isCorrect) {
    streak++;
    correctAnswersCount++;
    const multiplier = Math.min(3, streak);
    const addedPoints = 10 * multiplier;
    score += addedPoints;

    buttons[selectedIndex].classList.add('correct-choice');
    playSuccess();
  } else {
    streak = 0;
    playFail();

    if (selectedIndex !== -1) {
      buttons[selectedIndex].classList.add('wrong-choice');
    }
    buttons[question.answer].classList.add('correct-choice');
  }

  updateHUD();

  setTimeout(() => {
    currentIndex++;
    if (currentIndex < activeQuestions.length) {
      updateHUD();
      displayQuestion();
    } else {
      endQuiz();
    }
  }, 1800);
}

function endQuiz() {
  quizBoard.style.display = 'none';
  summaryPanel.style.display = 'block';

  const isPassed = correctAnswersCount >= 7;

  // Reward calculations
  let coinsReward = 0;
  let xpReward = 0;

  if (isPassed) {
    // SUCCESS
    summaryIcon.className = "fa-solid fa-circle-check text-primary";
    summaryTitle.textContent = "VƯỢT CẤP THÀNH CÔNG!";
    summaryTitle.className = "text-primary mb-2";
    summaryResultText.innerHTML = `Chúc mừng bạn! Bạn đã trả lời đúng <strong class="text-primary">${correctAnswersCount} / 10</strong> câu hỏi và xuất sắc vượt qua <strong>Cấp độ ${selectedLevel}</strong>!`;
    
    // Reward multiplier
    coinsReward = Math.round(score * 1.5) + (selectedLevel * 20); // Scale with level
    xpReward = 150 + (selectedLevel * 30);

    // Save unlock progress for next level
    if (selectedLevel < 5) {
      saveUnlockedLevel(selectedLevel + 1);
    }

    playSuccess();
    triggerConfetti();
  } else {
    // FAIL
    summaryIcon.className = "fa-solid fa-circle-xmark text-danger";
    summaryTitle.textContent = "CHƯA ĐẠT YÊU CẦU!";
    summaryTitle.className = "text-danger mb-2";
    summaryResultText.innerHTML = `Bạn trả lời đúng <strong class="text-danger">${correctAnswersCount} / 10</strong> câu hỏi. Bạn cần trả lời đúng tối thiểu <strong>7 / 10</strong> câu hỏi để vượt cấp.`;

    // Consolation reward
    coinsReward = Math.round(score * 0.5);
    xpReward = 50;

    playFail();
  }

  if (appAddRewardCallback) {
    appAddRewardCallback(coinsReward, xpReward);
  }

  summaryCorrect.textContent = `${score} Điểm`;
  summaryXp.textContent = `+${xpReward} XP`;
  summaryCoins.textContent = `+${coinsReward}`;
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
