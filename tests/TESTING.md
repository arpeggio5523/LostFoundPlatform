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
├── setup/ # Jest setup, test DB config
└── utils/ # Test helpers (render wrappers, factories)

## Description

Tests live in `tests/` folder split by type:

| Folder              | Purpose                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `tests/unit`        | Isolated tests for components, hooks, controllers, models, utils. No real DB or network calls. Mirrors `src/` folder names. |
| `tests/integration` | Tests API routes end-to-end                                                                                                 |
| `tests/mocks`       | Shared mock data and API handlers reused across tests                                                                       |
| `tests/setup`       | Global Jest config, DB connection setup/teardown                                                                            |
| `tests/utils`       | Shared test helpers                                                                                                         |

## Writing Tests

Write tests in a folder with ".test.js" file extension. Since Vitest is used for testing it commonly looks for files with this extension to run the tests

## Running Tests

Running a single test file:
npx vitest <filename>

Running all tests:
npm run test
This runs the tests and watches for any changes (runs in watch mode)

Running tests for CI/CD:
npx vitest run

## Coverage Target

Frontend:
Backend:

## Tech Stack

Vitest is used for testing the backend components.

## CI/CD

Unit and Integration tests run on every push.
Deployment is handled by CI/CD on every merge to the main branch.
