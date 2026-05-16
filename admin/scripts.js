const API_STATE_URL = "/api/admin/state";
const API_SAVE_URL = "/api/admin/save";
const API_ALBUM_CHECK_URL = "/api/admin/albums/check";
const API_ALBUM_SYNC_URL = "/api/admin/albums/sync";
const API_PUBLISH_URL = "/api/admin/publish";

const state = {
  family: { roots: [], people: {} },
  albums: [],
  selectedPersonId: "",
  search: "",
  uploadQueue: {},
  videoUploadQueue: {},
  nextUploadId: 1,
  deletedPhotos: [],
  dirty: false,
  serverReady: false,
};

const ui = {
  reloadData: document.querySelector("#reload-data"),
  saveAll: document.querySelector("#save-all"),
  search: document.querySelector("#person-search"),
  peopleList: document.querySelector("#people-list"),
  peopleCount: document.querySelector("#people-count"),
  saveStatus: document.querySelector("#save-status"),
  serverWarning: document.querySelector("#server-warning"),
  checkAlbumUpdates: document.querySelector("#check-album-updates"),
  syncAlbumUpdates: document.querySelector("#sync-album-updates"),
  publishSite: document.querySelector("#publish-site"),
  syncStatus: document.querySelector("#sync-status"),
  syncReport: document.querySelector("#sync-report"),
  personEditor: document.querySelector("#person-editor"),
  personIdBadge: document.querySelector("#person-id-badge"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setStatus(message, isError = false) {
  ui.saveStatus.textContent = message;
  ui.serverWarning.hidden = !isError;
}

function setSyncStatus(message, isError = false) {
  ui.syncStatus.textContent = message;
  ui.syncStatus.classList.toggle("warning", isError);
}

function markDirty(message = "Есть несохранённые изменения.") {
  state.dirty = true;
  ui.saveAll.disabled = !state.serverReady;
  setStatus(message);
}

function sortedPeopleEntries() {
  return Object.entries(state.family.people).sort(([, first], [, second]) => {
    return (first.name || "").localeCompare(second.name || "", "ru");
  });
}

function getPerson(personId) {
  return state.family.people[personId];
}

function getAlbum(personId) {
  return state.albums.find((album) => album.personId === personId) || null;
}

function createAlbumDraft(personId) {
  const person = getPerson(personId);
  return (
    getAlbum(personId) || {
      personId,
      title: person?.name || "Фотоальбом",
      description: "Фотографии из семейного альбома.",
      photos: [],
      videos: [],
      externalLinks: [],
    }
  );
}

function queuedPortraitToken(uploadId) {
  return `__upload__:${uploadId}`;
}

function releaseUploadEntries(entries = []) {
  entries.forEach((entry) => {
    if (entry.previewUrl) {
      URL.revokeObjectURL(entry.previewUrl);
    }
  });
}

function createLinkDraft() {
  return {
    title: "",
    url: "",
    kind: "external",
  };
}

function renderPeopleList() {
  const entries = sortedPeopleEntries().filter(([, person]) => {
    return person.name.toLowerCase().includes(state.search.trim().toLowerCase());
  });

  ui.peopleCount.textContent = `${entries.length}`;
  ui.peopleList.innerHTML = entries
    .map(([personId, person]) => {
      const activeClass = state.selectedPersonId === personId ? "is-active" : "";
      const photoCount = getAlbum(personId)?.photos?.length || 0;
      return `
        <button class="person-list-item ${activeClass}" type="button" data-select-person="${personId}">
          <strong>${escapeHtml(person.name)}</strong>
          <span class="person-meta">${escapeHtml(person.dates || "даты не указаны")}</span>
          <span class="person-meta">${photoCount} фото</span>
        </button>
      `;
    })
    .join("");
}

function renderPersonEditor() {
  const person = getPerson(state.selectedPersonId);
  if (!person) {
    ui.personIdBadge.textContent = "";
    ui.personEditor.innerHTML = `<div class="empty-state"><p>Выберите человека слева, чтобы начать редактирование.</p></div>`;
    return;
  }

  ui.personIdBadge.textContent = state.selectedPersonId;
  ui.personEditor.innerHTML = `
    <div class="editor-grid">
      <div class="field-row">
        <div class="field-block">
          <label class="field-label" for="person-name">Имя</label>
          <input id="person-name" name="name" type="text" value="${escapeHtml(person.name || "")}" />
        </div>
        <div class="field-block">
          <label class="field-label" for="person-dates">Даты</label>
          <input id="person-dates" name="dates" type="text" value="${escapeHtml(person.dates || "")}" />
        </div>
      </div>

      <div class="field-block">
        <label class="field-label" for="person-notes">Заметки</label>
        <textarea id="person-notes" name="notes">${escapeHtml((person.notes || []).join("\n"))}</textarea>
        <p class="field-help">Одна строка = один пункт в карточке человека.</p>
      </div>

      ${renderAlbumSection()}
    </div>
  `;
}

function renderUploadQueue(personId) {
  const uploads = state.uploadQueue[personId] || [];
  if (!uploads.length) {
    return `<div class="empty-state"><p>Новых фото в очереди пока нет.</p></div>`;
  }

  const album = createAlbumDraft(personId);
  const portraitPath = album.portrait || album.photos[0]?.src || "";

  return `
    <div class="upload-list">
      ${uploads
        .map((entry) => {
          const checked = portraitPath === queuedPortraitToken(entry.id) ? "checked" : "";
          return `
            <article class="photo-card">
              <img src="${entry.previewUrl}" alt="${escapeHtml(entry.name)}" loading="lazy" />
              <div class="upload-chip">${escapeHtml(entry.name)}</div>
              <div class="photo-controls">
                <label>
                  <input type="radio" name="portrait-photo" value="${queuedPortraitToken(entry.id)}" ${checked} />
                  <span>Лицевое фото</span>
                </label>
                <button type="button" class="danger-link" data-remove-upload="${entry.id}">Убрать из очереди</button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderVideoUploadQueue(personId) {
  const uploads = state.videoUploadQueue[personId] || [];
  if (!uploads.length) {
    return `<div class="empty-state"><p>Новых видео в очереди пока нет.</p></div>`;
  }

  return `
    <div class="upload-list">
      ${uploads
        .map(
          (entry) => `
            <article class="photo-card">
              <video src="${entry.previewUrl}" controls preload="metadata" playsinline></video>
              <div class="upload-chip">${escapeHtml(entry.name)}</div>
              <div class="photo-controls">
                <span class="field-help">Видео добавится после сохранения.</span>
                <button type="button" class="danger-link" data-remove-video-upload="${entry.id}">Убрать из очереди</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderPhotoCards(album) {
  if (!album.photos.length) {
    return `<div class="empty-state"><p>Фото пока нет. Загрузите изображения ниже.</p></div>`;
  }

  const portraitPath = album.portrait || album.photos[0]?.src || "";
  return `
    <div class="photo-list">
      ${album.photos
        .map((photo, index) => {
          const checked = photo.src === portraitPath ? "checked" : "";
          return `
            <article class="photo-card">
              <img src="/${encodeURI(photo.src)}" alt="${escapeHtml(photo.caption || `Фото ${index + 1}`)}" loading="lazy" />
              <input
                class="photo-caption-input"
                type="text"
                value="${escapeHtml(photo.caption || `Фото ${index + 1}`)}"
                data-photo-caption="${escapeHtml(photo.src)}"
                aria-label="Подпись к фотографии ${index + 1}"
              />
              <div class="photo-controls">
                <label>
                  <input type="radio" name="portrait-photo" value="${escapeHtml(photo.src)}" ${checked} />
                  <span>Лицевое фото</span>
                </label>
                <button type="button" class="danger-link" data-remove-photo="${escapeHtml(photo.src)}">Убрать из альбома</button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderVideoCards(album) {
  if (!album.videos?.length) {
    return `<div class="empty-state"><p>Видео пока нет.</p></div>`;
  }

  return `
    <div class="photo-list">
      ${album.videos
        .map(
          (video, index) => `
            <article class="photo-card">
              <video src="/${encodeURI(video.src)}" controls preload="metadata" playsinline ${
                video.poster ? `poster="/${encodeURI(video.poster)}"` : ""
              }></video>
              <input
                class="photo-caption-input"
                type="text"
                value="${escapeHtml(video.caption || `Видео ${index + 1}`)}"
                data-video-caption="${escapeHtml(video.src)}"
                aria-label="Подпись к видео ${index + 1}"
              />
              <div class="photo-controls">
                <span class="field-help">${escapeHtml(video.src.split("/").pop() || "Видео")}</span>
                <button type="button" class="danger-link" data-remove-video="${escapeHtml(video.src)}">Убрать из альбома</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderExternalLinkRows(album) {
  const links = album.externalLinks?.length ? album.externalLinks : [createLinkDraft()];

  return `
    <div class="link-editor-list">
      ${links
        .map(
          (link, index) => `
            <article class="link-editor-card">
              <div class="field-row">
                <div class="field-block">
                  <label class="field-label" for="link-title-${index}">Название ссылки</label>
                  <input id="link-title-${index}" type="text" value="${escapeHtml(link.title || "")}" data-link-title="${index}" />
                </div>
                <div class="field-block">
                  <label class="field-label" for="link-kind-${index}">Тип</label>
                  <select id="link-kind-${index}" data-link-kind="${index}">
                    <option value="external" ${link.kind === "external" ? "selected" : ""}>Обычная ссылка</option>
                    <option value="video" ${link.kind === "video" ? "selected" : ""}>Видео-ссылка</option>
                    <option value="photos" ${link.kind === "photos" ? "selected" : ""}>Фотоархив</option>
                  </select>
                </div>
              </div>
              <div class="field-block">
                <label class="field-label" for="link-url-${index}">URL</label>
                <input id="link-url-${index}" type="text" value="${escapeHtml(link.url || "")}" data-link-url="${index}" />
              </div>
              <div class="photo-controls">
                <span class="field-help">Подойдут YouTube, Google Photos, Яндекс Диск и другие публичные ссылки.</span>
                <button type="button" class="danger-link" data-remove-link="${index}">Убрать ссылку</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderAlbumSection() {
  const person = getPerson(state.selectedPersonId);
  if (!person) {
    return `<div class="empty-state"><p>После выбора человека здесь появится его фотоальбом.</p></div>`;
  }

  const album = createAlbumDraft(state.selectedPersonId);
  return `
    <div class="album-grid">
      <div class="card-head">
        <div>
          <h3>Фотоальбом</h3>
          <p class="subtle">Загрузка фото, подписи и лицевой снимок.</p>
        </div>
      </div>
      <div class="info-box">
        <p>Как добавить фото: выберите файлы ниже и нажмите «Сохранить изменения». Сервер сам положит снимки в папку сайта.</p>
      </div>

      <div class="field-block">
        <label class="field-label" for="album-title">Название альбома</label>
        <input id="album-title" name="album-title" type="text" value="${escapeHtml(album.title || "")}" />
      </div>

      <div class="field-block">
        <label class="field-label" for="album-description">Описание альбома</label>
        <textarea id="album-description" name="album-description">${escapeHtml(album.description || "")}</textarea>
      </div>

      <div class="album-actions">
        <label class="field-label" for="album-upload">Добавить фотографии</label>
        <input id="album-upload" type="file" accept="image/*" multiple />
        <p class="field-help">Новые файлы появятся в альбоме после сохранения.</p>
      </div>

      <div class="album-actions">
        <label class="field-label" for="album-video-upload">Добавить видео</label>
        <input id="album-video-upload" type="file" accept="video/*" multiple />
        <p class="field-help">Поддерживаются обычные видеофайлы. Они появятся в альбоме после сохранения.</p>
      </div>

      <section>
        <h3>Очередь на загрузку</h3>
        ${renderUploadQueue(state.selectedPersonId)}
      </section>

      <section>
        <h3>Очередь видео</h3>
        ${renderVideoUploadQueue(state.selectedPersonId)}
      </section>

      <section>
        <h3>Фотографии в альбоме</h3>
        <p class="field-help">Удалённые фото исчезнут из альбома и будут стёрты из папки сайта после сохранения.</p>
        ${renderPhotoCards(album)}
      </section>

      <section>
        <h3>Видео в альбоме</h3>
        <p class="field-help">Видео сохраняются в папку сайта и показываются на странице альбома.</p>
        ${renderVideoCards(album)}
      </section>

      <section>
        <div class="card-head">
          <div>
            <h3>Внешние ссылки</h3>
            <p class="field-help">YouTube, Google Photos, Яндекс и любые другие публичные ссылки.</p>
          </div>
          <button type="button" class="button inline" data-add-link>Добавить ссылку</button>
        </div>
        ${renderExternalLinkRows(album)}
      </section>

      <p class="save-note">После любых правок нажмите «Сохранить изменения» вверху страницы.</p>
    </div>
  `;
}

function renderSyncReport(report) {
  if (!report) {
    ui.syncReport.innerHTML = `<p>Нажмите «Проверить обновления», чтобы увидеть новые файлы в папках фотоальбомов.</p>`;
    return;
  }

  const summary = report.summary || {};
  if (!(report.albums || []).length) {
    ui.syncReport.innerHTML = `
      <p>Новых изменений не найдено.</p>
      <p class="field-help">
        Папок создано: ${summary.directoriesCreated || 0},
        новых фото: ${summary.missingPhotos || 0},
        новых видео: ${summary.missingVideos || 0}.
      </p>
    `;
    return;
  }

  ui.syncReport.innerHTML = `
    <div class="sync-report-list">
      ${(report.albums || [])
        .map(
          (album) => `
            <article class="sync-report-item">
              <h3>${escapeHtml(album.personName)}</h3>
              ${album.missingPhotos?.length ? `<p>Новые фото: ${album.missingPhotos.length}</p><ul>${album.missingPhotos.map((item) => `<li>${escapeHtml(item.split("/").pop() || item)}</li>`).join("")}</ul>` : ""}
              ${album.missingVideos?.length ? `<p>Новые видео: ${album.missingVideos.length}</p><ul>${album.missingVideos.map((item) => `<li>${escapeHtml(item.split("/").pop() || item)}</li>`).join("")}</ul>` : ""}
              ${album.brokenPhotos?.length ? `<p>Удалить битые фото: ${album.brokenPhotos.length}</p>` : ""}
              ${album.brokenVideos?.length ? `<p>Удалить битые видео: ${album.brokenVideos.length}</p>` : ""}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderAll() {
  ui.saveAll.disabled = !state.serverReady;
  renderPeopleList();
  renderPersonEditor();
}

function parseTextareaList(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function updatePersonFromForm() {
  const person = getPerson(state.selectedPersonId);
  if (!person) {
    return;
  }

  person.name = document.querySelector("#person-name")?.value.trim() || "Без имени";
  person.dates = document.querySelector("#person-dates")?.value.trim() || "";
  person.notes = parseTextareaList(document.querySelector("#person-notes")?.value || "");
}

function updateAlbumFromForm() {
  const person = getPerson(state.selectedPersonId);
  if (!person) {
    return;
  }

  const title = document.querySelector("#album-title")?.value.trim() || "";
  const description = document.querySelector("#album-description")?.value.trim() || "";
  let album = getAlbum(state.selectedPersonId);
  const hasPendingFiles = (state.uploadQueue[state.selectedPersonId] || []).length > 0;
  const hasPendingVideos = (state.videoUploadQueue[state.selectedPersonId] || []).length > 0;

  if (!album && !(title || description || hasPendingFiles || hasPendingVideos)) {
    return;
  }

  if (!album) {
    album = {
      personId: state.selectedPersonId,
      title: title || person.name,
      description: description || "Фотографии из семейного альбома.",
      photos: [],
      videos: [],
      externalLinks: [],
    };
    state.albums.push(album);
  }

  album.title = title || person.name;
  album.description = description || "Фотографии из семейного альбома.";
  album.videos = Array.isArray(album.videos) ? album.videos : [];
  album.externalLinks = Array.isArray(album.externalLinks) ? album.externalLinks : [];
}

function updatePhotoCaption(photoPath, caption) {
  const album = getAlbum(state.selectedPersonId);
  if (!album) {
    return;
  }

  const photo = album.photos.find((item) => item.src === photoPath);
  if (!photo) {
    return;
  }

  photo.caption = caption.trim() || photo.caption || "Без подписи";
}

function updateVideoCaption(videoPath, caption) {
  const album = getAlbum(state.selectedPersonId);
  if (!album) {
    return;
  }

  const video = (album.videos || []).find((item) => item.src === videoPath);
  if (!video) {
    return;
  }

  video.caption = caption.trim() || video.caption || "Без подписи";
}

function updateExternalLink(index, field, value) {
  let album = getAlbum(state.selectedPersonId);
  if (!album) {
    const person = getPerson(state.selectedPersonId);
    if (!person) {
      return;
    }
    album = {
      personId: state.selectedPersonId,
      title: person.name,
      description: "Фотографии из семейного альбома.",
      photos: [],
      videos: [],
      externalLinks: [],
    };
    state.albums.push(album);
  }

  if (!album) {
    return;
  }

  album.externalLinks = Array.isArray(album.externalLinks) ? album.externalLinks : [];
  if (!album.externalLinks[index]) {
    album.externalLinks[index] = createLinkDraft();
  }

  album.externalLinks[index][field] = value.trim();
}

function removePhoto(photoPath) {
  const album = getAlbum(state.selectedPersonId);
  if (!album) {
    return;
  }

  if (!state.deletedPhotos.includes(photoPath)) {
    state.deletedPhotos.push(photoPath);
  }
  album.photos = album.photos.filter((photo) => photo.src !== photoPath);
  if (album.portrait === photoPath) {
    album.portrait = album.photos[0]?.src || "";
    if (!album.portrait) {
      delete album.portrait;
    }
  }
  markDirty("Фото помечено на удаление. После сохранения оно исчезнет и из альбома, и из папки сайта.");
  renderPersonEditor();
}

function removeVideo(videoPath) {
  const album = getAlbum(state.selectedPersonId);
  if (!album) {
    return;
  }

  if (!state.deletedPhotos.includes(videoPath)) {
    state.deletedPhotos.push(videoPath);
  }
  album.videos = (album.videos || []).filter((video) => video.src !== videoPath);
  markDirty("Видео помечено на удаление. После сохранения оно исчезнет из альбома и папки сайта.");
  renderPersonEditor();
}

function queueUploads(files) {
  if (!files.length) {
    return;
  }
  const queuedUploads = Array.from(files).map((file) => ({
    id: `upload-${state.nextUploadId++}`,
    file,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  }));
  state.uploadQueue[state.selectedPersonId] = [...(state.uploadQueue[state.selectedPersonId] || []), ...queuedUploads];
  markDirty("Фото добавлены. Последний шаг: нажмите «Сохранить изменения».");
  renderPersonEditor();
}

function queueVideoUploads(files) {
  if (!files.length) {
    return;
  }
  const queuedUploads = Array.from(files).map((file) => ({
    id: `video-upload-${state.nextUploadId++}`,
    file,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  }));
  state.videoUploadQueue[state.selectedPersonId] = [...(state.videoUploadQueue[state.selectedPersonId] || []), ...queuedUploads];
  markDirty("Видео добавлены. Последний шаг: нажмите «Сохранить изменения».");
  renderPersonEditor();
}

function removeQueuedUpload(uploadId) {
  const entries = state.uploadQueue[state.selectedPersonId] || [];
  const removed = entries.filter((entry) => entry.id === uploadId);
  if (!removed.length) {
    return;
  }

  releaseUploadEntries(removed);
  state.uploadQueue[state.selectedPersonId] = entries.filter((entry) => entry.id !== uploadId);

  const album = getAlbum(state.selectedPersonId);
  if (album?.portrait === queuedPortraitToken(uploadId)) {
    album.portrait = album.photos[0]?.src || "";
    if (!album.portrait) {
      delete album.portrait;
    }
  }

  markDirty("Фото убрано из очереди.");
  renderPersonEditor();
}

function removeQueuedVideoUpload(uploadId) {
  const entries = state.videoUploadQueue[state.selectedPersonId] || [];
  const removed = entries.filter((entry) => entry.id === uploadId);
  if (!removed.length) {
    return;
  }

  releaseUploadEntries(removed);
  state.videoUploadQueue[state.selectedPersonId] = entries.filter((entry) => entry.id !== uploadId);
  markDirty("Видео убрано из очереди.");
  renderPersonEditor();
}

function addExternalLink() {
  updateAlbumFromForm();
  const album = getAlbum(state.selectedPersonId);
  if (!album) {
    return;
  }

  album.externalLinks = Array.isArray(album.externalLinks) ? album.externalLinks : [];
  album.externalLinks.push(createLinkDraft());
  markDirty("Ссылка добавлена.");
  renderPersonEditor();
}

function removeExternalLink(index) {
  const album = getAlbum(state.selectedPersonId);
  if (!album?.externalLinks?.length) {
    return;
  }

  album.externalLinks.splice(index, 1);
  markDirty("Ссылка удалена.");
  renderPersonEditor();
}

function buildSavePayload() {
  return {
    family: state.family,
    albums: state.albums,
    deletedPhotos: state.deletedPhotos,
  };
}

async function loadState() {
  try {
    const response = await fetch(API_STATE_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.family = payload.family;
    state.albums = payload.albums;
    Object.values(state.uploadQueue).forEach((entries) => releaseUploadEntries(entries));
    Object.values(state.videoUploadQueue).forEach((entries) => releaseUploadEntries(entries));
    state.selectedPersonId = state.selectedPersonId && state.family.people[state.selectedPersonId]
      ? state.selectedPersonId
      : Object.keys(state.family.people)[0] || "";
    state.uploadQueue = {};
    state.videoUploadQueue = {};
    state.deletedPhotos = [];
    state.serverReady = true;
    state.dirty = false;
    ui.checkAlbumUpdates.disabled = false;
    ui.syncAlbumUpdates.disabled = false;
    ui.publishSite.disabled = false;
    ui.serverWarning.hidden = true;
    setStatus("Данные загружены. Выберите человека, внесите правки и нажмите «Сохранить изменения».");
    setSyncStatus("Можно проверить папки фотоальбомов и синхронизировать изменения в сайт.");
    renderAll();
  } catch (error) {
    state.serverReady = false;
    ui.saveAll.disabled = true;
    ui.checkAlbumUpdates.disabled = true;
    ui.syncAlbumUpdates.disabled = true;
    ui.publishSite.disabled = true;
    ui.serverWarning.hidden = false;
    setStatus("Локальный сервер не отвечает. Запустите start-admin.bat и затем обновите страницу.", true);
    setSyncStatus("Локальный сервер не отвечает. Проверка и публикация недоступны.", true);
  }
}

async function saveAllChanges() {
  if (!state.serverReady) {
    setStatus("Локальный сервер недоступен. Запустите start-admin.bat.", true);
    return;
  }

  updatePersonFromForm();
  updateAlbumFromForm();

  const formData = new FormData();
  formData.append("payload", JSON.stringify(buildSavePayload()));

  Object.entries(state.uploadQueue).forEach(([personId, files]) => {
    files.forEach((entry) => {
      formData.append(`upload:${personId}:${entry.id}`, entry.file, entry.name);
    });
  });

  Object.entries(state.videoUploadQueue).forEach(([personId, files]) => {
    files.forEach((entry) => {
      formData.append(`video-upload:${personId}:${entry.id}`, entry.file, entry.name);
    });
  });

  try {
    const response = await fetch(API_SAVE_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.family = payload.family;
    state.albums = payload.albums;
    Object.values(state.uploadQueue).forEach((entries) => releaseUploadEntries(entries));
    Object.values(state.videoUploadQueue).forEach((entries) => releaseUploadEntries(entries));
    state.uploadQueue = {};
    state.videoUploadQueue = {};
    state.deletedPhotos = [];
    state.dirty = false;
    ui.serverWarning.hidden = true;
    setStatus("Изменения сохранены. Фото, видео и ссылки обновлены.");
    renderAll();
  } catch (error) {
    setStatus("Сохранение не удалось. Проверьте, что локальный сервер запущен.", true);
  }
}

async function checkAlbumUpdates() {
  if (!state.serverReady) {
    setSyncStatus("Локальный сервер недоступен. Запустите start-admin.bat.", true);
    return;
  }

  setSyncStatus("Проверяю изменения в папках фотоальбомов...");

  try {
    const response = await fetch(API_ALBUM_CHECK_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const report = await response.json();
    renderSyncReport(report);
    if ((report.albums || []).length) {
      setSyncStatus(`Найдены изменения в ${report.summary.albumsChanged} альбомах.`);
    } else {
      setSyncStatus("Новых изменений в папках не найдено.");
    }
  } catch (error) {
    setSyncStatus("Проверка не удалась. Сервер не ответил или вернул ошибку.", true);
  }
}

async function syncAlbumUpdates() {
  if (!state.serverReady) {
    setSyncStatus("Локальный сервер недоступен. Запустите start-admin.bat.", true);
    return;
  }

  setSyncStatus("Синхронизирую изменения из папок в сайт...");

  try {
    const response = await fetch(API_ALBUM_SYNC_URL, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.family = payload.family;
    state.albums = payload.albums;
    state.dirty = false;
    renderAll();
    renderSyncReport(payload.report);

    const changedCount = (payload.synced || []).length;
    if (changedCount) {
      setSyncStatus(`Синхронизировано ${changedCount} альбомов. Теперь можно публиковать.`);
    } else {
      setSyncStatus("Синхронизировать было нечего.");
    }
  } catch (error) {
    setSyncStatus("Синхронизация не удалась. Проверьте локальный сервер.", true);
  }
}

async function publishSite() {
  if (!state.serverReady) {
    setSyncStatus("Локальный сервер недоступен. Запустите start-admin.bat.", true);
    return;
  }

  setSyncStatus("Публикую сайт...");

  try {
    const response = await fetch(API_PUBLISH_URL, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (payload.noChanges) {
      setSyncStatus("Изменений для публикации нет.");
      return;
    }

    const pagesStatus = payload.pagesBuild?.status ? ` · Pages: ${payload.pagesBuild.status}` : "";
    setSyncStatus(`Опубликовано: ${payload.commit || "без hash"}${pagesStatus}`);
  } catch (error) {
    setSyncStatus("Публикация не удалась. Проверьте git/gh и локальный сервер.", true);
  }
}

function selectPerson(personId) {
  state.selectedPersonId = personId;
  renderAll();
}

ui.reloadData.addEventListener("click", loadState);
ui.saveAll.addEventListener("click", saveAllChanges);
ui.checkAlbumUpdates.addEventListener("click", checkAlbumUpdates);
ui.syncAlbumUpdates.addEventListener("click", syncAlbumUpdates);
ui.publishSite.addEventListener("click", publishSite);

ui.search.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderPeopleList();
});

document.addEventListener("click", (event) => {
  const selectButton = event.target.closest("[data-select-person]");
  if (selectButton) {
    selectPerson(selectButton.dataset.selectPerson);
    return;
  }

  const removeButton = event.target.closest("[data-remove-photo]");
  if (removeButton) {
    removePhoto(removeButton.dataset.removePhoto);
    return;
  }

  const removeUploadButton = event.target.closest("[data-remove-upload]");
  if (removeUploadButton) {
    removeQueuedUpload(removeUploadButton.dataset.removeUpload);
    return;
  }

  const removeVideoButton = event.target.closest("[data-remove-video]");
  if (removeVideoButton) {
    removeVideo(removeVideoButton.dataset.removeVideo);
    return;
  }

  const removeVideoUploadButton = event.target.closest("[data-remove-video-upload]");
  if (removeVideoUploadButton) {
    removeQueuedVideoUpload(removeVideoUploadButton.dataset.removeVideoUpload);
    return;
  }

  if (event.target.closest("[data-add-link]")) {
    addExternalLink();
    return;
  }

  const removeLinkButton = event.target.closest("[data-remove-link]");
  if (removeLinkButton) {
    removeExternalLink(Number(removeLinkButton.dataset.removeLink));
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("#person-name, #person-dates, #person-notes, #album-title, #album-description")) {
    updatePersonFromForm();
    if (event.target.matches("#album-title, #album-description")) {
      updateAlbumFromForm();
    }
    markDirty();
    renderPeopleList();
    return;
  }

  if (event.target.matches("[data-photo-caption]")) {
    updatePhotoCaption(event.target.dataset.photoCaption, event.target.value);
    markDirty("Подпись к фото изменена.");
    return;
  }

  if (event.target.matches("[data-video-caption]")) {
    updateVideoCaption(event.target.dataset.videoCaption, event.target.value);
    markDirty("Подпись к видео изменена.");
    return;
  }

  if (event.target.matches("[data-link-title]")) {
    updateExternalLink(Number(event.target.dataset.linkTitle), "title", event.target.value);
    markDirty("Название ссылки изменено.");
    return;
  }

  if (event.target.matches("[data-link-url]")) {
    updateExternalLink(Number(event.target.dataset.linkUrl), "url", event.target.value);
    markDirty("Ссылка обновлена.");
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches('input[name="portrait-photo"]')) {
    const album = getAlbum(state.selectedPersonId);
    if (!album) {
      return;
    }
    album.portrait = event.target.value;
    markDirty("Лицевое фото изменено.");
    renderPersonEditor();
    return;
  }

  if (event.target.matches("#album-upload")) {
    queueUploads(event.target.files || []);
    event.target.value = "";
    return;
  }

  if (event.target.matches("#album-video-upload")) {
    queueVideoUploads(event.target.files || []);
    event.target.value = "";
    return;
  }

  if (event.target.matches("[data-link-kind]")) {
    updateExternalLink(Number(event.target.dataset.linkKind), "kind", event.target.value);
    markDirty("Тип ссылки изменён.");
  }
});

loadState();
