# AGENTS.md — RaQuel Synths Mainframe

## Purpose

Operational contract for AI coding agents working in `anaraquel00/raquel-synths`.

Primary branch:

```text
master
```

Default mode:

```text
READ-ONLY FIRST
```

Treat this repository as production.

---

## 1. Core Principles

Follow this order:

1. Preserve production behavior.
2. Understand before editing.
3. Make the smallest safe diff.
4. Never destroy user work.
5. Do not modify unrelated systems.
6. Validate before claiming success.
7. Review the final diff.
8. Commit only with explicit authorization.
9. Push only with explicit authorization.
10. Deploy only with explicit authorization.

If a request conflicts with these rules, stop and report the conflict.

---

## 2. READ-ONLY FIRST

Before editing, inspect Git state:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log -5 --oneline --decorate
```

When remote state matters:

```bash
git fetch --prune
git status
git log --oneline --decorate --graph --all -10
```

Do not automatically run `git pull` on divergent branches.

Before editing, read the exact target files and their relevant dependencies. Do not rely on memory, old diffs, screenshots, or assumptions.

For frontend work, inspect:

- template;
- TypeScript;
- SCSS;
- related service(s);
- route/data source;
- tests when relevant.

---

## 3. Scope Discipline

Only modify files required by the task.

Do not opportunistically:

- refactor neighboring code;
- rename unrelated symbols;
- reformat whole files;
- migrate APIs;
- change architectural patterns;
- update dependencies;
- reorganize folders;
- rewrite components;
- replace Signals;
- replace Angular control flow;
- alter unrelated SEO;
- alter unrelated analytics;
- alter unrelated Firebase behavior.

If a larger refactor would help, mention it separately after the requested work.

Before editing, state:

```text
Files expected to change:
- ...

Files explicitly protected:
- ...
```

---

## 4. Git Safety

Forbidden by default:

```bash
git reset --hard
git clean -fd
git clean -fdx
git checkout -- .
git restore .
git push --force
git push --force-with-lease
git branch -D
```

Also do not:

- delete local branches without authorization;
- rewrite published history;
- discard local work;
- stash automatically;
- overwrite uncommitted user changes;
- auto-resolve conflicts by blindly choosing one side.

If `git status` shows existing user changes:

1. identify them;
2. determine overlap with the task;
3. preserve them;
4. stop and ask if overlap is ambiguous.

If local and remote branches diverge, report:

- branch;
- local HEAD;
- remote HEAD if known;
- ahead/behind state;
- working-tree state;
- recommended reconciliation strategy.

---

## 5. Minimal Diff Standard

Prefer the smallest correct implementation.

A good diff:

- touches the minimum number of files;
- preserves existing APIs where possible;
- avoids duplicated logic;
- avoids fake data;
- adds no dependency unless necessary;
- follows existing project patterns;
- preserves responsive behavior;
- preserves accessibility;
- preserves SEO unless SEO is explicitly in scope.

After editing, confirm that the changed-file set matches the planned scope.

---

## 6. Angular Safety

This repository uses Angular with SSR/prerender.

Do not introduce browser-only APIs into SSR paths without guards.

Guard access to:

```text
window
document
navigator
localStorage
sessionStorage
MutationObserver
IntersectionObserver
```

Prefer existing injection/platform patterns.

Do not:

- convert Signals to RxJS or vice versa without a task requirement;
- replace `@if`, `@for`, `@switch` with legacy structural directives;
- introduce unnecessary lifecycle hooks;
- add npm dependencies for behavior already achievable with Angular/browser APIs.

Preserve:

- SSR;
- prerender;
- hydration;
- mobile layouts;
- keyboard navigation;
- focus states;
- PT/EN behavior;
- existing mode/theme behavior;
- reduced motion where animations are added.

---

## 7. HTML / Accessibility Safety

When changing templates:

- use semantic HTML;
- keep essential information available without hover;
- provide meaningful `aria-label` when needed;
- provide useful `alt` text;
- use real buttons/links for interaction;
- preserve keyboard access;
- avoid duplicated IDs;
- preserve bilingual behavior.

Do not introduce product semantics into editorial content unless it is actually a product.

---

## 8. SCSS Safety

Do not globally modify shared selectors to solve a local requirement when a scoped variant can solve it.

Prefer:

```scss
.component.special-variant { ... }
```

over broad changes to:

```scss
.component { ... }
```

Preserve visual identities:

```text
Broklin/default:
clean / cyan / violet / neon / controlled

Jonah:
industrial / rust orange / blood red / dark / chaos
```

Animations must be lightweight and should honor `prefers-reduced-motion` when relevant.

---

## 9. Firebase / Firestore Safety

Default:

```text
DO NOT MODIFY FIRESTORE OR FIREBASE DATA
```

unless explicitly required and authorized.

Do not:

- create fake Firestore documents;
- delete documents;
- migrate collections;
- rename fields;
- alter security rules;
- alter credentials;
- write production data during testing;
- assume local constants mirror Firestore.

Preserve the data boundary between editorial UI and database-backed product/content arrays.

---

## 10. Secrets

Never print, commit, or expose:

- private API keys;
- service-account JSON;
- tokens;
- passwords;
- OAuth secrets;
- private keys;
- `.env` contents.

Do not modify secrets or credentials unless explicitly authorized.

If a secret appears in a diff, stop and report it.

---

## 11. Commerce Safety

Do not modify commerce flows unless explicitly in scope.

Protected behaviors include:

- Stripe;
- affiliate links;
- Amazon;
- Shein;
- AliExpress;
- checkout modals;
- affiliate telemetry;
- product availability;
- product prices;
- Firestore-backed products.

Do not route editorial/software navigation through commercial handlers.

Do not fabricate:

```text
price: 0
InStock
Offer
AffiliateClick
Stripe product
```

for non-commercial content.

---

## 12. SEO / Routing Safety

Treat SEO and routing as production-critical.

Do not casually modify:

- canonical URLs;
- sitemap;
- robots;
- JSON-LD;
- Open Graph;
- Twitter/X metadata;
- Vercel redirects;
- rewrites;
- legacy URL migration rules.

Treat `vercel.json` as production-sensitive.

Before changing redirects/rewrites:

1. read the full file;
2. understand rule order;
3. preserve existing routes;
4. validate query-string behavior;
5. test redirect chains;
6. avoid breaking GSC-validated URLs.

Validate redirects with:

```bash
curl -I 'https://example.com/legacy-url'
curl -IL 'https://example.com/legacy-url'
```

Do not claim an SEO redirect is fixed until the real `Location` response has been checked.

---

## 13. Tracking / Analytics Safety

Prefer the existing tracking service.

Do not introduce direct analytics snippets into components unless required.

Use semantic custom-event names.

Do not classify editorial/software navigation as affiliate commerce.

Tracking failure must never block navigation or core UI behavior.

---

## 14. Testing and Validation

At minimum for Angular code changes:

```bash
npm run build
```

Repository build command:

```text
ng build
```

Run targeted tests when relevant. Full suite when appropriate:

```bash
npm test
```

Never claim tests passed if they were not executed.

If the environment blocks execution, state that clearly.

Separate:

```text
NEW ERROR CAUSED BY THIS CHANGE
```

from:

```text
PRE-EXISTING ERROR / ENVIRONMENT LIMITATION
```

Do not fix unrelated pre-existing errors unless requested.

---

## 15. UI Validation Checklist

When applicable, verify:

- target route renders;
- unrelated routes remain unchanged;
- PT works;
- EN works;
- Broklin/default mode works;
- Jonah mode works;
- desktop works;
- tablet remains responsive;
- mobile does not overflow;
- CTA is keyboard accessible;
- external new-tab links are safe;
- no unintended console error;
- no commercial handler is accidentally triggered;
- no fake product/data record is introduced;
- no unintended JSON-LD entry is generated.

---

## 16. Diff Review — Mandatory

After implementation:

```bash
git status --short
git diff --stat
git diff
```

Review individual files when needed:

```bash
git diff -- path/to/file
```

Confirm:

```text
- only intended files changed;
- no temporary artifacts remain;
- no debug code remains;
- no secret was added;
- no dependency changed unintentionally;
- no unrelated formatting churn exists;
- requested behavior is implemented;
- protected behavior remains intact.
```

Remove temporary engineering artifacts unless explicitly requested, such as:

```text
*.patch
temporary scripts
debug dumps
temporary screenshots
```

---

## 17. Commit Gate

Default:

```text
DO NOT COMMIT
```

Stop after implementation, validation, tests/build, diff review, and report.

Commit only after explicit authorization.

Before commit:

```bash
git status --short
git diff --stat
```

Recommended style:

```text
feat: ...
fix: ...
docs: ...
style: ...
refactor: ...
test: ...
chore: ...
```

Use:

```bash
git commit -m "type: concise description"
```

Stage only files belonging to the approved change.

---

## 18. Push Gate

Default:

```text
DO NOT PUSH
```

Push only after explicit authorization.

Before push:

```bash
git status
git log -3 --oneline --decorate
```

Verify branch and remote.

Never force-push unless explicitly requested and consequences are understood.

---

## 19. Deploy Gate

Default:

```text
DO NOT DEPLOY
```

A successful build is not deployment authorization.

Do not trigger:

- Vercel production deploy;
- Firebase Hosting deploy;
- GitHub Pages deploy;
- external release;
- production DB write;
- production migration.

Before an authorized deploy, report:

```text
branch:
HEAD:
working tree:
tests:
build:
diff/commit:
target environment:
```

---

## 20. Stop Conditions

Stop and ask if:

- branch is unexpected;
- working tree has overlapping unknown changes;
- Git history is unexpectedly divergent;
- a conflict occurs;
- user work could be destroyed;
- credentials are missing;
- production data changes are required but unauthorized;
- architectural intent is ambiguous;
- unrelated commerce would be affected;
- SEO/routing outside scope would be affected;
- a build failure would expand scope to fix;
- commit/push/deploy is needed without explicit authorization.

Do not hide uncertainty.

---

## 21. Operational Report Format

At the end of an implementation task, report:

### Scope
What was requested.

### Audit
Relevant state discovered before editing.

### Changes
Files changed and what changed.

### Protected Areas
What was intentionally not modified.

### Validation
Commands executed and results.

### Build / Tests
Exact result.

### Diff Review
`git diff --stat` summary and important observations.

### Git State
Branch and working-tree state.

### Gates

```text
Commit: NOT PERFORMED / PERFORMED WITH AUTHORIZATION
Push: NOT PERFORMED / PERFORMED WITH AUTHORIZATION
Deploy: NOT PERFORMED / PERFORMED WITH AUTHORIZATION
```

### Remaining Risks
Only concrete remaining risks.

---

## 22. Task Start Sequence

Use this sequence for each new task:

```text
1. READ REQUEST
2. CHECK BRANCH / HEAD / STATUS
3. READ TARGET FILES
4. IDENTIFY DATA / ROUTING / SERVICE DEPENDENCIES
5. STATE PLANNED FILE SET
6. IMPLEMENT MINIMAL DIFF
7. RUN TARGETED VALIDATION
8. RUN npm run build
9. RUN TESTS WHEN RELEVANT
10. REVIEW git diff
11. REPORT
12. STOP BEFORE COMMIT
```

---

## 23. Repository Technical Baseline

Current baseline:

```text
Angular 20
TypeScript
SCSS
Angular SSR
Prerender
Angular Service Worker
Firebase / AngularFire
Vercel
Express SSR runtime
Karma / Jasmine
RxJS
SweetAlert2
```

Production build:

```bash
npm run build
```

Development server:

```bash
npm start
```

Tests:

```bash
npm test
```

SSR runtime after build:

```bash
npm run serve:ssr:raquel-synths
```

Do not change this baseline unless the task explicitly requires it.

---

## 24. Final Rule

The agent is not rewarded for changing more code.

```text
UNDERSTAND MORE
CHANGE LESS
VERIFY EVERYTHING
PRESERVE USER WORK
STOP AT THE GATE
```
