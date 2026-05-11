const family = window.FAMILY;
const memoirs = window.MEMOIRS;
const photoAlbums = window.PHOTO_ALBUMS || [];
const people = family.people;
const albumsByPerson = new Map(photoAlbums.map((album) => [album.personId, album]));

const treeEl = document.querySelector("#family-tree");
const modalEl = document.querySelector("#person-modal");
const panelContentEl = document.querySelector("#person-panel-content");
const searchEl = document.querySelector("#person-search");
const tabsEl = document.querySelector("#memoir-tabs");
const readerEl = document.querySelector("#memoir-reader");
const photosEl = document.querySelector("#photo-grid");
const photoModalEl = document.querySelector("#photo-modal");
const photoViewerImageEl = document.querySelector("#photo-viewer-image");
const photoViewerCaptionEl = document.querySelector("#photo-viewer-caption");
const photoViewerCounterEl = document.querySelector("#photo-viewer-counter");
const photoPrevButtonEl = document.querySelector("[data-photo-prev]");
const photoNextButtonEl = document.querySelector("[data-photo-next]");

const defaultTreeMainId = "anna-kuteinikova";

let currentPhotoSet = [];
let currentPhotoIndex = 0;
let familyChart = null;
let lastSearchFocusId = "";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function personName(id) {
  return people[id]?.name || id;
}

function relatedList(ids = []) {
  return ids.map((id) => `<button type="button" class="link-button" data-person="${id}">${personName(id)}</button>`).join("");
}

function closePersonModal() {
  modalEl.hidden = true;
  document.body.classList.remove("modal-open");
}

function closePhotoModal() {
  photoModalEl.hidden = true;
  photoViewerImageEl.removeAttribute("src");
  photoViewerImageEl.alt = "";
  photoViewerCaptionEl.textContent = "";
  photoViewerCounterEl.textContent = "";
  currentPhotoSet = [];
  currentPhotoIndex = 0;
  document.body.classList.remove("modal-open");
}

function updatePhotoViewer() {
  const photo = currentPhotoSet[currentPhotoIndex];
  if (!photo) {
    return;
  }

  photoViewerImageEl.src = photo.src;
  photoViewerImageEl.alt = photo.caption;
  photoViewerCaptionEl.textContent = photo.caption;
  photoViewerCounterEl.textContent = `${currentPhotoIndex + 1} / ${currentPhotoSet.length}`;
  photoPrevButtonEl.disabled = currentPhotoSet.length < 2;
  photoNextButtonEl.disabled = currentPhotoSet.length < 2;
}

function openPhotoSet(photos, index = 0) {
  if (!photos?.length) {
    return;
  }

  currentPhotoSet = photos;
  currentPhotoIndex = Math.min(Math.max(index, 0), photos.length - 1);
  updatePhotoViewer();
  photoModalEl.hidden = false;
  document.body.classList.add("modal-open");
}

function showAdjacentPhoto(direction) {
  if (currentPhotoSet.length < 2) {
    return;
  }

  currentPhotoIndex = (currentPhotoIndex + direction + currentPhotoSet.length) % currentPhotoSet.length;
  updatePhotoViewer();
}

function photoButton(photo, label, className = "photo-open", setId = "", index = 0) {
  return `
    <button class="${className}" type="button" data-photo-set="${setId}" data-photo-index="${index}" data-photo-src="${photo.src}" data-photo-caption="${photo.caption}" aria-label="${label}">
      <img src="${photo.src}" alt="${photo.caption}" loading="lazy" />
    </button>
  `;
}

function renderPersonAlbum(album) {
  const thumbnails = album.photos
    .slice(0, 6)
    .map((photo, index) => photoButton(photo, `Открыть фотографию ${index + 1} из альбома`, "album-thumb", album.personId, index))
    .join("");

  return `
    <div class="person-album-slot">
      <h4>Фотоальбом</h4>
      <div class="person-album-thumbs">${thumbnails}</div>
      <button class="album-link" type="button" data-scroll-album="${album.personId}">
        Открыть альбом
      </button>
    </div>
  `;
}

function showPerson(id) {
  const person = people[id];
  if (!person) return;

  const album = albumsByPerson.get(id);
  const albumPanel = album
    ? renderPersonAlbum(album)
    : `<div class="person-photo-placeholder" aria-label="Место для фотоархива"><span>Здесь может быть фотоархив</span></div>`;

  const memoirLinks = (person.memoirs || [])
    .map((memoirId) => {
      const section = memoirs.sections.find((item) => item.id === memoirId);
      return section ? `<button type="button" class="memoir-link" data-memoir="${section.id}">${section.title}</button>` : "";
    })
    .join("");

  panelContentEl.innerHTML = `
    <div class="person-modal-layout">
      <div class="person-details">
        <h3>${person.name}</h3>
        <p class="dates">${person.dates || "даты не указаны"}</p>
        ${person.notes?.length ? `<ul class="fact-list">${person.notes.map((note) => `<li>${note}</li>`).join("")}</ul>` : ""}
        ${person.parents?.length ? `<h4>Родители</h4><div class="relation-list">${relatedList(person.parents)}</div>` : ""}
        ${person.partners?.length ? `<h4>Супруги</h4><div class="relation-list">${relatedList(person.partners)}</div>` : ""}
        ${person.children?.length ? `<h4>Дети</h4><div class="relation-list">${relatedList(person.children)}</div>` : ""}
        ${memoirLinks ? `<h4>Связанные тексты</h4><div class="relation-list">${memoirLinks}</div>` : ""}
      </div>
      ${albumPanel}
    </div>
  `;

  modalEl.hidden = false;
  document.body.classList.add("modal-open");
}

function renderMemoirTabs(activeId) {
  tabsEl.innerHTML = memoirs.sections
    .map(
      (section) => `
        <button type="button" class="${section.id === activeId ? "is-active" : ""}" data-memoir="${section.id}" role="tab">
          ${section.title}
        </button>
      `,
    )
    .join("");
}

function showMemoir(id = memoirs.sections[0].id) {
  const section = memoirs.sections.find((item) => item.id === id) || memoirs.sections[0];
  renderMemoirTabs(section.id);
  readerEl.innerHTML = `
    <h3>${section.title}</h3>
    <div class="memoir-text">
      ${section.paragraphs.map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`).join("")}
    </div>
  `;
}

function renderPhotos() {
  const albumCards = photoAlbums
    .map((album) => {
      const cover = album.photos[0];
      const strip = album.photos
        .slice(0, 4)
        .map((photo, index) => photoButton(photo, `Открыть фотографию ${index + 1} из альбома`, "album-thumb", album.personId, index))
        .join("");

      return `
        <article class="album-card" id="album-${album.personId}">
          <button class="album-cover" type="button" data-open-album="${album.personId}" aria-label="Открыть фотоальбом: ${album.title}">
            <img src="${cover.src}" alt="${album.title}" loading="lazy" />
            <span>Фотоальбом</span>
            <strong>${album.title}</strong>
            <small>${album.photos.length} фото</small>
          </button>
          <div class="album-strip">${strip}</div>
          <button class="album-card-link" type="button" data-person="${album.personId}">
            Открыть карточку в родословной
          </button>
        </article>
      `;
    })
    .join("");

  const archiveCards = memoirs.photos
    .map(
      (photo, index) => `
        <figure class="photo-card">
          ${photoButton(photo, `Открыть фотографию ${index + 1}`, "photo-open", "doc-archive", index)}
          <figcaption>${photo.caption}</figcaption>
        </figure>
      `,
    )
    .join("");

  photosEl.innerHTML = `
    <div class="album-grid">${albumCards}</div>
    <h3 class="archive-subtitle">Фотографии из исходного документа</h3>
    <div class="archive-grid">${archiveCards}</div>
  `;
}

function portraitForPerson(personId) {
  const album = albumsByPerson.get(personId);
  return album?.portrait || album?.photos?.[0]?.src || "";
}

function buildTreeData() {
  return Object.entries(people).map(([id, person]) => ({
    id,
    data: {
      name: person.name,
      dates: person.dates || "",
      notes: person.notes || [],
      gender: person.gender || "M",
      avatar: portraitForPerson(id),
    },
    rels: {
      parents: person.parents || [],
      spouses: person.partners || [],
      children: person.children || [],
    },
  }));
}

function buildTreeCardHtml(datum) {
  const { name, dates, avatar } = datum.data.data;
  return `
    <div class="card-inner family-chart-card ${avatar ? "has-portrait" : ""}">
      ${avatar ? `<img class="family-chart-card__portrait" src="${escapeHtml(avatar)}" alt="Портрет: ${escapeHtml(name)}" loading="lazy" />` : ""}
      <div class="family-chart-card__body">
        <strong class="family-chart-card__name">${escapeHtml(name)}</strong>
        <span class="family-chart-card__dates">${escapeHtml(dates || "даты неизвестны")}</span>
      </div>
    </div>
  `;
}

function paintTreeSearchState() {
  const query = searchEl.value.trim().toLowerCase();
  const cards = treeEl.querySelectorAll(".card[data-person-id]");

  cards.forEach((card) => {
    const person = people[card.dataset.personId];
    const hidden = query && person && !person.name.toLowerCase().includes(query);
    card.classList.toggle("is-dimmed", Boolean(hidden));
  });
}

function findFirstPersonMatch(query) {
  if (!query) {
    return "";
  }

  const normalized = query.toLowerCase();
  const match = Object.entries(people).find(([, person]) => person.name.toLowerCase().includes(normalized));
  return match?.[0] || "";
}

function syncSearchToTree() {
  const query = searchEl.value.trim();
  const matchId = findFirstPersonMatch(query);

  if (!query) {
    lastSearchFocusId = "";
    paintTreeSearchState();
    return;
  }

  if (matchId && matchId !== lastSearchFocusId && familyChart) {
    lastSearchFocusId = matchId;
    familyChart.updateMainId(matchId);
    familyChart.updateTree({ initial: false, tree_position: "fit", transition_time: 350 });
    return;
  }

  paintTreeSearchState();
}

function createTreeChart() {
  treeEl.innerHTML = "";
  treeEl.classList.add("f3", "family-tree-auto");

  const chart = window.f3
    .createChart(treeEl, buildTreeData())
    .setOrientationVertical()
    .setCardXSpacing(205)
    .setCardYSpacing(190)
    .setShowSiblingsOfMain(true)
    .setSingleParentEmptyCard(false)
    .setTransitionTime(700)
    .setAfterUpdate(() => {
      paintTreeSearchState();
    });

  const card = chart.setCardHtml();
  card
    .setStyle("rect")
    .setCardDim({ w: 252, h: 112 })
    .setCardInnerHtmlCreator((datum) => buildTreeCardHtml(datum))
    .setOnCardUpdate(function onCardUpdate(datum) {
      const cardEl = this.querySelector(".card");
      if (!cardEl) {
        return;
      }

      cardEl.dataset.personId = datum.data.id;
      cardEl.dataset.personName = datum.data.data.name.toLowerCase();
    })
    .setOnCardClick((event, datum) => {
      const personId = datum.data.id;
      showPerson(personId);
      chart.updateMainId(personId);
      chart.updateTree({ initial: false, tree_position: "inherit", transition_time: 350 });
    });

  chart.updateMainId(defaultTreeMainId);
  chart.updateTree({ initial: true, tree_position: "fit", transition_time: 0 });
  return chart;
}

function renderTree() {
  if (!window.f3?.createChart) {
    treeEl.innerHTML = `<p class="panel-empty">Не удалось загрузить модуль автоматического дерева.</p>`;
    return;
  }

  if (!familyChart) {
    familyChart = createTreeChart();
    return;
  }

  const currentMainId = familyChart.getMainDatum()?.id || defaultTreeMainId;
  familyChart.updateData(buildTreeData());
  familyChart.updateMainId(people[currentMainId] ? currentMainId : defaultTreeMainId);
  familyChart.updateTree({ initial: false, tree_position: "fit", transition_time: 0 });
}

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-photo]")) {
    closePhotoModal();
    return;
  }

  if (event.target.closest("[data-close-person]")) {
    closePersonModal();
    return;
  }

  const directPhotoButton = event.target.closest("[data-photo-src]");
  if (directPhotoButton) {
    const setId = directPhotoButton.dataset.photoSet;
    const index = Number(directPhotoButton.dataset.photoIndex);
    const album = albumsByPerson.get(setId);
    const photos = album?.photos || memoirs.photos;
    openPhotoSet(photos, Number.isFinite(index) ? index : 0);
    return;
  }

  const albumButton = event.target.closest("[data-open-album]");
  if (albumButton) {
    const album = albumsByPerson.get(albumButton.dataset.openAlbum);
    openPhotoSet(album?.photos || [], 0);
    return;
  }

  if (event.target.closest("[data-photo-prev]")) {
    showAdjacentPhoto(-1);
    return;
  }

  if (event.target.closest("[data-photo-next]")) {
    showAdjacentPhoto(1);
    return;
  }

  const albumScrollButton = event.target.closest("[data-scroll-album]");
  if (albumScrollButton) {
    closePersonModal();
    document.querySelector(`#album-${albumScrollButton.dataset.scrollAlbum}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }

  const personButton = event.target.closest("[data-person]");
  if (personButton) {
    showPerson(personButton.dataset.person);
    return;
  }

  const memoirButton = event.target.closest("[data-memoir]");
  if (memoirButton) {
    showMemoir(memoirButton.dataset.memoir);
    closePersonModal();
    document.querySelector("#memoirs").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !photoModalEl.hidden) {
    closePhotoModal();
    return;
  }

  if (event.key === "ArrowLeft" && !photoModalEl.hidden) {
    showAdjacentPhoto(-1);
    return;
  }

  if (event.key === "ArrowRight" && !photoModalEl.hidden) {
    showAdjacentPhoto(1);
    return;
  }

  if (event.key === "Escape" && !modalEl.hidden) {
    closePersonModal();
  }
});

searchEl.addEventListener("input", syncSearchToTree);
document.querySelector("#expand-all").addEventListener("click", () => {
  searchEl.value = "";
  lastSearchFocusId = "";
  if (familyChart) {
    familyChart.updateMainId(defaultTreeMainId);
    familyChart.updateTree({ initial: false, tree_position: "fit", transition_time: 350 });
  }
});
document.querySelector("#collapse-all").addEventListener("click", () => {
  searchEl.value = "";
  lastSearchFocusId = "";
  if (familyChart) {
    familyChart.updateMainId(defaultTreeMainId);
    familyChart.updateTree({ initial: false, tree_position: "fit", transition_time: 350 });
  }
  showPerson(defaultTreeMainId);
});

renderTree();
showMemoir();
renderPhotos();
