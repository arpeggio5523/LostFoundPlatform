## Folder Structure

tests/
├── unit/
│ ├── components/ # React component tests
│ ├── hooks/ # Custom hook tests
│ ├── controllers/ # Controller logic tests
│ ├── models/ # Mongoose model tests
│ └── utils/ # Utility/helper function tests
│
├── integration/
│ └── routes/ # API route tests
│
├── e2e/ # Playwright end-to-end tests
├── mocks/ # Shared mock data/handlers
├── setup/ # Vitest setup
└── utils/ # Test helpers (render wrappers, factories)

## Description

Tests live in the `tests/` folder, split by type:

| Folder              | Purpose                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `tests/unit`        | Isolated tests for components, hooks, controllers, models, utils. No real DB or network calls. Mirrors `src/` folder names. |
| `tests/integration` | Tests API routes end-to-end.                                                                                                |
| `tests/e2e`         | End-to-end tests using Playwright simulating real user interactions in a browser environment.                               |
| `tests/mocks`       | Shared mock data and API handlers reused across tests.                                                                      |
| `tests/setup`       | Vitest config and setup/teardown.                                                                                           |
| `tests/utils`       | Shared test helpers.                                                                                                        |

## Install Dependencies

```bash
npm install -D vitest @playwright/test @testing-library/jest-dom
npx playwright install chromium
```

> [!IMPORTANT]
> **Native Linux Dependencies**
> If you are running Playwright on a Native Linux machine, the machine must have the underlying OS libraries installed to launch the browser.
> 
> You must run the following command with an account that has `sudo` privileges:
> ```bash
> npx playwright install-deps
> ```
> This installs the required global system dependencies (like `libnspr4.so`) so the runner can execute the tests.

## Writing Tests

Write tests in a file with a `.test.js` extension. Since Vitest is used for testing, it looks for files matching this pattern by default.

## Running Tests

Use the following npm scripts to run tests:

**Vitest (Unit/Integration):**
- `npm run test` — Runs Vitest tests in watch mode.
- `npm run test:unit` — Runs tests once (ideal for CI/CD).
- `npm run test:coverage` — Runs tests and generates a coverage report.

**Playwright (End-to-End):**
- `npm run test:e2e` — Runs Playwright E2E tests in headless mode.
- `npm run test:e2e:ui` — Opens the Playwright UI mode for interactive testing.
- `npm run test:e2e:report` — Opens the HTML report from the last Playwright test run.

## Coverage Target

| Layer    | Target |
| -------- | ------ |
| Frontend | —      |
| Backend  | —      |

## Tech Stack

- **Vitest** — Used for unit and integration testing.
- **Playwright** — Used for full end-to-end testing in the browser.

## CI/CD

- Unit and integration tests run on every push to any branch.
- Deployment is handled by CI/CD on every merge to `main`.
