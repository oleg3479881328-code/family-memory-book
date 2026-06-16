# EN-US Translation Handoff

## Purpose

This document is the cleaned implementation handoff for adding a US-adapted English version of the Family Memory Book site while preserving the existing Russian version.

The executor should use this document together with the translation packs already prepared in Issue #2.

Issue: https://github.com/oleg3479881328-code/family-memory-book/issues/2

## Current status of prepared content

Prepared in repository files:

- `data/i18n/ui.en-US.js` — English UI strings.
- `data/i18n/family.en-US.js` — English display names, short names, notes, and transliteration rules for family cards.
- `data/i18n/help.en-US.js` — full English text layer for the help page.

Prepared in Issue #2 comments:

- `EN-US Translation Pack v1` — UI, genealogy, photo captions, memoir title map, adaptation rules.
- `EN-US Translation Pack v2A` — memoir translations for:
  - `воспоминания-веры-дмитриевны-подковцевой`
  - `русская-печь`
  - `семейные-хроники`
- `EN-US Translation Pack v2B` — memoir translations for:
  - `отец`
  - `родители`
  - `письма-к-сыну`
  - `устами-младенцев`
  - `воспоминания-о-детстве-и-бабушке`
  - `земляничное-мыло`
- `SELF-REVIEW` — risks and corrections before implementation.

## Objective

Add bilingual support to the static GitHub Pages site:

1. Russian — current source version, unchanged.
2. English — US-adapted version.

The English version must include:

- translated UI;
- translated help page;
- English person-card display names and notes;
- translated memoir section titles;
- English memoir body text;
- translated photo captions/descriptions where applicable.

## Allowed scope

Allowed to change or add:

- `index.html`
- `help.html` or new `help.en.html`
- `app.js`
- `styles.css`, only if needed for language switcher or bilingual display
- `data/i18n/ui.en-US.js`
- `data/i18n/family.en-US.js`
- `data/i18n/help.en-US.js`
- `data/i18n/memoirs.en-US.js`
- `data/i18n/photo-albums.en-US.js`
- documentation files under `docs/`

## Out of scope

Do not:

- redesign the site;
- rewrite the Russian memoirs;
- rewrite family history;
- change genealogy relationships;
- delete, replace, or rename photos;
- rerun DOCX extraction;
- change GitHub Pages deployment behavior;
- add a backend or build system unless explicitly approved.

## Forbidden changes

Do not modify these files directly unless the owner explicitly approves a source-data edit:

- `data/memoirs.js`
- `data/family.js`
- `data/photo-albums.js`
- `assets/photos/`
- `assets/photo-albums/`

The English layer must be additive.

## Privacy note

The repository is public. The Russian family materials are already public in this repository, but the English adaptation makes the material more accessible to non-Russian readers.

Executor must not add extra private context, raw source documents, private correspondence, medical information, addresses, phone numbers, or unpublished family material.

## Translation policy

Use natural American English, not literal machine translation.

Preserve:

- facts;
- dates;
- relationships;
- names;
- memoir section order;
- original Russian source text;
- emotional tone and family voice.

Do not invent:

- missing dates;
- extra biographical context;
- explanations that are not in the source;
- relationship details not present in source data.

## Name display policy

Default English details display:

```text
English transliteration / Original Russian name
```

Example:

```text
Oleg Igorevich Povalyukhin / Олег Игоревич Повалюхин
```

Tree cards may use short English names if space is limited:

```text
Oleg Povalyukhin
```

Person detail panels should preserve the full bilingual name.

## Transliteration standard

Use the standard already recorded in `data/i18n/family.en-US.js`:

- `Пётр` → `Petr`
- `Николай` → `Nikolay`
- `Юрий` → `Yuriy`
- `Сергей` → `Sergey`
- `Дмитрий` → `Dmitry`
- `Наталья` → `Natalya`
- `Софья` → `Sofya`
- `Валерьевна` → `Valerievna`

Do not switch to alternate spellings such as `Pyotr`, `Nikolai`, `Yuri`, or `Sophia` unless the owner explicitly approves.

## Relationship wording

Avoid implying more legal certainty than the source provides.

Prefer in English person cards:

```text
Spouse/partner recorded with ...
```

Use `Former spouse of ...` only where the Russian source explicitly indicates former status.

## Cultural translation notes

Use these consistently:

- `деревня` → `village`
- `дача` → `dacha` or `country house`, depending on context
- `Переделкино` → `Peredelkino`
- `Городок писателей` → `the Writers’ Village`
- `Дом творчества` → `the House of Creativity` or `the Writers’ Retreat`; if possible, add a short note
- `русская печь` → `Russian stove`
- `баня` → `bathhouse` or `banya` on first culturally specific use
- `коммуналка` → `communal apartment`
- `шпаргалка` → `cheat sheet`
- `электричка` → `commuter train`
- `сваты / сватовство` → `matchmakers / matchmaking visit`
- `девичник` in historical village context → `bridal gathering`, not `bachelorette party`
- `запои` in historical wedding-custom context → `pre-wedding family drinking gatherings`
- `картузная мастерская` → `cap-making workshop`
- `картуз` → `cloth cap` or `men’s cap`
- `холодец` → `kholodets, a chilled meat aspic` on first use
- `заливное из судака` → `aspic made from pike-perch` or `aspic made from zander`; choose one and be consistent
- `Рождество Пресвятой Богородицы` → `Nativity of the Virgin Mary` or `Nativity of the Theotokos (Birth of the Virgin Mary)`

## Help page EN-US content

Use `data/i18n/help.en-US.js` as the source of English help-page copy.

Implementation options:

1. Keep one `help.html` and switch content based on selected language.
2. Add `help.en.html` and link to it from EN mode.

Recommended minimal option: add `help.en.html` if it is faster and safer. Preserve `help.html` as the Russian help page.

## Memoirs implementation

Create:

```text
data/i18n/memoirs.en-US.js
```

Recommended object:

```js
window.MEMOIRS_EN_US = {
  title: "Family Memory Book",
  source: "Adapted English translation from: Мемуары воспоминания (1).docx",
  translationNote: "The English text is adapted for readability for a US-based audience. The Russian original remains the source version.",
  sections: []
};
```

Populate `sections` from Issue #2 comments `EN-US Translation Pack v2A` and `EN-US Translation Pack v2B`.

Important: keep every Russian section `id` exactly unchanged, because app logic can map translations by `id`.

Expected memoir IDs:

```text
воспоминания-веры-дмитриевны-подковцевой
русская-печь
семейные-хроники
отец
родители
письма-к-сыну
устами-младенцев
воспоминания-о-детстве-и-бабушке
земляничное-мыло
```

## Photo album translation

Create if needed:

```text
data/i18n/photo-albums.en-US.js
```

Generic description:

```text
Фотографии из семейного альбома.
→ Photographs from the family album.
```

Caption patterns:

```text
Фотоальбом Тамары Николаевны. Фото 1
→ Tamara Nikolaevna’s Photo Album. Photo 1

Фотоальбом Тамара Николаевна Григорьева / Повалюхина. Фото 19
→ Tamara Nikolaevna Grigoryeva / Povalyukhina Photo Album. Photo 19

Фотоальбом Елены Николаевны. Фото 1
→ Elena Nikolaevna’s Photo Album. Photo 1

Фотография 1
→ Photograph 1
```

If all captions match these patterns, generate them programmatically instead of maintaining a large duplicate file.

## Language switcher behavior

Recommended:

- Default language: Russian.
- Add clear switcher: `Русский | English`.
- Store selection in `localStorage`.
- Also support URL query:
  - `?lang=ru`
  - `?lang=en`
- EN mode should affect:
  - UI text;
  - person cards;
  - memoir titles and bodies;
  - photo captions;
  - help page.

## Fallback rules

If a translation is missing:

```text
English translation pending. Showing original Russian text.
```

If an English name is missing:

```text
English name pending. Showing original Russian name.
```

Never silently show mixed-language content without a fallback marker.

## Validation checks

Before reporting completion, executor must verify:

- Russian version still works.
- English version works.
- Language switcher works.
- `localStorage` language choice works, if implemented.
- `?lang=ru` and `?lang=en` work, if implemented.
- `data/memoirs.js` was not modified.
- `data/family.js` was not modified unless explicitly approved.
- `data/photo-albums.js` was not modified unless explicitly approved.
- Every Russian memoir section ID exists in English translation.
- No invented English-only memoir section IDs exist.
- Person cards open in both languages.
- Search works at least in Russian; English search should work if implemented.
- Photo archive still works.
- Help page exists in English.
- GitHub Pages static deployment still works.

## Suggested implementation order

1. Read project docs:
   - `PROJECT_ENTRYPOINT.md`
   - `PROJECT_STATE.md`
   - `PROJECT_RULES.md`
   - `docs/ARCHITECTURE.md`
   - `docs/MAINTENANCE.md`
   - `docs/CODEX_HANDOFF.md`
2. Add/load i18n files.
3. Add language state resolver.
4. Add UI text resolver.
5. Add person-card translation resolver.
6. Add memoir translation resolver.
7. Add photo caption resolver.
8. Add help-page English path or dynamic help translation.
9. Validate RU mode.
10. Validate EN mode.
11. Report exactly what was changed and what was not validated.

## Required execution report format

```text
EXECUTION REPORT

Status:
Files Changed:
Validation Performed:
Validation Not Performed:
Blockers:
Assumptions Made:
Risks / Follow-Up:
Ready For Review: Yes / No
```
