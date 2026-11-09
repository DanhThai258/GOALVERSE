// GoalVerse Club Logo & Jersey Quiz Controller

import { playClick, playSuccess, playFail, playWhistle, playCheer } from '../audio.js';

// Database of 30 top clubs
const CLUBS_DB = [
  { name: "Manchester United", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png", wikiTitle: "Manchester United F.C.", league: "Premier League", country: "Anh", stadium: "Old Trafford", players: "Cristiano Ronaldo, Wayne Rooney, David Beckham" },
  { name: "Real Madrid", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png", wikiTitle: "Real Madrid CF", league: "La Liga", country: "Tây Ban Nha", stadium: "Santiago Bernabéu", players: "Zinedine Zidane, Cristiano Ronaldo, Raul Gonzalez" },
  { name: "Barcelona", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png", wikiTitle: "FC Barcelona", league: "La Liga", country: "Tây Ban Nha", stadium: "Spotify Camp Nou", players: "Lionel Messi, Ronaldinho, Andres Iniesta" },
  { name: "Liverpool", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png", wikiTitle: "Liverpool F.C.", league: "Premier League", country: "Anh", stadium: "Anfield", players: "Steven Gerrard, Mohamed Salah, Fernando Torres" },
  { name: "Manchester City", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png", wikiTitle: "Manchester City F.C.", league: "Premier League", country: "Anh", stadium: "Etihad Stadium", players: "Sergio Aguero, Kevin De Bruyne, David Silva" },
  { name: "Arsenal", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png", wikiTitle: "Arsenal F.C.", league: "Premier League", country: "Anh", stadium: "Emirates Stadium", players: "Thierry Henry, Dennis Bergkamp, Cesc Fabregas" },
  { name: "Chelsea", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8455.png", wikiTitle: "Chelsea F.C.", league: "Premier League", country: "Anh", stadium: "Stamford Bridge", players: "Didier Drogba, Frank Lampard, Eden Hazard" },
  { name: "Bayern Munich", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png", wikiTitle: "FC Bayern Munich", league: "Bundesliga", country: "Đức", stadium: "Allianz Arena", players: "Arjen Robben, Franck Ribery, Robert Lewandowski" },
  { name: "Paris Saint-Germain", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png", wikiTitle: "Paris Saint-Germain F.C.", league: "Ligue 1", country: "Pháp", stadium: "Parc des Princes", players: "Kylian Mbappe, Neymar Jr, Zlatan Ibrahimovic" },
  { name: "Juventus", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9885.png", wikiTitle: "Juventus F.C.", league: "Serie A", country: "Ý", stadium: "Allianz Stadium", players: "Alessandro Del Piero, Gianluigi Buffon, Pavel Nedved" },
  { name: "Inter Milan", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png", wikiTitle: "Inter Milan", league: "Serie A", country: "Ý", stadium: "San Siro", players: "Javier Zanetti, Ronaldo Nazario, Diego Milito" },
  { name: "AC Milan", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png", wikiTitle: "A.C. Milan", league: "Serie A", country: "Ý", stadium: "San Siro", players: "Paolo Maldini, Kaka, Andriy Shevchenko" },
  { name: "Borussia Dortmund", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png", wikiTitle: "Borussia Dortmund", league: "Bundesliga", country: "Đức", stadium: "Signal Iduna Park", players: "Marco Reus, Robert Lewandowski, Erling Haaland" },
  { name: "Atletico Madrid", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png", wikiTitle: "Atlético Madrid", league: "La Liga", country: "Tây Ban Nha", stadium: "Civitas Metropolitano", players: "Antoine Griezmann, Radamel Falcao, Fernando Torres" },
  { name: "Tottenham Hotspur", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png", wikiTitle: "Tottenham Hotspur F.C.", league: "Premier League", country: "Anh", stadium: "Tottenham Hotspur Stadium", players: "Harry Kane, Son Heung-min, Gareth Bale" },
  { name: "Al Nassr", logo: "https://r2.thesportsdb.com/images/media/team/badge/84yvqi1748524565.png", wikiTitle: "Al Nassr FC", league: "Saudi Pro League", country: "Saudi Arabia", stadium: "Al-Awwal Park", players: "Cristiano Ronaldo, Sadio Mane, Marcelo Brozovic" },
  { name: "Inter Miami", logo: "https://r2.thesportsdb.com/images/media/team/badge/m4it3e1602103647.png", wikiTitle: "Inter Miami CF", league: "MLS", country: "Mỹ", stadium: "Chase Stadium", players: "Lionel Messi, Luis Suarez, Sergio Busquets" },
  { name: "Bayer Leverkusen", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8178.png", wikiTitle: "Bayer 04 Leverkusen", league: "Bundesliga", country: "Đức", stadium: "BayArena", players: "Michael Ballack, Florian Wirtz, Toni Kroos" },
  { name: "AS Roma", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png", wikiTitle: "A.S. Roma", league: "Serie A", country: "Ý", stadium: "Stadio Olimpico", players: "Francesco Totti, Daniele De Rossi, Gabriel Batistuta" },
  { name: "Napoli", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png", wikiTitle: "S.S.C. Napoli", league: "Serie A", country: "Ý", stadium: "Stadio Diego Armando Maradona", players: "Diego Maradona, Edinson Cavani, Victor Osimhen" },
  { name: "Ajax", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8593.png", wikiTitle: "AFC Ajax", league: "Eredivisie", country: "Hà Lan", stadium: "Johan Cruyff ArenA", players: "Johan Cruyff, Luis Suarez, Zlatan Ibrahimovic" },
  { name: "Boca Juniors", logo: "https://r2.thesportsdb.com/images/media/team/badge/bm7krb1775741582.png", wikiTitle: "Club Atlético Boca Juniors", league: "Argentine Primera División", country: "Argentina", stadium: "La Bombonera", players: "Diego Maradona, Juan Roman Riquelme, Carlos Tevez" },
  { name: "River Plate", logo: "https://r2.thesportsdb.com/images/media/team/badge/03dmi31645539717.png", wikiTitle: "Club Atlético River Plate", league: "Argentine Primera División", country: "Argentina", stadium: "El Monumental", players: "Enzo Francescoli, Hernan Crespo, Javier Saviola" },
  { name: "Sporting CP", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png", wikiTitle: "Sporting CP", league: "Liga Portugal", country: "Bồ Đào Nha", stadium: "Estádio José Alvalade", players: "Cristiano Ronaldo, Luis Figo, Bruno Fernandes" },
  { name: "Benfica", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9772.png", wikiTitle: "S.L. Benfica", league: "Liga Portugal", country: "Bồ Đào Nha", stadium: "Estádio da Luz", players: "Eusebio, Rui Costa, Angel Di Maria" },
  { name: "FC Porto", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9763.png", wikiTitle: "F.C. Porto", league: "Liga Portugal", country: "Bồ Đào Nha", stadium: "Estádio do Dragão", players: "Deco, Radamel Falcao, James Rodriguez" },
  { name: "Marseille", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8592.png", wikiTitle: "Olympique de Marseille", league: "Ligue 1", country: "Pháp", stadium: "Stade Vélodrome", players: "Didier Drogba, Jean-Pierre Papin, Franck Ribery" },
  { name: "Lyon", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9748.png", wikiTitle: "Olympique Lyonnais", league: "Ligue 1", country: "Pháp", stadium: "Groupama Stadium", players: "Juninho Pernambucano, Karim Benzema, Alexandre Lacazette" },
  { name: "Al Hilal", logo: "https://r2.thesportsdb.com/images/media/team/badge/5trzvq1660439102.png", wikiTitle: "Al-Hilal SFC", league: "Saudi Pro League", country: "Saudi Arabia", stadium: "Kingdom Arena", players: "Neymar Jr, Aleksandar Mitrovic, Kalidou Koulibaly" },
  { name: "Aston Villa", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png", wikiTitle: "Aston Villa F.C.", league: "Premier League", country: "Anh", stadium: "Villa Park", players: "Jack Grealish, Christian Benteke, Emiliano Martinez" }
];

// Game State
let targetClub = null;
let currentLogoUrl = "";
let attemptsLeft = 5;
let currentZoom = 3.5;
let cropX = 50;
let cropY = 50;
let hueShift = 0;
let isGameOver = false;

let unlockedHints = {
  country: false,
  league: false,
  stadium: false,
  players: false
};

// Callbacks
let appAddRewardCallback = null;
let appDeductCoinsCallback = null;
let appGetCoinsCallback = null;

// UI Elements (to be initialized)
let logoImgElement = null;
let logoContainer = null;
let searchInput = null;
let autocompleteDropdown = null;
let btnSubmit = null;
let btnReset = null;
let attemptsText = null;
let zoomText = null;
let hintsDisplayList = null;
let resultPanel = null;
let resultTitle = null;
let resultDesc = null;

// Hint buttons
let btnHintCountry = null;
let btnHintLeague = null;
let btnHintStadium = null;
let btnHintPlayers = null;

export function initLogoQuiz(addRewardFn, deductCoinsFn, getCoinsFn) {
  appAddRewardCallback = addRewardFn;
  appDeductCoinsCallback = deductCoinsFn;
  appGetCoinsCallback = getCoinsFn;

  // Retrieve UI Elements
  logoContainer = document.getElementById("logo-quiz-image-container");
  searchInput = document.getElementById("logo-quiz-search-input");
  autocompleteDropdown = document.getElementById("logo-quiz-autocomplete-dropdown");
  btnSubmit = document.getElementById("btn-logo-quiz-submit");
  btnReset = document.getElementById("btn-logo-quiz-reset");
  attemptsText = document.getElementById("logo-quiz-attempts");
  zoomText = document.getElementById("logo-quiz-zoom");
  hintsDisplayList = document.getElementById("logo-quiz-unlocked-hints");
  resultPanel = document.getElementById("logo-quiz-result-panel");
  resultTitle = document.getElementById("logo-quiz-result-title");
  resultDesc = document.getElementById("logo-quiz-result-desc");

  // Hints Buy buttons
  btnHintCountry = document.getElementById("btn-logo-hint-country");
  btnHintLeague = document.getElementById("btn-logo-hint-league");
  btnHintStadium = document.getElementById("btn-logo-hint-stadium");
  btnHintPlayers = document.getElementById("btn-logo-hint-players");

  if (!logoContainer) return;

  // Setup Event Listeners
  btnSubmit.onclick = () => {
    playClick();
    makeGuess();
  };

  btnReset.onclick = () => {
    playClick();
    startNewGame();
  };

  searchInput.oninput = () => {
    handleSearchInput();
  };

  searchInput.onfocus = () => {
    handleSearchInput();
  };

  // Close autocomplete on click outside
  document.addEventListener("click", (e) => {
    if (autocompleteDropdown && e.target !== searchInput) {
      autocompleteDropdown.style.display = "none";
    }
  });

  // Bind Hint Buttons
  btnHintCountry.onclick = () => buyHint("country", 15, btnHintCountry);
  btnHintLeague.onclick = () => buyHint("league", 20, btnHintLeague);
  btnHintStadium.onclick = () => buyHint("stadium", 25, btnHintStadium);
  btnHintPlayers.onclick = () => buyHint("players", 30, btnHintPlayers);

  startNewGame();
}

function startNewGame() {
  // Select random club
  targetClub = CLUBS_DB[Math.floor(Math.random() * CLUBS_DB.length)];
  
  attemptsLeft = 5;
  currentZoom = 3.5;
  cropX = Math.floor(Math.random() * 60) + 20; // 20% to 80%
  cropY = Math.floor(Math.random() * 60) + 20; // 20% to 80%
  hueShift = Math.floor(Math.random() * 260) + 50; // shift colors completely
  isGameOver = false;

  unlockedHints = {
    country: false,
    league: false,
    stadium: false,
    players: false
  };

  // Reset inputs and overlays
  searchInput.value = "";
  searchInput.disabled = false;
  btnSubmit.disabled = false;
  resultPanel.style.display = "none";
  autocompleteDropdown.innerHTML = "";
  autocompleteDropdown.classList.remove("active");

  // Reset hint buttons
  resetHintButton(btnHintCountry, "Quốc gia", 15);
  resetHintButton(btnHintLeague, "Giải đấu", 20);
  resetHintButton(btnHintStadium, "Sân nhà", 25);
  resetHintButton(btnHintPlayers, "Danh thủ", 30);

  // Clear hints display
  hintsDisplayList.innerHTML = `
    <div style="font-size: 13px; color: var(--color-text-muted); text-align: center; width: 100%; padding: 10px;">
      <i class="fa-solid fa-store" style="margin-right: 6px;"></i> Chưa có manh mối nào được mở khóa. Hãy mua ở trên!
    </div>
  `;

  // Update status UI
  updateStatusUI();

  // Load Image
  loadLogoImage();
}

function resetHintButton(btn, label, cost) {
  if (!btn) return;
  btn.disabled = false;
  btn.style.opacity = "1";
  const costEl = btn.querySelector(".hint-cost");
  if (costEl) {
    costEl.textContent = `-${cost} Coins`;
    costEl.style.color = "var(--color-gold)";
  }
}

function loadLogoImage() {
  if (targetClub && targetClub.logo) {
    currentLogoUrl = targetClub.logo;
    displayLogo();
    return;
  }

  logoContainer.innerHTML = `
    <div class="logo-loading-spinner" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; height: 100%;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--color-primary);"></i>
      <span style="font-size: 12px; color: var(--color-text-muted);">Đang quét cơ sở dữ liệu CLB...</span>
    </div>
  `;

  const wikiTitle = targetClub.wikiTitle;
  const clubName = targetClub.name;

  // Chiến thuật 1: Truy cập trực tiếp theo wikiTitle với pilicense=any và redirects=1
  const directUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=500&origin=*&pilicense=any&redirects=1`;

  fetch(directUrl)
    .then(res => res.json())
    .then(data => {
      let imgUrl = "";
      if (data && data.query && data.query.pages) {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== "-1" && pages[pageId].thumbnail) {
          imgUrl = pages[pageId].thumbnail.source;
        }
      }

      if (imgUrl) {
        currentLogoUrl = imgUrl;
        displayLogo();
      } else {
        // Chiến thuật 2: Tìm kiếm dự phòng theo tên CLB
        fetchSearchLogo(clubName);
      }
    })
    .catch(err => {
      console.warn("Wikipedia direct logo fetch failed, trying search:", err);
      fetchSearchLogo(clubName);
    });
}

function fetchSearchLogo(clubName) {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(clubName)}&gsrlimit=1&prop=pageimages&pithumbsize=500&origin=*&pilicense=any&redirects=1`;

  fetch(searchUrl)
    .then(res => res.json())
    .then(data => {
      let imgUrl = "";
      if (data && data.query && data.query.pages) {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== "-1" && pages[pageId].thumbnail) {
          imgUrl = pages[pageId].thumbnail.source;
        }
      }

      if (imgUrl) {
        currentLogoUrl = imgUrl;
        displayLogo();
      } else {
        useFallbackLogo();
      }
    })
    .catch(err => {
      console.error("Wikipedia search logo fetch failed:", err);
      useFallbackLogo();
    });
}

function useFallbackLogo() {
  // Inline SVG Vector độc lập 100% không sợ chặn ISP hay Hotlink
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%"><defs><radialGradient id="grad" cx="50%" cy="30%" r="80%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></radialGradient><linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffb703"/><stop offset="100%" stop-color="#fb8500"/></linearGradient></defs><path d="M60 5 L100 20 V65 C100 88 60 110 60 110 C60 110 20 88 20 65 V20 L60 5 Z" fill="url(#grad)" stroke="url(#gold-grad)" stroke-width="4" stroke-linejoin="round"/><circle cx="60" cy="55" r="28" fill="none" stroke="url(#gold-grad)" stroke-width="2" stroke-dasharray="4 2"/><path d="M60 12 V98 M20 55 H100 M32 30 L88 80 M88 30 L32 80" fill="none" stroke="rgba(255, 183, 3, 0.15)" stroke-width="2"/><circle cx="60" cy="55" r="8" fill="url(#gold-grad)"/><polygon points="60,37 65,47 76,47 68,54 71,65 60,58 49,65 52,54 44,47 55,47" fill="url(#gold-grad)"/></svg>`;
  currentLogoUrl = "data:image/svg+xml;utf8," + encodeURIComponent(svgString);
  displayLogo();
}

function displayLogo() {
  logoContainer.innerHTML = "";
  logoImgElement = document.createElement("img");
  logoImgElement.className = "distorted-logo-img";
  logoImgElement.src = currentLogoUrl;
  logoImgElement.setAttribute("referrerpolicy", "no-referrer"); // Ngăn chặn lỗi 403 hotlink từ Wikimedia
  logoImgElement.style.width = "100%";
  logoImgElement.style.height = "100%";
  logoImgElement.style.objectFit = "contain";
  logoImgElement.style.background = "#0e1622";
  logoImgElement.style.borderRadius = "12px";

  applyDistortion();
  logoContainer.appendChild(logoImgElement);
}

function applyDistortion() {
  if (!logoImgElement) return;

  if (isGameOver) {
    // Reset all distortion on game over
    logoImgElement.style.transform = "scale(1)";
    logoImgElement.style.objectPosition = "50% 50%";
    logoImgElement.style.filter = "none";
  } else {
    // Distort based on attempts
    // scale down attempts:
    // 5 attempts left: zoom 3.5, random offset, hue shift
    // 4 attempts left: zoom 2.6, slightly off-center, hue shift
    // 3 attempts left: zoom 1.8, slightly off-center, no hue shift
    // 2 attempts left: zoom 1.3, centered, no hue shift
    // 1 attempt left: zoom 1.1, centered, no hue shift
    
    let scale = 1.1;
    let blur = 0;
    let currentHue = 0;
    let posX = 50;
    let posY = 50;

    if (attemptsLeft === 5) {
      scale = 3.5;
      blur = 2;
      currentHue = hueShift;
      posX = cropX;
      posY = cropY;
    } else if (attemptsLeft === 4) {
      scale = 2.6;
      blur = 1.5;
      currentHue = Math.floor(hueShift / 1.5);
      posX = Math.floor((cropX + 50) / 2);
      posY = Math.floor((cropY + 50) / 2);
    } else if (attemptsLeft === 3) {
      scale = 1.8;
      blur = 0.5;
      currentHue = 0;
      posX = Math.floor((cropX + 150) / 4);
      posY = Math.floor((cropY + 150) / 4);
    } else if (attemptsLeft === 2) {
      scale = 1.3;
      blur = 0;
      currentHue = 0;
      posX = 50;
      posY = 50;
    } else if (attemptsLeft === 1) {
      scale = 1.1;
      blur = 0;
      currentHue = 0;
      posX = 50;
      posY = 50;
    }

    logoImgElement.style.transform = `scale(${scale})`;
    logoImgElement.style.objectPosition = `${posX}% ${posY}%`;
    
    let filters = `contrast(1.2) saturate(1.3)`;
    if (blur > 0) filters += ` blur(${blur}px)`;
    if (currentHue > 0) filters += ` hue-rotate(${currentHue}deg)`;
    logoImgElement.style.filter = filters;
  }
}

function updateStatusUI() {
  attemptsText.textContent = `${attemptsLeft}/5`;
  
  let zoomPercent = "100%";
  if (!isGameOver) {
    if (attemptsLeft === 5) zoomPercent = "350%";
    else if (attemptsLeft === 4) zoomPercent = "260%";
    else if (attemptsLeft === 3) zoomPercent = "180%";
    else if (attemptsLeft === 2) zoomPercent = "130%";
    else if (attemptsLeft === 1) zoomPercent = "110%";
  }
  zoomText.textContent = zoomPercent;
}

function handleSearchInput() {
  const query = searchInput.value.trim().toLowerCase();
  autocompleteDropdown.innerHTML = "";

  if (query.length === 0) {
    autocompleteDropdown.style.display = "none";
    return;
  }

  // Filter clubs from DB
  const matches = CLUBS_DB.filter(club => 
    club.name.toLowerCase().includes(query) ||
    club.league.toLowerCase().includes(query) ||
    club.country.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    autocompleteDropdown.style.display = "none";
    return;
  }

  matches.slice(0, 5).forEach(club => {
    const item = document.createElement("div");
    item.className = "autocomplete-item";
    item.innerHTML = `
      <div style="display: flex; flex-direction: column;">
        <span class="autocomplete-club-name" style="font-weight: 700;">${club.name}</span>
        <span style="font-size: 10px; color: var(--color-text-muted);">${club.league} (${club.country})</span>
      </div>
    `;
    item.onclick = (e) => {
      e.stopPropagation();
      playClick();
      searchInput.value = club.name;
      autocompleteDropdown.style.display = "none";
    };
    autocompleteDropdown.appendChild(item);
  });

  autocompleteDropdown.style.display = "block";
}

function buyHint(type, cost, btnEl) {
  playClick();
  
  if (isGameOver) return;
  if (unlockedHints[type]) return;

  const playerCoins = appGetCoinsCallback();
  if (playerCoins < cost) {
    alert("Bạn không đủ Coins để mua manh mối này!");
    return;
  }

  // Deduct coins
  appDeductCoinsCallback(cost);
  unlockedHints[type] = true;

  // Disable button
  btnEl.disabled = true;
  btnEl.style.opacity = "0.5";
  const costEl = btnEl.querySelector(".hint-cost");
  if (costEl) costEl.textContent = "ĐÃ MỞ";

  // Re-render unlocked hints
  renderHintsList();
}

function renderHintsList() {
  hintsDisplayList.innerHTML = "";
  
  let hasHints = false;

  const hintMappings = [
    { key: "country", label: "Quốc gia", icon: "fa-flag", text: targetClub.country, color: "var(--color-primary)" },
    { key: "league", label: "Giải đấu", icon: "fa-earth-americas", text: targetClub.league, color: "var(--color-secondary)" },
    { key: "stadium", label: "Sân nhà", icon: "fa-building-columns", text: targetClub.stadium, color: "var(--color-gold)" },
    { key: "players", label: "Huyền thoại/Danh thủ", icon: "fa-users", text: targetClub.players, color: "var(--color-danger)" }
  ];

  hintMappings.forEach(hint => {
    if (unlockedHints[hint.key]) {
      hasHints = true;
      const hintItem = document.createElement("div");
      hintItem.className = "logo-hint-display-item";
      hintItem.style.display = "flex";
      hintItem.style.alignItems = "center";
      hintItem.style.gap = "10px";
      hintItem.style.padding = "8px 12px";
      hintItem.style.background = "rgba(255,255,255,0.02)";
      hintItem.style.border = "1px solid var(--border-color)";
      hintItem.style.borderRadius = "8px";
      hintItem.style.fontSize = "13px";
      hintItem.style.animation = "fadeIn 0.3s ease";

      hintItem.innerHTML = `
        <div style="color: ${hint.color}; min-width: 22px; text-align: center;">
          <i class="fa-solid ${hint.icon}"></i>
        </div>
        <div style="flex-grow: 1;">
          <span style="font-weight: 700; color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; display: block;">${hint.label}</span>
          <span style="font-weight: 700; color: #fff;">${hint.text}</span>
        </div>
      `;
      hintsDisplayList.appendChild(hintItem);
    }
  });

  if (!hasHints) {
    hintsDisplayList.innerHTML = `
      <div style="font-size: 13px; color: var(--color-text-muted); text-align: center; width: 100%; padding: 10px;">
        <i class="fa-solid fa-store" style="margin-right: 6px;"></i> Chưa có manh mối nào được mở khóa. Hãy mua ở trên!
      </div>
    `;
  }
}

function makeGuess() {
  if (isGameOver) return;

  const guess = searchInput.value.trim();
  if (!guess) {
    alert("Vui lòng chọn hoặc nhập tên một CLB bóng đá!");
    return;
  }

  // Check if guess matches target club (case insensitive)
  const isCorrect = guess.toLowerCase() === targetClub.name.toLowerCase();

  if (isCorrect) {
    handleWin();
  } else {
    attemptsLeft--;
    updateStatusUI();
    applyDistortion();

    if (attemptsLeft <= 0) {
      handleLoss();
    } else {
      playFail();
      alert(`Đoán sai rồi! Gợi ý: Ảnh đã zoom out một chút để dễ nhìn hơn.`);
      searchInput.value = "";
    }
  }
}

function handleWin() {
  isGameOver = true;
  searchInput.disabled = true;
  btnSubmit.disabled = true;

  // Calculate rewards
  let coins = 40;
  let xp = 50;

  if (attemptsLeft === 5) {
    coins = 120;
    xp = 150;
  } else if (attemptsLeft >= 3) {
    coins = 80;
    xp = 100;
  }

  // Trigger reward callback
  if (appAddRewardCallback) {
    appAddRewardCallback(coins, xp);
  }

  // Reveal image full
  applyDistortion();

  // Play sounds
  playWhistle(false);
  setTimeout(playCheer, 200);

  // Show confetti
  triggerConfetti();

  // Display result panel
  resultPanel.style.display = "block";
  resultPanel.style.borderColor = "var(--color-primary)";
  resultTitle.innerHTML = `<i class="fa-solid fa-circle-check text-primary"></i> CHÍNH XÁC!`;
  resultTitle.className = "text-primary mb-2";
  resultDesc.innerHTML = `
    Chúc mừng bạn đã đoán đúng CLB <strong>${targetClub.name}</strong> ở lượt thứ <strong>${6 - attemptsLeft}</strong>!<br>
    Phần thưởng của bạn: <strong class="text-gold">+${coins} Coins</strong> và <strong class="text-secondary">+${xp} XP</strong>.
  `;
}

function handleLoss() {
  isGameOver = true;
  searchInput.disabled = true;
  btnSubmit.disabled = true;

  // Reveal image full
  applyDistortion();

  // Play sounds
  playFail();

  // Display result panel
  resultPanel.style.display = "block";
  resultPanel.style.borderColor = "var(--color-danger)";
  resultTitle.innerHTML = `<i class="fa-solid fa-circle-xmark text-danger"></i> THẤT BẠI!`;
  resultTitle.className = "text-danger mb-2";
  resultDesc.innerHTML = `
    Rất tiếc! Bạn đã hết lượt đoán. CLB bí ẩn chính là <strong>${targetClub.name}</strong>.<br>
    Hãy thử lại một lượt chơi mới để phục thù!
  `;
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
