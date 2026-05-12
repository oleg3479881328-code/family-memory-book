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
const TREE_CARD_WIDTH = 224;
const TREE_CARD_HEIGHT = 98;

const defaultTreeMainId = "anna-kuteinikova";

let currentPhotoSet = [];
let currentPhotoIndex = 0;
let familyChart = null;
let lastSearchFocusId = "";
let currentTreeMainId = defaultTreeMainId;
let marriageFanTimerId = 0;
const multiPartnerIds = Object.keys(people).filter((id) => (people[id].partners || []).length > 1);

function focusTreeSection() {
  document.querySelector("#tree")?.scrollIntoView({ behavior: "auto", block: "start" });
}

function centerTreeMainCard(chart, transitionTime = 0) {
  const mainDatum = chart?.getTreeMainDatum?.();
  const svg = chart?.svg;
  if (!mainDatum || !svg || !window.f3?.handlers?.cardToMiddle) {
    return;
  }

  const svgDim = {
    width: svg.clientWidth,
    height: svg.clientHeight,
  };

  window.f3.handlers.cardToMiddle({
    datum: mainDatum,
    svg,
    svg_dim: svgDim,
    transition_time: transitionTime,
  });
}

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

function parseTranslate(transformValue = "") {
  const match = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(transformValue);
  if (!match) {
    return null;
  }

  return {
    x: Number(match[1]),
    y: Number(match[2]),
  };
}

function getCardContainer(personId) {
  return treeEl.querySelector(`.card[data-person-id="${personId}"]`)?.closest(".card_cont") || null;
}

function getCardPoint(personId) {
  const container = getCardContainer(personId);
  if (!container) {
    return null;
  }

  return parseTranslate(container.style.transform);
}

function getCardBox(personId) {
  const point = getCardPoint(personId);
  if (!point) {
    return null;
  }

  return {
    x: point.x,
    y: point.y,
    width: TREE_CARD_WIDTH,
    height: TREE_CARD_HEIGHT,
    left: point.x,
    top: point.y,
    right: point.x + TREE_CARD_WIDTH,
    bottom: point.y + TREE_CARD_HEIGHT,
    cx: point.x + TREE_CARD_WIDTH / 2,
    cy: point.y + TREE_CARD_HEIGHT / 2,
  };
}

function setCardPoint(personId, point) {
  const container = getCardContainer(personId);
  if (!container || !point) {
    return;
  }

  container.style.transform = `translate(${point.x}px, ${point.y}px)`;
}

function clearMarriageFanLayout() {
  treeEl.querySelectorAll(".marriage-fan-link").forEach((line) => line.remove());
  treeEl.querySelectorAll(".link.is-hidden-marriage-link").forEach((line) => line.classList.remove("is-hidden-marriage-link"));
}

function spouseChildrenFor(personId, spouseId) {
  return (people[personId].children || []).filter((childId) => (people[childId].parents || []).includes(spouseId));
}

function addMarriageFanPath(svg, points, className = "marriage-fan-link") {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const [start, ...rest] = points;
  const commands = [`M ${start.x} ${start.y}`];

  rest.forEach((point) => {
    commands.push(`L ${point.x} ${point.y}`);
  });

  path.setAttribute("d", commands.join(" "));
  path.setAttribute("class", className);
  svg.appendChild(path);
}

function hideOriginalMarriageLinks(personId, spouseId, childIds) {
  const links = treeEl.querySelectorAll(".links_view .link");

  links.forEach((link) => {
    const data = link.__data__;
    if (!data) {
      return;
    }

    if (data.spouse) {
      const sourceId = data.source?.data?.id;
      const targetId = data.target?.data?.id;
      if (
        (sourceId === personId && targetId === spouseId) ||
        (sourceId === spouseId && targetId === personId)
      ) {
        link.classList.add("is-hidden-marriage-link");
      }
      return;
    }

    const targetId = data.target?.data?.id;
    const sourceIds = Array.isArray(data.source)
      ? data.source.map((item) => item?.data?.id).filter(Boolean)
      : [data.source?.data?.id].filter(Boolean);

    if (childIds.includes(targetId) && sourceIds.includes(personId) && sourceIds.includes(spouseId)) {
      link.classList.add("is-hidden-marriage-link");
    }
  });
}

function layoutMarriageFan(personId) {
  const person = people[personId];
  const spouses = (person.partners || []).slice();
  if (spouses.length < 2) {
    return;
  }

  const linksView = treeEl.querySelector(".links_view");
  const personBox = getCardBox(personId);
  if (!linksView || !personBox) {
    return;
  }

  const spouseTargets = spouses
    .map((spouseId) => {
      const spouseBox = getCardBox(spouseId);
      if (!spouseBox) {
        return null;
      }

      const childIds = spouseChildrenFor(personId, spouseId);
      const childBoxes = childIds.map((childId) => getCardBox(childId)).filter(Boolean);
      const targetCenterX = childBoxes.length
        ? childBoxes.reduce((sum, box) => sum + box.cx, 0) / childBoxes.length
        : spouseBox.cx;

      return {
        spouseId,
        childIds,
        childBoxes,
        targetCenterX,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.targetCenterX - b.targetCenterX);

  if (spouseTargets.length < 2) {
    return;
  }

  const branchY = personBox.bottom + 24;
  const defaultSpouseTopY = personBox.bottom + 82;
  const minSpouseTopY = personBox.bottom + 34;

  spouseTargets.forEach((spouse) => {
    const minChildTop = spouse.childBoxes.length ? Math.min(...spouse.childBoxes.map((box) => box.top)) : Infinity;
    const maxAllowedSpouseTopY = minChildTop - TREE_CARD_HEIGHT - 32;
    const spouseTopY = Number.isFinite(maxAllowedSpouseTopY)
      ? Math.max(minSpouseTopY, Math.min(defaultSpouseTopY, maxAllowedSpouseTopY))
      : defaultSpouseTopY;

    spouse.spouseTopY = spouseTopY;
    setCardPoint(spouse.spouseId, {
      x: spouse.targetCenterX - TREE_CARD_WIDTH / 2,
      y: spouseTopY,
    });
    hideOriginalMarriageLinks(personId, spouse.spouseId, spouse.childIds);
  });

  spouseTargets.forEach((spouse) => {
    addMarriageFanPath(linksView, [
      { x: personBox.cx, y: personBox.bottom },
      { x: personBox.cx, y: branchY },
      { x: spouse.targetCenterX, y: branchY },
      { x: spouse.targetCenterX, y: spouse.spouseTopY },
    ]);

    if (!spouse.childBoxes.length) {
      return;
    }

    const childJoinY = Math.min(...spouse.childBoxes.map((box) => box.top)) - 18;
    addMarriageFanPath(linksView, [
      { x: spouse.targetCenterX, y: spouse.spouseTopY + TREE_CARD_HEIGHT },
      { x: spouse.targetCenterX, y: childJoinY },
    ]);

    if (spouse.childBoxes.length > 1) {
      addMarriageFanPath(linksView, [
        { x: spouse.childBoxes[0].cx, y: childJoinY },
        { x: spouse.childBoxes[spouse.childBoxes.length - 1].cx, y: childJoinY },
      ]);
    }

    spouse.childBoxes.forEach((box) => {
      addMarriageFanPath(linksView, [
        { x: box.cx, y: childJoinY },
        { x: box.cx, y: box.top },
      ]);
    });
  });
}

function applyCustomMarriageFanLayout() {
  clearMarriageFanLayout();

  if (currentTreeMainId && multiPartnerIds.includes(currentTreeMainId)) {
    layoutMarriageFan(currentTreeMainId);
  }
}

function scheduleMarriageFanLayout(transitionTime = 0) {
  if (marriageFanTimerId) {
    window.clearTimeout(marriageFanTimerId);
  }

  const delay = Math.max(0, Number(transitionTime) || 0) + 40;
  marriageFanTimerId = window.setTimeout(() => {
    marriageFanTimerId = 0;
    applyCustomMarriageFanLayout();
  }, delay);
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
    currentTreeMainId = matchId;
    familyChart.updateMainId(matchId);
    familyChart.updateTree({ initial: false, tree_position: "fit", transition_time: 350 });
    centerTreeMainCard(familyChart, 350);
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
    .setCardXSpacing(290)
    .setCardYSpacing(245)
    .setShowSiblingsOfMain(true)
    .setSingleParentEmptyCard(false)
    .setTransitionTime(700)
    .setAfterUpdate((updateOptions = {}) => {
      scheduleMarriageFanLayout(updateOptions.transition_time);
      paintTreeSearchState();
    });

  const card = chart.setCardHtml();
  card
    .setStyle("rect")
    .setCardDim({ w: 224, h: 98 })
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
      currentTreeMainId = personId;
      chart.updateMainId(personId);
      chart.updateTree({ initial: false, tree_position: "fit", transition_time: 0 });
      centerTreeMainCard(chart, 0);
      focusTreeSection();
    });

  currentTreeMainId = defaultTreeMainId;
  chart.updateMainId(defaultTreeMainId);
  chart.updateTree({ initial: true, tree_position: "fit", transition_time: 0 });
  centerTreeMainCard(chart, 0);
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

  familyChart.updateData(buildTreeData());
  currentTreeMainId = people[currentTreeMainId] ? currentTreeMainId : defaultTreeMainId;
  familyChart.updateMainId(currentTreeMainId);
  familyChart.updateTree({ initial: false, tree_position: "fit", transition_time: 0 });
  centerTreeMainCard(familyChart, 0);
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

function showFullTree() {
  searchEl.value = "";
  lastSearchFocusId = "";
  if (familyChart) {
    currentTreeMainId = defaultTreeMainId;
    familyChart.updateMainId(defaultTreeMainId);
    familyChart.updateTree({ initial: false, tree_position: "fit", transition_time: 350 });
    centerTreeMainCard(familyChart, 350);
  }
}

document.querySelectorAll('[data-tree-action="expand-all"]').forEach((button) => {
  button.addEventListener("click", showFullTree);
});

document.querySelector("#collapse-all").addEventListener("click", () => {
  searchEl.value = "";
  lastSearchFocusId = "";
  if (familyChart) {
    currentTreeMainId = defaultTreeMainId;
    familyChart.updateMainId(defaultTreeMainId);
    familyChart.updateTree({ initial: false, tree_position: "fit", transition_time: 350 });
    centerTreeMainCard(familyChart, 350);
  }
  showPerson(defaultTreeMainId);
});

renderTree();
showMemoir();
renderPhotos();
