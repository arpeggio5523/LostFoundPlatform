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
├── mocks/ # Shared mock data/handlers
├── setup/ # Vitest setup
└── utils/ # Test helpers (render wrappers, factories)

## Description

Tests live in the `tests/` folder, split by type:

| Folder              | Purpose                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `tests/unit`        | Isolated tests for components, hooks, controllers, models, utils. No real DB or network calls. Mirrors `src/` folder names. |
| `tests/integration` | Tests API routes end-to-end.                                                                                                |
| `tests/mocks`       | Shared mock data and API handlers reused across tests.                                                                      |
| `tests/setup`       | Vitest config and setup/teardown.                                                                                           |
| `tests/utils`       | Shared test helpers.                                                                                                        |

## Install Dependencies

```bash
npm install -D vitest
```

## Writing Tests

Write tests in a file with a `.test.js` extension. Since Vitest is used for testing, it looks for files matching this pattern by default.

## Running Tests

**Run a single test file:**

```bash
npx vitest <filename>
```

**Run all tests (watch mode):**

```bash
npm run test
```

This runs the tests and watches for changes.

**Run tests for CI/CD:**

```bash
npx vitest run
```

## Coverage Target

| Layer    | Target |
| -------- | ------ |
| Frontend | —      |
| Backend  | —      |

## Tech Stack

- **Vitest** — used for testing backend components.

## CI/CD

- Unit and integration tests run on every push.
- Deployment is handled by CI/CD on every merge to `main`.
