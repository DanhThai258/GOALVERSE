// GoalVerse Player Database Browser & Search Controller

import { PLAYERS, PRESET_PLAYER_PHOTOS } from '../data.js';
import { playClick } from '../audio.js';

const PLAYERS_PER_PAGE = 12;

// State
let filteredPlayers = [...PLAYERS];
let currentPage = 1;
let searchQuery = "";
let selectedLeague = "all";
let selectedPosition = "all";
let selectedSort = "rating-desc";

// UI Elements
let searchInput = null;
let leagueFilter = null;
let positionFilter = null;
let sortSelect = null;
let listContainer = null;
let paginationContainer = null;

// Modal Elements
let modalElement = null;
let modalCloseBtn = null;
let modalAvatar = null;
let modalName = null;
let modalAgeBirth = null;
let modalClubLeague = null;
let modalNation = null;
let modalPosition = null;
let modalRatingNum = null;
let modalRatingBar = null;
let modalValue = null;
let modalGoals = null;
let modalTrophies = null;
let modalFutCard = null;

export function initPlayerDb() {
  // Retrieve UI Elements
  searchInput = document.getElementById("player-db-search-input");
  leagueFilter = document.getElementById("player-db-league-filter");
  positionFilter = document.getElementById("player-db-position-filter");
  sortSelect = document.getElementById("player-db-sort");
  listContainer = document.getElementById("player-db-list");
  paginationContainer = document.getElementById("player-db-pagination");

  // Retrieve Modal Elements
  modalElement = document.getElementById("modal-player-detail");
  modalCloseBtn = document.getElementById("btn-close-player-detail");
  modalAvatar = document.getElementById("player-detail-avatar");
  modalName = document.getElementById("player-detail-name");
  modalAgeBirth = document.getElementById("player-detail-age-birth");
  modalClubLeague = document.getElementById("player-detail-club-league");
  modalNation = document.getElementById("player-detail-nation");
  modalPosition = document.getElementById("player-detail-position");
  modalRatingNum = document.getElementById("player-detail-rating-num");
  modalRatingBar = document.getElementById("player-detail-rating-bar");
  modalValue = document.getElementById("player-detail-value");
  modalGoals = document.getElementById("player-detail-goals");
  modalTrophies = document.getElementById("player-detail-trophies");
  modalFutCard = document.getElementById("player-detail-fut-card");

  if (!listContainer) return;

  // Bind Event Listeners
  searchInput.oninput = () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    currentPage = 1;
    applyFilters();
  };

  leagueFilter.onchange = () => {
    selectedLeague = leagueFilter.value;
    currentPage = 1;
    applyFilters();
  };

  positionFilter.onchange = () => {
    selectedPosition = positionFilter.value;
    currentPage = 1;
    applyFilters();
  };

  sortSelect.onchange = () => {
    selectedSort = sortSelect.value;
    currentPage = 1;
    applyFilters();
  };

  if (modalCloseBtn) {
    modalCloseBtn.onclick = () => {
      playClick();
      modalElement.classList.remove("active");
    };
  }

  // Close modal when clicking outside contents
  if (modalElement) {
    modalElement.onclick = (e) => {
      if (e.target === modalElement) {
        modalElement.classList.remove("active");
      }
    };
  }

  // Populate unique leagues in league dropdown
  populateLeagues();

  // Initial Run
  applyFilters();
}

function populateLeagues() {
  if (!leagueFilter) return;
  
  // Extract unique leagues
  const leagues = new Set();
  PLAYERS.forEach(p => {
    if (p.league) leagues.add(p.league);
  });

  // Preserve first option ("Tất cả giải đấu")
  leagueFilter.innerHTML = `<option value="all">Tất cả giải đấu</option>`;
  
  Array.from(leagues).sort().forEach(league => {
    const opt = document.createElement("option");
    opt.value = league;
    opt.textContent = league;
    leagueFilter.appendChild(opt);
  });
}

function applyFilters() {
  filteredPlayers = PLAYERS.filter(player => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      player.name.toLowerCase().includes(searchQuery) ||
      player.nationality.toLowerCase().includes(searchQuery) ||
      player.club.toLowerCase().includes(searchQuery);

    // League filter
    const matchesLeague = selectedLeague === "all" || player.league === selectedLeague;

    // Position filter
    const matchesPosition = selectedPosition === "all" || player.position === selectedPosition;

    return matchesSearch && matchesLeague && matchesPosition;
  });

  // Apply Sorting
  filteredPlayers.sort((a, b) => {
    if (selectedSort === "rating-desc") return b.rating - a.rating;
    if (selectedSort === "value-desc") return b.value - a.value;
    if (selectedSort === "goals-desc") return b.goals - a.goals;
    if (selectedSort === "trophies-desc") return b.trophies - a.trophies;
    return 0;
  });

  renderList();
}

function renderList() {
  listContainer.innerHTML = "";

  if (filteredPlayers.length === 0) {
    listContainer.innerHTML = `
      <div style="grid-column: span 12; text-align: center; padding: 40px; color: var(--color-text-muted);">
        <i class="fa-solid fa-user-slash" style="font-size: 40px; margin-bottom: 12px; display: block; color: var(--color-danger);"></i>
        Không tìm thấy cầu thủ nào phù hợp với bộ lọc!
      </div>
    `;
    paginationContainer.innerHTML = "";
    return;
  }

  // Slice for Pagination
  const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
  const endIndex = Math.min(startIndex + PLAYERS_PER_PAGE, filteredPlayers.length);
  const pagePlayers = filteredPlayers.slice(startIndex, endIndex);

  // Render Mini Cards
  pagePlayers.forEach(player => {
    const card = document.createElement("div");
    
    // Choose theme background based on rating
    let cardThemeClass = "player-mini-card rating-standard";
    if (player.rating >= 90) {
      cardThemeClass = "player-mini-card rating-legendary";
    } else if (player.rating >= 85) {
      cardThemeClass = "player-mini-card rating-worldclass";
    }

    card.className = cardThemeClass;
    card.onclick = () => {
      playClick();
      openPlayerDetail(player);
    };

    card.innerHTML = `
      <div class="card-glow"></div>
      <div class="mini-card-rating">
        <span class="val font-numeric">${player.rating}</span>
        <span class="pos">${player.position}</span>
      </div>
      <div class="mini-card-avatar" data-player="${player.name}">
        <i class="fa-solid fa-user-shield"></i>
      </div>
      <div class="mini-card-name">${player.name}</div>
      <div class="mini-card-meta">
        <span>${player.club}</span>
        <span>${player.nationality}</span>
      </div>
    `;
    listContainer.appendChild(card);
    loadMiniCardPhoto(player.name, card.querySelector(".mini-card-avatar"));
  });

  renderPagination();
}

function renderPagination() {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE);
  if (totalPages <= 1) return;

  // Prev Button
  const btnPrev = document.createElement("button");
  btnPrev.className = "btn btn-secondary btn-sm";
  btnPrev.innerHTML = `<i class="fa-solid fa-angle-left"></i>`;
  btnPrev.disabled = currentPage === 1;
  btnPrev.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderList();
      listContainer.scrollIntoView({ behavior: 'smooth' });
    }
  };
  paginationContainer.appendChild(btnPrev);

  // Page Numbers
  // Display only surrounding pages if there are many pages
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btnPage = document.createElement("button");
    btnPage.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}`;
    btnPage.textContent = i;
    btnPage.onclick = () => {
      currentPage = i;
      renderList();
      listContainer.scrollIntoView({ behavior: 'smooth' });
    };
    paginationContainer.appendChild(btnPage);
  }

  // Next Button
  const btnNext = document.createElement("button");
  btnNext.className = "btn btn-secondary btn-sm";
  btnNext.innerHTML = `<i class="fa-solid fa-angle-right"></i>`;
  btnNext.disabled = currentPage === totalPages;
  btnNext.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderList();
      listContainer.scrollIntoView({ behavior: 'smooth' });
    }
  };
  paginationContainer.appendChild(btnNext);
}

function openPlayerDetail(player) {
  // Update texts
  modalName.textContent = player.name;
  
  // Birth year calculation (Base year: 2026)
  const birthYear = 2026 - player.age;
  modalAgeBirth.innerHTML = `Tuổi: <strong>${player.age}</strong> | Năm sinh: <strong>${birthYear}</strong> (tính đến năm 2026)`;
  
  modalClubLeague.innerHTML = `<i class="fa-solid fa-shield-halved"></i> CLB: <strong>${player.club}</strong> (Giải: <strong>${player.league}</strong>)`;
  modalNation.innerHTML = `<i class="fa-solid fa-flag"></i> Quốc tịch: <strong>${player.nationality}</strong>`;
  
  const positionNames = { FW: "Tiền đạo (FW)", MF: "Tiền vệ (MF)", DF: "Hậu vệ (DF)", GK: "Thủ môn (GK)" };
  modalPosition.innerHTML = `<i class="fa-solid fa-circle-nodes"></i> Vị trí: <strong>${positionNames[player.position] || player.position}</strong>`;
  
  modalRatingNum.textContent = player.rating;
  modalRatingBar.style.width = `${player.rating}%`;
  
  // Set color bar rating
  if (player.rating >= 90) {
    modalRatingBar.style.background = "var(--color-gold)";
  } else if (player.rating >= 85) {
    modalRatingBar.style.background = "var(--color-secondary)";
  } else {
    modalRatingBar.style.background = "var(--color-primary)";
  }

  modalValue.textContent = `${player.value} Triệu €`;
  modalGoals.textContent = player.goals;
  modalTrophies.textContent = player.trophies;

  // Set card theme inside modal based on rating
  modalFutCard.className = "player-detail-card-shell"; // Reset
  if (player.rating >= 90) {
    modalFutCard.classList.add("theme-legendary");
  } else if (player.rating >= 85) {
    modalFutCard.classList.add("theme-worldclass");
  } else {
    modalFutCard.classList.add("theme-standard");
  }

  // Fetch Photo from Wikipedia
  loadPlayerPhoto(player.name);

  // Show Modal
  modalElement.classList.add("active");
}

function isPlayerImageValid(pageTitle, imgUrl, playerName) {
  if (!imgUrl) return false;
  const t = (pageTitle || "").toLowerCase();
  const u = (imgUrl || "").toLowerCase();
  
  // Reject club badges, stadiums, seasons, logos, islands, crests
  if (t.includes("f.c.") || t.includes("fc ") || t.endsWith(" fc") || t.includes("club")) return false;
  if (t.includes("stadium") || t.includes("season") || t.includes("island") || t.includes("league")) return false;
  if (u.includes("_logo") || u.includes("logo.") || u.includes("crest") || u.includes("badge") || u.includes("coat_of_arms")) return false;

  // If title is given, make sure it relates to the player's name
  if (pageTitle && playerName) {
    const normTitle = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normName = playerName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nameParts = normName.split(" ").filter(w => w.length > 2);
    if (nameParts.length > 0 && !nameParts.some(p => normTitle.includes(p))) {
      return false;
    }
  }
  return true;
}

function getCachedPhoto(playerName) {
  try {
    const cache = JSON.parse(localStorage.getItem("goalverse_player_photos_cache") || "{}");
    const url = cache[playerName] || null;
    if (url && isPlayerImageValid("", url, playerName)) {
      return url;
    }
    if (url) {
      delete cache[playerName];
      localStorage.setItem("goalverse_player_photos_cache", JSON.stringify(cache));
    }
    return null;
  } catch (e) {
    return null;
  }
}

function setCachedPhoto(playerName, url) {
  if (!url || !isPlayerImageValid("", url, playerName)) return;
  try {
    const cache = JSON.parse(localStorage.getItem("goalverse_player_photos_cache") || "{}");
    cache[playerName] = url;
    localStorage.setItem("goalverse_player_photos_cache", JSON.stringify(cache));
  } catch (e) {}
}

function loadPlayerPhoto(playerName) {
  // Check presets and cache first
  if (PRESET_PLAYER_PHOTOS && PRESET_PLAYER_PHOTOS[playerName]) {
    displayPhoto(PRESET_PLAYER_PHOTOS[playerName]);
    return;
  }
  const cached = getCachedPhoto(playerName);
  if (cached) {
    displayPhoto(cached);
    return;
  }

  modalAvatar.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--color-text-muted);">
      <i class="fa-solid fa-spinner fa-spin" style="font-size:24px;"></i>
    </div>
  `;

  // Standard Wikipedia image query
  const directUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(playerName)}&prop=pageimages&format=json&pithumbsize=400&origin=*&pilicense=any&redirects=1`;

  fetch(directUrl)
    .then(res => res.text())
    .then(text => {
      if (!text.startsWith("{")) {
        fetchSearchPhoto(playerName);
        return;
      }
      const data = JSON.parse(text);
      let imgUrl = "";
      if (data && data.query && data.query.pages) {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const pg = pages[pageId];
        if (pageId !== "-1" && pg.thumbnail && isPlayerImageValid(pg.title, pg.thumbnail.source, playerName)) {
          imgUrl = pg.thumbnail.source;
        }
      }

      if (imgUrl) {
        setCachedPhoto(playerName, imgUrl);
        displayPhoto(imgUrl);
      } else {
        fetchSearchPhoto(playerName);
      }
    })
    .catch(() => {
      fetchSearchPhoto(playerName);
    });
}

function fetchSearchPhoto(playerName) {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(playerName + ' footballer')}&gsrlimit=3&prop=pageimages&pithumbsize=400&origin=*&pilicense=any&redirects=1`;

  fetch(searchUrl)
    .then(res => res.text())
    .then(text => {
      if (!text.startsWith("{")) {
        displayFallbackPhoto();
        return;
      }
      const data = JSON.parse(text);
      let imgUrl = "";
      if (data && data.query && data.query.pages) {
        for (const pg of Object.values(data.query.pages)) {
          if (pg.thumbnail?.source && isPlayerImageValid(pg.title, pg.thumbnail.source, playerName)) {
            imgUrl = pg.thumbnail.source;
            break;
          }
        }
      }

      if (imgUrl) {
        setCachedPhoto(playerName, imgUrl);
        displayPhoto(imgUrl);
      } else {
        displayFallbackPhoto();
      }
    })
    .catch(() => {
      displayFallbackPhoto();
    });
}

function displayPhoto(url) {
  modalAvatar.innerHTML = `<img src="${url}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
}

function displayFallbackPhoto() {
  modalAvatar.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:rgba(255,255,255,0.15); background:#151d2e;">
      <i class="fa-solid fa-user-ninja" style="font-size: 48px; margin-bottom:10px;"></i>
      <span style="font-size:10px; text-transform:uppercase; font-weight:700;">No photo found</span>
    </div>
  `;
}

function loadMiniCardPhoto(playerName, container) {
  container.setAttribute("data-player", playerName);

  // Check presets and cache first - zero network delay!
  if (PRESET_PLAYER_PHOTOS && PRESET_PLAYER_PHOTOS[playerName]) {
    displayMiniPhoto(PRESET_PLAYER_PHOTOS[playerName], container, playerName);
    return;
  }
  const cached = getCachedPhoto(playerName);
  if (cached) {
    displayMiniPhoto(cached, container, playerName);
    return;
  }

  // Standard Wikipedia image query with pithumbsize=150
  const directUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(playerName)}&prop=pageimages&format=json&pithumbsize=150&origin=*&pilicense=any&redirects=1`;

  fetch(directUrl)
    .then(res => res.text())
    .then(text => {
      if (container.getAttribute("data-player") !== playerName) return;
      if (!text.startsWith("{")) {
        fetchSearchMiniPhoto(playerName, container);
        return;
      }
      const data = JSON.parse(text);
      let imgUrl = "";
      if (data && data.query && data.query.pages) {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const pg = pages[pageId];
        if (pageId !== "-1" && pg.thumbnail && isPlayerImageValid(pg.title, pg.thumbnail.source, playerName)) {
          imgUrl = pg.thumbnail.source;
        }
      }

      if (imgUrl) {
        setCachedPhoto(playerName, imgUrl);
        displayMiniPhoto(imgUrl, container, playerName);
      } else {
        fetchSearchMiniPhoto(playerName, container);
      }
    })
    .catch(() => {
      if (container.getAttribute("data-player") !== playerName) return;
      fetchSearchMiniPhoto(playerName, container);
    });
}

function fetchSearchMiniPhoto(playerName, container) {
  if (container.getAttribute("data-player") !== playerName) return;

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(playerName + ' footballer')}&gsrlimit=3&prop=pageimages&pithumbsize=150&origin=*&pilicense=any&redirects=1`;

  fetch(searchUrl)
    .then(res => res.text())
    .then(text => {
      if (container.getAttribute("data-player") !== playerName) return;
      if (!text.startsWith("{")) {
        displayMiniFallbackPhoto(container, playerName);
        return;
      }
      const data = JSON.parse(text);
      let imgUrl = "";
      if (data && data.query && data.query.pages) {
        for (const pg of Object.values(data.query.pages)) {
          if (pg.thumbnail?.source && isPlayerImageValid(pg.title, pg.thumbnail.source, playerName)) {
            imgUrl = pg.thumbnail.source;
            break;
          }
        }
      }

      if (imgUrl) {
        setCachedPhoto(playerName, imgUrl);
        displayMiniPhoto(imgUrl, container, playerName);
      } else {
        displayMiniFallbackPhoto(container, playerName);
      }
    })
    .catch(() => {
      if (container.getAttribute("data-player") !== playerName) return;
      displayMiniFallbackPhoto(container, playerName);
    });
}

function displayMiniPhoto(url, container, playerName) {
  if (container.getAttribute("data-player") !== playerName) return;
  container.innerHTML = `<img src="${url}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
}

function displayMiniFallbackPhoto(container, playerName) {
  if (container.getAttribute("data-player") !== playerName) return;
  container.innerHTML = `<i class="fa-solid fa-user-shield"></i>`;
}
