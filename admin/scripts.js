const API_STATE_URL = "/api/admin/state";
const API_SAVE_URL = "/api/admin/save";

const state = {
  family: { roots: [], people: {} },
  albums: [],
  selectedPersonId: "",
  search: "",
  uploadQueue: {},
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
    }
  );
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
  const files = state.uploadQueue[personId] || [];
  if (!files.length) {
    return `<div class="empty-state"><p>Новых фото в очереди пока нет.</p></div>`;
  }

  return `
    <div class="upload-list">
      ${files.map((file) => `<div class="upload-chip">${escapeHtml(file.name)}</div>`).join("")}
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

      <section>
        <h3>Очередь на загрузку</h3>
        ${renderUploadQueue(state.selectedPersonId)}
      </section>

      <section>
        <h3>Фотографии в альбоме</h3>
        <p class="field-help">Удалённые фото исчезнут из альбома и будут стёрты из папки сайта после сохранения.</p>
        ${renderPhotoCards(album)}
      </section>

      <p class="save-note">После любых правок нажмите «Сохранить изменения» вверху страницы.</p>
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

  if (!album && !(title || description || hasPendingFiles)) {
    return;
  }

  if (!album) {
    album = {
      personId: state.selectedPersonId,
      title: title || person.name,
      description: description || "Фотографии из семейного альбома.",
      photos: [],
    };
    state.albums.push(album);
  }

  album.title = title || person.name;
  album.description = description || "Фотографии из семейного альбома.";
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

function queueUploads(files) {
  if (!files.length) {
    return;
  }
  state.uploadQueue[state.selectedPersonId] = [...(state.uploadQueue[state.selectedPersonId] || []), ...Array.from(files)];
  markDirty("Фото добавлены. Последний шаг: нажмите «Сохранить изменения».");
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
    state.selectedPersonId = state.selectedPersonId && state.family.people[state.selectedPersonId]
      ? state.selectedPersonId
      : Object.keys(state.family.people)[0] || "";
    state.uploadQueue = {};
    state.deletedPhotos = [];
    state.serverReady = true;
    state.dirty = false;
    ui.serverWarning.hidden = true;
    setStatus("Данные загружены. Выберите человека, внесите правки и нажмите «Сохранить изменения».");
    renderAll();
  } catch (error) {
    state.serverReady = false;
    ui.saveAll.disabled = true;
    ui.serverWarning.hidden = false;
    setStatus("Локальный сервер не отвечает. Запустите start-admin.bat и затем обновите страницу.", true);
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
    files.forEach((file) => {
      formData.append(`upload:${personId}`, file, file.name);
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
    state.uploadQueue = {};
    state.deletedPhotos = [];
    state.dirty = false;
    ui.serverWarning.hidden = true;
    setStatus("Изменения сохранены. Фото записаны в папку сайта.");
    renderAll();
  } catch (error) {
    setStatus("Сохранение не удалось. Проверьте, что локальный сервер запущен.", true);
  }
}

function selectPerson(personId) {
  state.selectedPersonId = personId;
  renderAll();
}

ui.reloadData.addEventListener("click", loadState);
ui.saveAll.addEventListener("click", saveAllChanges);

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
  }
});

loadState();
