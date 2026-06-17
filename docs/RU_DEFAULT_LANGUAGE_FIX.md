# Required fix: Russian default language

The default public URL must open the Russian version.

Required behavior:

```text
/                  -> Russian
/?lang=ru          -> Russian
/?lang=en          -> English
/?lang=en#memoirs  -> English at Memoirs
```

Current issue:

`index.html` still falls back to browser language when no `?lang=` is present:

```js
if (!lang) {
  lang = navigator.language && navigator.language.startsWith("en") ? "en" : "ru";
  localStorage.setItem("family-memory-book-lang", lang);
}
```

This must be changed. The public default must not depend on browser language.

Use this resolver instead:

```js
// ---- Language resolver: URL query > Russian default ----
(function () {
  var urlLang = new URLSearchParams(window.location.search).get("lang");
  var lang = "ru";
  if (urlLang === "en" || urlLang === "ru") {
    lang = urlLang;
  }
  localStorage.setItem("family-memory-book-lang", lang);
  window.__lang = lang;
  document.documentElement.lang = lang === "en" ? "en-US" : "ru";
})();
```

After deploy, verify:

```text
https://oleg3479881328-code.github.io/family-memory-book/
https://oleg3479881328-code.github.io/family-memory-book/?lang=ru
https://oleg3479881328-code.github.io/family-memory-book/?lang=en
https://oleg3479881328-code.github.io/family-memory-book/?lang=en#memoirs
```
