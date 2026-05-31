# GreenCity — E2E Automation (Playwright + TypeScript + Allure)

Automated end-to-end tests for the **GreenCity** web application, built with
**Playwright** and **TypeScript**, following the **Page Object Model (POM)** and a
**component-based** architecture, with **Allure** reporting.

📊 **Live Allure report (GitHub Pages):** <https://dudanataliia.github.io/team13-playwright/>

> The report is published automatically by GitHub Actions on every push. To enable it, set
> the repository **Pages** source to **GitHub Actions** (Settings → Pages) and add
> `USER_EMAIL` / `USER_PASSWORD` as repository **secrets** (Settings → Secrets and variables
> → Actions) so the login-based tests can run in CI.

- Application under test: <https://www.greencity.cx.ua/#/greenCity>
- 10 automated test cases covering the **Create / Edit News** flow (TC-01 … TC-10).

---

## Tech stack

| Layer            | Tool                          |
| ---------------- | ----------------------------- |
| Test runner      | Playwright Test               |
| Platform         | Node.js                       |
| Language         | TypeScript (strict)           |
| Reporter         | Allure Report                 |
| Config / secrets | dotenv (`.env`)               |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
copy .env.example .env   # Windows (PowerShell/CMD)
# cp .env.example .env    # macOS / Linux
```

`.env` variables:

```bash
BASE_URL=https://www.greencity.cx.ua/#/greenCity
HEADLESS=true
RETRIES=0
TIMEOUT=30000
USER_EMAIL=your-greencity-account@example.com
USER_PASSWORD=your-password
```

> Most test cases require an authenticated user (creating/editing news). Provide a valid
> GreenCity account in `USER_EMAIL` / `USER_PASSWORD`. Tests that need login are
> automatically **skipped** if these are not set.
>
> `.env` is git-ignored and must **never** be committed.

---

## Running the tests

```bash
# Run all tests (headless)
npm test

# Run with a visible browser
npm run test:headed

# Open the Playwright interactive UI
npm run test:ui
```

---

## Allure report

```bash
# Generate a static report from the latest results
npm run allure:generate

# Open the generated report
npm run allure:open

# Or generate + serve in one step
npm run allure:serve
```

`npm run report` runs the tests and then generates and opens the Allure report.

On test failure, the report automatically includes a **screenshot**, **video**, and a
**trace** (`retain-on-failure`), plus an attachment with **browser console / page / network
errors** captured during the test.

---

## Project structure

```
greencity-playwright/
├── .github/workflows/           # GitHub Actions CI (tests + Allure on GitHub Pages)
│   └── playwright.yml
├── tests/                       # Test specs (one file per test case, *.spec.ts)
│   ├── tc-01-create-news-form.spec.ts
│   ├── ...
│   └── tc-10-edit-news.spec.ts
├── pages/                       # Page Object Model classes
│   ├── base.page.ts             # Abstract base page
│   ├── news.page.ts             # Eco-news page + news details
│   ├── sign-in.page.ts          # Sign-in modal
│   ├── create-news.page.ts      # Create / Edit News form
│   └── preview-news.page.ts     # News preview screen
├── components/                  # Reusable UI components
│   ├── base.component.ts        # Abstract base component
│   ├── header.component.ts      # Site header (cross-cutting)
│   └── confirm-modal.component.ts
├── fixtures/                    # Custom Playwright fixtures
│   └── fixtures.ts              # Page objects, language setup, login, error capture
├── utils/                       # Shared helpers
│   ├── env.ts                   # Type-safe .env loader
│   └── images.ts                # In-memory image generation for upload tests
├── test-cases/                  # TC-01 … TC-10 specs + automation notes
├── .env.example                 # Environment template (committed)
├── .gitignore
├── playwright.config.ts         # baseURL, reporters, trace/screenshot/video
├── tsconfig.json
└── package.json
```

### Architecture

- **Page Object Model** — every screen is a class in `pages/`. Test specs contain only
  business logic (page-method calls) and assertions (`expect`). Raw locators are **never**
  used directly in test files.
- **Component-based approach** — cross-cutting UI fragments (e.g. the `Header`, the
  confirmation modal) are extracted into reusable classes in `components/` and composed
  inside page objects.
- **Allure steps** — key actions inside page methods are wrapped in
  `allure.step('...', async () => { ... })` for a detailed, readable report.

---

## Test cases

| ID    | Area                              |
| ----- | --------------------------------- |
| TC-01 | Create News form layout & fields  |
| TC-02 | Title validation & Publish enable |
| TC-03 | Tag selection (1–3 tags)          |
| TC-04 | Image upload validation           |
| TC-05 | Main Text validation              |
| TC-06 | Source field validation           |
| TC-07 | Cancel confirmation modal         |
| TC-08 | Preview news content              |
| TC-09 | "Edit news" button visibility     |
| TC-10 | Edit news & save changes          |

Each test case is documented in `test-cases/TC-XX.md`, including automation notes and any
product bugs discovered while automating it. Where the live UI deviates from the test-case
specification, the test is designed to **fail and document the bug** (see the notes in the
corresponding `test-cases/*.md`).

---

## CI/CD (GitHub Actions + GitHub Pages)

The workflow in `.github/workflows/playwright.yml`:

- runs on every `push` / `pull_request` to the main branch,
- installs dependencies and the Chromium browser, runs the Playwright tests,
- generates the Allure report from `allure-results`,
- deploys the report to **GitHub Pages** at the link shown at the top of this README.

One-time repository setup:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions** → add `USER_EMAIL` and `USER_PASSWORD`
   so the login-based tests can run in CI (otherwise those tests are skipped).

---

## Scripts

| Script                   | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `npm test`               | Run all tests                                      |
| `npm run test:headed`    | Run with a visible browser                         |
| `npm run test:ui`        | Open the Playwright UI                             |
| `npm run allure:generate`| Generate the Allure report from `allure-results`   |
| `npm run allure:open`    | Open the generated Allure report                   |
| `npm run allure:serve`   | Generate and serve the report in one step          |
| `npm run report`         | Run tests, then generate and open the report       |
