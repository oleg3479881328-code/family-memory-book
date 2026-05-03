const family = window.FAMILY;
const memoirs = window.MEMOIRS;
const people = family.people;
const expanded = new Set(["sergey-kuteinikov", "anna-kuteinikova", "natalya-kureneva", "alexandra-kureneva"]);

const treeEl = document.querySelector("#family-tree");
const panelEl = document.querySelector("#person-panel");
const searchEl = document.querySelector("#person-search");
const tabsEl = document.querySelector("#memoir-tabs");
const readerEl = document.querySelector("#memoir-reader");
const photosEl = document.querySelector("#photo-grid");

function personName(id) {
  return people[id]?.name || id;
}

function relatedList(ids = []) {
  return ids.map((id) => `<button type="button" class="link-button" data-person="${id}">${personName(id)}</button>`).join("");
}

function renderPersonCard(id, depth = 0) {
  const person = people[id];
  if (!person) return "";
  const children = person.children || [];
  const hasChildren = children.length > 0;
  const isOpen = expanded.has(id);
  const match = searchEl.value.trim().toLowerCase();
  const hidden = match && !person.name.toLowerCase().includes(match);

  return `
    <li class="tree-item ${hidden ? "is-dimmed" : ""}" style="--depth:${depth}">
      <div class="tree-card">
        <button class="toggle" type="button" data-toggle="${id}" ${hasChildren ? "" : "disabled"} aria-label="Раскрыть ветвь">
          ${hasChildren ? (isOpen ? "−" : "+") : "•"}
        </button>
        <button class="person-button" type="button" data-person="${id}">
          <strong>${person.name}</strong>
          <span>${person.dates || "даты не указаны"}</span>
        </button>
      </div>
      ${
        hasChildren && isOpen
          ? `<ul class="tree-children">${children.map((child) => renderPersonCard(child, depth + 1)).join("")}</ul>`
          : ""
      }
    </li>
  `;
}

function renderTree() {
  treeEl.innerHTML = `<ul class="tree-root">${family.roots.map((root) => renderPersonCard(root)).join("")}</ul>`;
}

function showPerson(id) {
  const person = people[id];
  if (!person) return;
  const memoirLinks = (person.memoirs || [])
    .map((memoirId) => {
      const section = memoirs.sections.find((item) => item.id === memoirId);
      return section ? `<button type="button" class="memoir-link" data-memoir="${section.id}">${section.title}</button>` : "";
    })
    .join("");

  panelEl.innerHTML = `
    <h3>${person.name}</h3>
    <p class="dates">${person.dates || "даты не указаны"}</p>
    ${person.notes?.length ? `<ul class="fact-list">${person.notes.map((note) => `<li>${note}</li>`).join("")}</ul>` : ""}
    ${person.parents?.length ? `<h4>Родители</h4><div class="relation-list">${relatedList(person.parents)}</div>` : ""}
    ${person.partners?.length ? `<h4>Связи</h4><div class="relation-list">${relatedList(person.partners)}</div>` : ""}
    ${person.children?.length ? `<h4>Дети</h4><div class="relation-list">${relatedList(person.children)}</div>` : ""}
    ${memoirLinks ? `<h4>Связанные тексты</h4><div class="relation-list">${memoirLinks}</div>` : ""}
  `;
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
  photosEl.innerHTML = memoirs.photos
    .map(
      (photo, index) => `
        <figure class="photo-card">
          <img src="${photo.src}" alt="Фотография ${index + 1} из семейного архива" loading="lazy" />
          <figcaption>${photo.caption}</figcaption>
        </figure>
      `,
    )
    .join("");
}

document.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle]");
  if (toggle) {
    const id = toggle.dataset.toggle;
    expanded.has(id) ? expanded.delete(id) : expanded.add(id);
    renderTree();
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
    document.querySelector("#memoirs").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

searchEl.addEventListener("input", renderTree);
document.querySelector("#expand-all").addEventListener("click", () => {
  Object.keys(people).forEach((id) => expanded.add(id));
  renderTree();
});
document.querySelector("#collapse-all").addEventListener("click", () => {
  expanded.clear();
  family.roots.forEach((id) => expanded.add(id));
  renderTree();
});

renderTree();
showPerson("anna-kuteinikova");
showMemoir();
renderPhotos();
