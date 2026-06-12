const family = window.FAMILY;
const memoirs = window.MEMOIRS;
const photoAlbums = window.PHOTO_ALBUMS || [];
const people = family.people;
const albumsByPerson = new Map(photoAlbums.map((album) => [album.personId, album]));
const memoirSectionOrder = [
  "воспоминания-веры-дмитриевны-подковцевой",
  "русская-печь",
  "семейные-хроники",
  "воспоминания-о-детстве-и-бабушке",
  "отец",
  "родители",
  "земляничное-мыло",
  "письма-к-сыну",
  "устами-младенцев",
];
const memoirSectionAuthors = {
  "воспоминания-веры-дмитриевны-подковцевой": "Подковцева В. Д.",
  "русская-печь": "Подковцева В. Д.",
  "семейные-хроники": "Подковцева Е. Н.",
  "воспоминания-о-детстве-и-бабушке": "Фатеев К. А.",
  "отец": "Повалюхина Т. Н.",
  "родители": "Повалюхина Т. Н.",
  "земляничное-мыло": "Повалюхина Т. Н.",
  "письма-к-сыну": "Повалюхина Т. Н.",
};
const memoirSections = (() => {
  const orderIndex = new Map(memoirSectionOrder.map((id, index) => [id, index]));
  return [...(memoirs.sections || [])].sort((left, right) => {
    const leftIndex = orderIndex.has(left.id) ? orderIndex.get(left.id) : Number.MAX_SAFE_INTEGER;
    const rightIndex = orderIndex.has(right.id) ? orderIndex.get(right.id) : Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
})();

const treeEl = document.querySelector("#family-tree");
const modalEl = document.querySelector("#person-modal");
const panelContentEl = document.querySelector("#person-panel-content");
const searchEl = document.querySelector("#person-search");
const tabsEl = document.querySelector("#memoir-tabs");
const memoirModalEl = document.querySelector("#memoir-modal");
const memoirModalContentEl = document.querySelector("#memoir-modal-content");
const memoirDialogEl = document.querySelector(".memoir-dialog");
const photosEl = document.querySelector("#photo-grid");
const photoModalEl = document.querySelector("#photo-modal");
const photoViewerImageEl = document.querySelector("#photo-viewer-image");
const photoViewerCaptionEl = document.querySelector("#photo-viewer-caption");
const photoViewerCounterEl = document.querySelector("#photo-viewer-counter");
const photoPrevButtonEl = document.querySelector("[data-photo-prev]");
const photoNextButtonEl = document.querySelector("[data-photo-next]");
const publishSiteButtonEl = document.querySelector("[data-publish-site]");
const publishStatusEl = document.querySelector("[data-publish-status]");
const navToggleEl = document.querySelector(".nav-toggle");
const topNavEl = document.querySelector(".top-nav");
const defaultTreeMainId = "anna-kuteinikova";
const requestedTreeMainId = (() => {
  const mainId = new URLSearchParams(window.location.search).get("main");
  return mainId && people[mainId] ? mainId : "";
})();
const assetUrl = window.__withAssetVersion || ((path) => path);

let currentPhotoSet = [];
let currentPhotoIndex = 0;
let familyChart = null;
let lastSearchFocusId = "";
let currentTreeMainId = requestedTreeMainId || defaultTreeMainId;
let marriageFanTimerId = 0;
let treeViewportMode = "";
let treeResizeTimerId = 0;
const multiPartnerIds = Object.keys(people).filter((id) => (people[id].partners || []).length > 1);

function getTreeMetrics() {
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;

  if (viewportWidth <= 375) {
    return { key: "phone-xs", cardWidth: 160, cardHeight: 70, cardXSpacing: 196, cardYSpacing: 170 };
  }

  if (viewportWidth <= 430) {
    return { key: "phone-sm", cardWidth: 180, cardHeight: 80, cardXSpacing: 220, cardYSpacing: 184 };
  }

  if (viewportWidth <= 560) {
    return { key: "phone", cardWidth: 188, cardHeight: 82, cardXSpacing: 230, cardYSpacing: 192 };
  }

  return { key: "desktop", cardWidth: 224, cardHeight: 98, cardXSpacing: 290, cardYSpacing: 245 };
}

function updateModalOpenState() {
  const anyModalOpen = !modalEl.hidden || !photoModalEl.hidden || !memoirModalEl.hidden;
  document.body.classList.toggle("modal-open", anyModalOpen);
}

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
  updateModalOpenState();
}

function closePhotoModal() {
  photoModalEl.hidden = true;
  photoViewerImageEl.removeAttribute("src");
  photoViewerImageEl.alt = "";
  photoViewerCaptionEl.textContent = "";
  photoViewerCounterEl.textContent = "";
  currentPhotoSet = [];
  currentPhotoIndex = 0;
  updateModalOpenState();
}

function closeMemoirModal() {
  memoirModalEl.hidden = true;
  if (memoirDialogEl) {
    memoirDialogEl.scrollTop = 0;
  }
  updateModalOpenState();
}

function updatePhotoViewer() {
  const photo = currentPhotoSet[currentPhotoIndex];
  if (!photo) {
    return;
  }

  photoViewerImageEl.src = assetUrl(photo.src);
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
  updateModalOpenState();
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
      <img src="${assetUrl(photo.src)}" alt="${photo.caption}" loading="lazy" />
    </button>
  `;
}

function normalizeAlbum(album) {
  return {
    ...album,
    photos: Array.isArray(album?.photos) ? album.photos : [],
    videos: Array.isArray(album?.videos) ? album.videos : [],
    externalLinks: Array.isArray(album?.externalLinks) ? album.externalLinks : [],
  };
}

function albumCoverSrc(album) {
  if (album?.portrait) {
    return album.portrait;
  }

  if (album?.photos?.[0]?.src) {
    return album.photos[0].src;
  }

  if (album?.videos?.[0]?.poster) {
    return album.videos[0].poster;
  }

  return "";
}

function albumMediaSummary(album) {
  const parts = [];
  if (album.photos.length) {
    parts.push(`${album.photos.length} фото`);
  }
  if (album.videos.length) {
    parts.push(`${album.videos.length} видео`);
  }
  if (album.externalLinks.length) {
    parts.push(`${album.externalLinks.length} ссылок`);
  }
  return parts.join(" · ") || "Пока без материалов";
}

function externalLinkLabel(link) {
  if (link.title) {
    return link.title;
  }

  try {
    const parsed = new URL(link.url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return link.url;
  }
}

function extractYouTubeVideoId(rawUrl = "") {
  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v") || "";
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || "";
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] || "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

function renderExternalLinkCard(link) {
  const videoId = extractYouTubeVideoId(link.url || "");
  if (videoId) {
    const embedOrigin = typeof location !== "undefined" ? location.origin : "";
    const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`);
    embedUrl.searchParams.set("playsinline", "1");
    embedUrl.searchParams.set("rel", "0");
    if (embedOrigin && embedOrigin !== "null") {
      embedUrl.searchParams.set("origin", embedOrigin);
    }
    return `
      <article class="album-external-youtube">
        <div class="album-external-player">
          <iframe
            src="${embedUrl.toString()}"
            title="${escapeHtml(link.title || "YouTube видео")}"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin">
          </iframe>
        </div>
        <div class="album-external-meta">
          <strong>${escapeHtml(externalLinkLabel(link))}</strong>
          <span>YouTube</span>
          <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">Открыть на YouTube</a>
        </div>
      </article>
    `;
  }

  return `
    <a class="album-external-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
      <strong>${escapeHtml(externalLinkLabel(link))}</strong>
      <span>${escapeHtml(link.kind || "ссылка")}</span>
    </a>
  `;
}

function renderVideoCards(videos, className = "album-video-grid") {
  if (!videos.length) {
    return "";
  }

  return `
    <div class="${className}">
      ${videos
        .map(
          (video, index) => `
            <article class="album-video-card">
              <video controls preload="metadata" playsinline ${video.poster ? `poster="${escapeHtml(assetUrl(video.poster))}"` : ""}>
                <source src="${escapeHtml(assetUrl(video.src))}" />
              </video>
              <span>${escapeHtml(video.caption || `Видео ${index + 1}`)}</span>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderExternalLinkCards(links, className = "album-link-list") {
  if (!links.length) {
    return "";
  }

  return `
    <div class="${className}">
      ${links.map((link) => renderExternalLinkCard(link)).join("")}
    </div>
  `;
}

function renderPersonAlbum(album) {
  const normalizedAlbum = normalizeAlbum(album);
  const thumbnails = normalizedAlbum.photos
    .map((photo, index) => photoButton(photo, `Открыть фотографию ${index + 1} из альбома`, "album-thumb", album.personId, index))
    .join("");

  return `
    <div class="person-album-slot">
      <h4>Фотоальбом</h4>
      <p class="person-album-summary">${escapeHtml(albumMediaSummary(normalizedAlbum))}</p>
      ${thumbnails ? `<div class="person-album-thumbs-scroll"><div class="person-album-thumbs">${thumbnails}</div></div>` : ""}
      ${renderVideoCards(normalizedAlbum.videos.slice(0, 2), "person-album-videos")}
      ${renderExternalLinkCards(normalizedAlbum.externalLinks.slice(0, 4), "person-album-links")}
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
      const section = memoirSections.find((item) => item.id === memoirId);
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
  updateModalOpenState();
}

function renderMemoirTabs(activeId) {
  tabsEl.innerHTML = memoirSections
    .map(
      (section) => {
        const author = memoirSectionAuthors[section.id];
        return `
        <button type="button" class="${section.id === activeId ? "is-active" : ""}" data-memoir="${section.id}" role="tab">
          <span class="memoir-tab-title">${section.title}</span>
          ${author ? `<span class="memoir-tab-author">${author}</span>` : ""}
        </button>
      `;
      },
    )
    .join("");
}

function showMemoir(id = memoirSections[0].id) {
  const section = memoirSections.find((item) => item.id === id) || memoirSections[0];
  renderMemoirTabs(section.id);
  memoirModalContentEl.innerHTML = `
    <h3>${section.title}</h3>
    <div class="memoir-text">
      ${section.paragraphs.map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`).join("")}
    </div>
  `;
  memoirModalEl.hidden = false;
  if (memoirDialogEl) {
    memoirDialogEl.scrollTop = 0;
  }
  updateModalOpenState();
}

function renderPhotos() {
  const albumCards = photoAlbums
    .map((album) => {
      const normalizedAlbum = normalizeAlbum(album);
      const cover = albumCoverSrc(normalizedAlbum);
      const strip = normalizedAlbum.photos
        .slice(0, 4)
        .map((photo, index) => photoButton(photo, `Открыть фотографию ${index + 1} из альбома`, "album-thumb", album.personId, index))
        .join("");

      return `
        <article class="album-card" id="album-${album.personId}">
          <button class="album-cover" type="button" data-open-album="${album.personId}" aria-label="Открыть фотоальбом: ${album.title}" ${normalizedAlbum.photos.length ? "" : "disabled"}>
            ${
              cover
                ? `<img src="${assetUrl(cover)}" alt="${album.title}" loading="lazy" />`
                : `<div class="album-cover-placeholder">Нет обложки</div>`
            }
            <span>Фотоальбом</span>
            <strong>${album.title}</strong>
            <small>${escapeHtml(albumMediaSummary(normalizedAlbum))}</small>
          </button>
          ${strip ? `<div class="album-strip">${strip}</div>` : ""}
          ${renderVideoCards(normalizedAlbum.videos.slice(0, 2))}
          ${renderExternalLinkCards(normalizedAlbum.externalLinks)}
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
  const album = normalizeAlbum(albumsByPerson.get(personId));
  return albumCoverSrc(album);
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
      ${avatar ? `<img class="family-chart-card__portrait" src="${escapeHtml(assetUrl(avatar))}" alt="Портрет: ${escapeHtml(name)}" loading="lazy" />` : ""}
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

  const metrics = getTreeMetrics();

  return {
    x: point.x,
    y: point.y,
    width: metrics.cardWidth,
    height: metrics.cardHeight,
    left: point.x,
    top: point.y,
    right: point.x + metrics.cardWidth,
    bottom: point.y + metrics.cardHeight,
    cx: point.x + metrics.cardWidth / 2,
    cy: point.y + metrics.cardHeight / 2,
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
  treeEl.querySelectorAll(".spouse-link-marker").forEach((marker) => marker.remove());
  treeEl.querySelectorAll(".link.is-hidden-marriage-link").forEach((line) => line.classList.remove("is-hidden-marriage-link"));
}

function addSpouseLinkMarkers() {
  const linksView = treeEl.querySelector(".links_view");
  if (!linksView) {
    return;
  }

  treeEl.querySelectorAll(".link.is-spouse-link").forEach((link) => {
    if (typeof link.getTotalLength !== "function" || typeof link.getPointAtLength !== "function") {
      return;
    }

    const totalLength = link.getTotalLength();
    if (!Number.isFinite(totalLength) || totalLength < 12) {
      return;
    }

    const middle = link.getPointAtLength(totalLength / 2);
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    marker.setAttribute("class", "spouse-link-marker");
    marker.setAttribute("cx", middle.x);
    marker.setAttribute("cy", middle.y);
    marker.setAttribute("r", "5.5");
    linksView.appendChild(marker);
  });
}

function decorateTreeLinks() {
  const links = treeEl.querySelectorAll(".links_view .link");

  links.forEach((link) => {
    link.classList.remove("is-spouse-link", "is-parent-link");
    const data = link.__data__;
    if (!data) {
      return;
    }

    if (data.spouse) {
      link.classList.add("is-spouse-link");
      return;
    }

    link.classList.add("is-parent-link");
  });
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

function layoutShiftedFamilyCluster({
  personId,
  spouseId,
  childOrder,
  spouseShiftX = 0,
  childrenShiftX = 0,
}) {
  const linksView = treeEl.querySelector(".links_view");
  const personBox = getCardBox(personId);
  const spouseBox = getCardBox(spouseId);
  if (!linksView || !personBox || !spouseBox) {
    return;
  }

  const orderedChildBoxes = childOrder
    .map((childId) => ({ childId, box: getCardBox(childId) }))
    .filter((entry) => entry.box);

  if (!orderedChildBoxes.length) {
    return;
  }

  const currentChildSlots = orderedChildBoxes
    .map((entry) => entry.box)
    .slice()
    .sort((a, b) => a.x - b.x)
    .map((box) => ({
      x: box.x + childrenShiftX,
      y: box.y,
    }));

  setCardPoint(spouseId, {
    x: spouseBox.x + spouseShiftX,
    y: spouseBox.y,
  });

  childOrder.forEach((childId, index) => {
    const targetSlot = currentChildSlots[index];
    if (!targetSlot || !getCardBox(childId)) {
      return;
    }

    setCardPoint(childId, targetSlot);
  });

  hideOriginalMarriageLinks(personId, spouseId, childOrder);

  const updatedSpouseBox = getCardBox(spouseId);
  const updatedChildBoxes = childOrder
    .map((childId) => getCardBox(childId))
    .filter(Boolean);

  if (!updatedSpouseBox || !updatedChildBoxes.length) {
    return;
  }

  addMarriageFanPath(
    linksView,
    [
      { x: personBox.right, y: personBox.cy },
      { x: updatedSpouseBox.left, y: updatedSpouseBox.cy },
    ],
    "marriage-fan-link spouse-cluster-link",
  );

  const familyJoinX = (personBox.cx + updatedSpouseBox.cx) / 2;
  const childJoinY = Math.min(...updatedChildBoxes.map((box) => box.top)) - 18;

  addMarriageFanPath(linksView, [
    { x: familyJoinX, y: personBox.bottom },
    { x: familyJoinX, y: childJoinY },
    { x: updatedChildBoxes[0].cx, y: childJoinY },
    { x: updatedChildBoxes[updatedChildBoxes.length - 1].cx, y: childJoinY },
  ]);

  updatedChildBoxes.forEach((box) => {
    addMarriageFanPath(linksView, [
      { x: box.cx, y: childJoinY },
      { x: box.cx, y: box.top },
    ]);
  });
}

function layoutMarriageFan(personId) {
  const person = people[personId];
  const spouses = (person.partners || []).slice();
  if (spouses.length < 2) {
    return;
  }

  const metrics = getTreeMetrics();

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
        spouseBox,
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
  const defaultSpouseTopY = personBox.bottom + 58;
  const minSpouseTopY = personBox.bottom + 34;
  const minSpouseCenterGap = metrics.cardWidth + 42;
  const allChildBoxes = spouseTargets.flatMap((spouse) => spouse.childBoxes);
  const minChildTop = allChildBoxes.length ? Math.min(...allChildBoxes.map((box) => box.top)) : Infinity;
  const maxAllowedSpouseTopY = Number.isFinite(minChildTop)
    ? minChildTop - metrics.cardHeight - 28
    : defaultSpouseTopY;
  const spouseTopY = Number.isFinite(maxAllowedSpouseTopY)
    ? Math.max(minSpouseTopY, Math.min(defaultSpouseTopY, maxAllowedSpouseTopY))
    : defaultSpouseTopY;
  const targetXs = spouseTargets.map((spouse) => spouse.targetCenterX);
  const maxTargetDeviation = targetXs.length
    ? Math.max(...targetXs.map((x) => Math.abs(x - personBox.cx)))
    : minSpouseCenterGap / 2;
  const halfSpan = Math.max(
    minSpouseCenterGap * (spouseTargets.length - 1) / 2,
    maxTargetDeviation
  );
  const rowStartX = personBox.cx - halfSpan;
  const rowGap = spouseTargets.length > 1 ? (halfSpan * 2) / (spouseTargets.length - 1) : 0;

  spouseTargets.forEach((spouse, index) => {
    spouse.spouseTopY = spouseTopY;
    spouse.spouseCenterX = rowStartX + rowGap * index;
    setCardPoint(spouse.spouseId, {
      x: spouse.spouseCenterX - metrics.cardWidth / 2,
      y: spouse.spouseTopY,
    });
    hideOriginalMarriageLinks(personId, spouse.spouseId, spouse.childIds);
  });

  spouseTargets.forEach((spouse) => {
    addMarriageFanPath(linksView, [
      { x: personBox.cx, y: personBox.bottom },
      { x: personBox.cx, y: branchY },
      { x: spouse.spouseCenterX, y: branchY },
      { x: spouse.targetCenterX, y: spouse.spouseTopY },
    ]);

    if (!spouse.childBoxes.length) {
      return;
    }

    const childJoinY = Math.min(...spouse.childBoxes.map((box) => box.top)) - 18;
    addMarriageFanPath(linksView, [
      { x: spouse.spouseCenterX, y: spouse.spouseTopY + metrics.cardHeight },
      { x: spouse.spouseCenterX, y: childJoinY },
      { x: spouse.targetCenterX, y: childJoinY },
    ], "marriage-fan-link");

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
  decorateTreeLinks();
  addSpouseLinkMarkers();
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
  const metrics = getTreeMetrics();
  treeEl.innerHTML = "";
  treeEl.classList.add("f3", "family-tree-auto");
  treeViewportMode = metrics.key;

  const chart = window.f3
    .createChart(treeEl, buildTreeData())
    .setOrientationVertical()
    .setCardXSpacing(metrics.cardXSpacing)
    .setCardYSpacing(metrics.cardYSpacing)
    .setShowSiblingsOfMain(true)
    .setDuplicateBranchToggle(true)
    .setSingleParentEmptyCard(false)
    .setTransitionTime(700)
    .setAfterUpdate((updateOptions = {}) => {
      scheduleMarriageFanLayout(updateOptions.transition_time);
      paintTreeSearchState();
    });

  const card = chart.setCardHtml();
  card
    .setStyle("rect")
    .setCardDim({ w: metrics.cardWidth, h: metrics.cardHeight })
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

  currentTreeMainId = people[currentTreeMainId] ? currentTreeMainId : defaultTreeMainId;
  chart.updateMainId(currentTreeMainId);
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

  if (event.target.closest("[data-close-memoir]")) {
    closeMemoirModal();
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
    return;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !memoirModalEl.hidden) {
    closeMemoirModal();
    return;
  }

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

async function publishSiteFromLocalPreview() {
  if (!publishSiteButtonEl || !publishStatusEl) {
    return;
  }

  publishSiteButtonEl.disabled = true;
  publishStatusEl.textContent = "Публикую...";

  try {
    const response = await fetch("http://127.0.0.1:8765/api/admin/publish", {
      method: "POST",
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Publish failed");
    }

    if (payload.noChanges) {
      publishStatusEl.textContent = "Изменений нет.";
      return;
    }

    const buildStatus = payload.pagesBuild?.status;
    publishStatusEl.textContent = buildStatus
      ? `Опубликовано: ${payload.commit} · Pages: ${buildStatus}`
      : `Опубликовано: ${payload.commit}`;
  } catch (error) {
    publishStatusEl.textContent = "Запусти start-admin.bat и попробуй снова.";
    console.error("Publish failed:", error);
  } finally {
    publishSiteButtonEl.disabled = false;
  }
}

document.querySelectorAll('[data-tree-action="expand-all"]').forEach((button) => {
  button.addEventListener("click", showFullTree);
});

publishSiteButtonEl?.addEventListener("click", publishSiteFromLocalPreview);

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

/* ===== Mobile: Hamburger Menu ===== */

function closeNav() {
  navToggleEl?.classList.remove("is-open");
  topNavEl?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  navToggleEl?.setAttribute("aria-expanded", "false");
  navToggleEl?.setAttribute("aria-label", "Открыть меню");
}

function toggleNav() {
  const isOpen = topNavEl?.classList.toggle("is-open");
  navToggleEl?.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("nav-open", Boolean(isOpen));
  navToggleEl?.setAttribute("aria-expanded", String(Boolean(isOpen)));
  navToggleEl?.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
}

navToggleEl?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleNav();
});

// Close nav when clicking a link inside it
topNavEl?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeNav();
  }
});

// Close nav when clicking outside
document.addEventListener("click", (event) => {
  if (topNavEl?.classList.contains("is-open") && !event.target.closest(".site-header")) {
    closeNav();
  }
});

// Close nav on Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && topNavEl?.classList.contains("is-open")) {
    closeNav();
  }
});

/* ===== Mobile: Touch swipe for photo viewer ===== */

let photoSwipeStartX = 0;
let photoSwipeStartY = 0;
let photoSwipeActive = false;

photoModalEl?.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  if (!touch) return;
  photoSwipeStartX = touch.clientX;
  photoSwipeStartY = touch.clientY;
  photoSwipeActive = true;
}, { passive: true });

photoModalEl?.addEventListener("touchmove", (event) => {
  if (!photoSwipeActive) return;
  const touch = event.touches[0];
  if (!touch) return;
  const dx = touch.clientX - photoSwipeStartX;
  const dy = touch.clientY - photoSwipeStartY;
  // Only trigger horizontal swipe if more horizontal than vertical
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    photoSwipeActive = false;
    if (dx > 0) {
      showAdjacentPhoto(-1); // swipe right → prev
    } else {
      showAdjacentPhoto(1);  // swipe left → next
    }
  }
}, { passive: true });

photoModalEl?.addEventListener("touchend", () => {
  photoSwipeActive = false;
}, { passive: true });

window.addEventListener("resize", () => {
  if (treeResizeTimerId) {
    window.clearTimeout(treeResizeTimerId);
  }

  treeResizeTimerId = window.setTimeout(() => {
    treeResizeTimerId = 0;
    const nextMode = getTreeMetrics().key;
    if (nextMode !== treeViewportMode) {
      renderTree();
    }
  }, 120);
});

renderTree();
renderMemoirTabs(memoirSections[0].id);
renderPhotos();

