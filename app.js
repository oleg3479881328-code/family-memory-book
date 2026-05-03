const family = window.FAMILY;
const memoirs = window.MEMOIRS;
const people = family.people;

const treeEl = document.querySelector("#family-tree");
const panelEl = document.querySelector("#person-panel");
const searchEl = document.querySelector("#person-search");
const tabsEl = document.querySelector("#memoir-tabs");
const readerEl = document.querySelector("#memoir-reader");
const photosEl = document.querySelector("#photo-grid");

const chartNodes = {
  "sergey-kuteinikov": { x: 490, y: 80, tone: "male" },
  "maria-kuteinikova": { x: 690, y: 80, tone: "female" },
  "anna-kuteinikova": { x: 490, y: 230, tone: "female" },
  "dmitry-kurenev": { x: 690, y: 230, tone: "male" },
  "natalya-kureneva": { x: 230, y: 420, tone: "female" },
  "vera-kureneva": { x: 470, y: 420, tone: "female" },
  "elizaveta-kureneva": { x: 710, y: 420, tone: "female" },
  "alexandra-kureneva": { x: 950, y: 420, tone: "female" },
  "nikolay-grigoryev": { x: 230, y: 565, tone: "male" },
  "nikolay-podkovtsev": { x: 470, y: 565, tone: "male" },
  "alexander-fateev": { x: 950, y: 565, tone: "male" },
  "tamara-grigoryeva": { x: 135, y: 730, tone: "descendant" },
  "igor-grigoryev": { x: 330, y: 730, tone: "descendant" },
  "elena-podkovtseva": { x: 470, y: 730, tone: "descendant" },
  "konstantin-fateev": { x: 810, y: 730, tone: "descendant" },
  "pavel-fateev": { x: 1025, y: 730, tone: "descendant" },
  "igor-povalyukhin": { x: 135, y: 900, tone: "male" },
  "tamara-zhuleva": { x: 700, y: 900, tone: "female" },
  "marina-drozdova": { x: 925, y: 900, tone: "female" },
  "vera-plitkina": { x: 1115, y: 900, tone: "female" },
  "oleg-povalyukhin": { x: 80, y: 1080, tone: "descendant" },
  "anatoly-povalyukhin": { x: 275, y: 1080, tone: "descendant" },
  "anna-fateeva": { x: 700, y: 1080, tone: "descendant" },
  "nikita-fateev": { x: 925, y: 1080, tone: "descendant" },
  "sasha-fateev": { x: 1115, y: 1080, tone: "descendant" },
  "vera-solovyova": { x: 80, y: 1260, tone: "female" },
  "alexandra-pirina": { x: 275, y: 1260, tone: "female" },
  "olga-tankova": { x: 470, y: 1260, tone: "female" },
  "daryana-medvedeva": { x: 925, y: 1260, tone: "female" },
  "natalya-povalyukhina": { x: 80, y: 1440, tone: "descendant" },
  "anna-povalyukhina": { x: 275, y: 1440, tone: "descendant" },
  "maria-povalyukhina": { x: 470, y: 1440, tone: "descendant" },
  "daniil-fateev": { x: 925, y: 1440, tone: "descendant" },
  "gerard-hurley": { x: 80, y: 1600, tone: "male" },
  "hawkin-hurley": { x: 80, y: 1760, tone: "descendant" },
};

const spouseLinks = [
  ["sergey-kuteinikov", "maria-kuteinikova"],
  ["anna-kuteinikova", "dmitry-kurenev"],
  ["natalya-kureneva", "nikolay-grigoryev"],
  ["vera-kureneva", "nikolay-podkovtsev"],
  ["alexandra-kureneva", "alexander-fateev"],
  ["tamara-grigoryeva", "igor-povalyukhin"],
  ["konstantin-fateev", "tamara-zhuleva"],
  ["pavel-fateev", "marina-drozdova"],
  ["pavel-fateev", "vera-plitkina"],
  ["nikita-fateev", "daryana-medvedeva"],
  ["natalya-povalyukhina", "gerard-hurley"],
];

const familyGroups = [
  { parents: ["sergey-kuteinikov", "maria-kuteinikova"], children: ["anna-kuteinikova"] },
  { parents: ["anna-kuteinikova", "dmitry-kurenev"], children: ["natalya-kureneva", "vera-kureneva", "elizaveta-kureneva", "alexandra-kureneva"] },
  { parents: ["natalya-kureneva", "nikolay-grigoryev"], children: ["tamara-grigoryeva", "igor-grigoryev"] },
  { parents: ["vera-kureneva", "nikolay-podkovtsev"], children: ["elena-podkovtseva"] },
  { parents: ["alexandra-kureneva", "alexander-fateev"], children: ["konstantin-fateev", "pavel-fateev"] },
  { parents: ["tamara-grigoryeva", "igor-povalyukhin"], children: ["oleg-povalyukhin", "anatoly-povalyukhin"] },
  { parents: ["konstantin-fateev", "tamara-zhuleva"], children: ["anna-fateeva"] },
  { parents: ["pavel-fateev", "marina-drozdova"], children: ["nikita-fateev"] },
  { parents: ["pavel-fateev", "vera-plitkina"], children: ["sasha-fateev"] },
  { parents: ["oleg-povalyukhin", "vera-solovyova"], children: ["natalya-povalyukhina"] },
  { parents: ["oleg-povalyukhin", "alexandra-pirina"], children: ["anna-povalyukhina"] },
  { parents: ["oleg-povalyukhin", "olga-tankova"], children: ["maria-povalyukhina"] },
  { parents: ["nikita-fateev", "daryana-medvedeva"], children: ["daniil-fateev"] },
  { parents: ["natalya-povalyukhina", "gerard-hurley"], children: ["hawkin-hurley"] },
];

function personName(id) {
  return people[id]?.name || id;
}

function relatedList(ids = []) {
  return ids.map((id) => `<button type="button" class="link-button" data-person="${id}">${personName(id)}</button>`).join("");
}

function renderTree() {
  const match = searchEl.value.trim().toLowerCase();
  const lines = [];
  spouseLinks.forEach(([a, b]) => {
    const first = chartNodes[a];
    const second = chartNodes[b];
    const horizontal = Math.abs(first.y - second.y) < Math.abs(first.x - second.x);
    const startX = horizontal ? first.x + Math.sign(second.x - first.x) * 86 : first.x;
    const startY = horizontal ? first.y : first.y + Math.sign(second.y - first.y) * 44;
    const endX = horizontal ? second.x - Math.sign(second.x - first.x) * 86 : second.x;
    const endY = horizontal ? second.y : second.y - Math.sign(second.y - first.y) * 44;
    const markX = (startX + endX) / 2;
    const markY = (startY + endY) / 2;
    lines.push(`<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" class="marriage-line" />`);
    lines.push(`<text x="${markX}" y="${markY - 10}" class="marriage-mark">∞</text>`);
  });
  familyGroups.forEach((group) => {
    const parentXs = group.parents.map((id) => chartNodes[id].x);
    const parentY = Math.max(...group.parents.map((id) => chartNodes[id].y));
    const children = group.children.map((id) => chartNodes[id]);
    const rootX = parentXs.reduce((sum, x) => sum + x, 0) / parentXs.length;
    const joinY = parentY + 76;
    const childJoinY = Math.min(...children.map((child) => child.y)) - 62;
    const leftX = Math.min(...children.map((child) => child.x));
    const rightX = Math.max(...children.map((child) => child.x));
    lines.push(`<path d="M ${rootX} ${parentY + 44} V ${joinY} V ${childJoinY}" class="family-line" />`);
    if (children.length > 1) {
      lines.push(`<path d="M ${leftX} ${childJoinY} H ${rightX}" class="family-line" />`);
    }
    children.forEach((child) => {
      lines.push(`<path d="M ${child.x} ${childJoinY} V ${child.y - 44}" class="family-line" />`);
    });
  });

  const nodes = Object.entries(chartNodes)
    .map(([id, position]) => {
      const person = people[id];
      const hidden = match && !person.name.toLowerCase().includes(match);
      return `
        <button class="chart-person ${position.tone} ${hidden ? "is-dimmed" : ""}" type="button" data-person="${id}" style="left:${position.x}px; top:${position.y}px">
          <strong>${person.name}</strong>
          <span>${person.dates || ""}</span>
        </button>
      `;
    })
    .join("");

  treeEl.innerHTML = `
    <div class="pedigree-chart" role="img" aria-label="Интерактивное родословное дерево">
      <svg class="chart-lines" viewBox="0 0 1180 1840" aria-hidden="true">
        ${lines.join("")}
      </svg>
      ${nodes}
    </div>
  `;
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
  searchEl.value = "";
  renderTree();
});
document.querySelector("#collapse-all").addEventListener("click", () => {
  showPerson("anna-kuteinikova");
});

renderTree();
showPerson("anna-kuteinikova");
showMemoir();
renderPhotos();
