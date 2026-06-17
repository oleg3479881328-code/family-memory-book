# EN-US Commit, Rollback, and Publish Rules

This document is an additional required instruction for the EN-US bilingual implementation task.

It exists to make the implementation reversible, reviewable, and safely publishable through GitHub Pages.

Issue: https://github.com/oleg3479881328-code/family-memory-book/issues/2

## Required workflow

The executor must not treat the EN-US implementation as a loose set of file edits.

Use a controlled Git workflow:

1. Start from the current `main` branch.
2. Record the exact starting commit SHA before making implementation changes.
3. Create a separate implementation branch, for example:

```text
feature/en-us-bilingual-site
```

4. Make the EN-US implementation on that branch.
5. Commit changes in logical checkpoints.
6. Open a pull request back to `main`, or clearly report the branch/commit if the owner chooses direct merge.
7. Do not consider the task complete until the GitHub Pages site is checked after publish/merge.

## Rollback requirement

Before changing production-facing files, record:

```text
ROLLBACK_POINT=<starting-main-commit-sha>
```

The execution report must include:

- starting commit SHA;
- final implementation commit SHA;
- branch name;
- PR link, if a PR was created;
- exact files changed;
- rollback method.

Recommended rollback methods:

```text
Option A: Revert the implementation PR.
Option B: Revert the final implementation commit.
Option C: Reset branch back to ROLLBACK_POINT only if the owner explicitly approves a destructive reset.
```

Do not use destructive reset as the default rollback path.

## Commit checkpoint requirements

Use logical commits. Recommended sequence:

```text
1. Add/load EN-US i18n files
2. Add language resolver and shareable lang URLs
3. Wire static index UI to i18n
4. Wire app.js render strings to i18n
5. Add help-page EN path or dynamic help language support
6. Add photo caption resolver
7. Validate and document RU/EN behavior
```

The final report must say which of these checkpoints were completed.

## Publish requirement

This is a static GitHub Pages site. The executor must not change deployment behavior unless the owner explicitly approves.

After merge/publish, verify the public site URL:

```text
https://oleg3479881328-code.github.io/family-memory-book/
```

Required publish checks:

```text
https://oleg3479881328-code.github.io/family-memory-book/?lang=ru
→ opens Russian version

https://oleg3479881328-code.github.io/family-memory-book/?lang=en
→ opens English version

https://oleg3479881328-code.github.io/family-memory-book/?lang=en#memoirs
→ opens English version at Memoirs

https://oleg3479881328-code.github.io/family-memory-book/help.html?lang=en
→ opens English help content, or redirects to help.en.html if that strategy is chosen
```

If GitHub Pages deployment is delayed, report that explicitly and include the commit SHA that should become published.

## Required final execution report extension

In addition to the standard execution report, include:

```text
GIT / PUBLISH REPORT

Starting Main Commit SHA:
Implementation Branch:
Final Commit SHA:
Pull Request:
Rollback Method:
Published Site Checked: Yes / No
Published RU URL Checked: Yes / No
Published EN URL Checked: Yes / No
Copied EN Link Checked In Fresh Session: Yes / No
Deployment Notes:
```

## Hard rule

Do not mark the task `Ready For Review: Yes` unless there is a clear rollback point and the owner can publish or revert safely.
