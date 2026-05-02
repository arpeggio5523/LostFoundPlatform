# Project Directory Structure Reference

```
├── node_modules/       # Installed libraries (Managed by Node.js/npm)
├── public/             # Static assets like favicon or robots.txt
├── src/                # Main source code
│   ├── assets/         # Global images, icons, and SVG files
│   ├── components/     # Common UI elements (Buttons, Inputs, Navbar)
│   ├── features/       # Feature-based modules (Team-specific logic)
│   │   ├── Auth/       # Login/Signup components & logic
│   │   └── Reporting/  # Dashboard & Report generation
│   ├── hooks/          # Reusable logic (e.g., useForm, useAuth)
│   ├── pages/          # Full page views linked to URL routes
│   ├── services/       # API calls (Gemini, Mapbox, Database)
│   ├── styles/         # Global CSS and Tailwind templates
│   │   └── index.css   # Main Tailwind directives
│   ├── __tests__/      # Vitest tests folder
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point for Vite/React
├── tests/              # Playwright End to End tests folder
├── .gitignore          # Tells Git which files to ignore (node_modules!)
├── index.html          # The single HTML page Vite injects code into
├── package.json        # Project metadata and script commands (npm run dev)
├── postcss.config.js   # Tooling for Tailwind to work in browsers
├── tailwind.config.js  # Tailwind custom themes and plugins
└── vite.config.js      # Configuration for the Vite build tool
```

## What goes in each directory?

- **node_modules/**: All installed npm packages (auto-managed, do not edit)
- **public/**: Static files (favicon, robots.txt, etc.)
- **src/**: All application source code
  - **assets/**: Images, icons, SVGs used globally
  - **components/**: Reusable UI elements (buttons, navbars, etc.)
  - **features/**: Feature-specific logic, grouped by domain (e.g., Auth, Reporting)
    - **Auth/**: Login/signup logic and components
    - **Reporting/**: Dashboard, report generation logic
  - **hooks/**: Custom React hooks (e.g., useForm, useAuth)
  - **pages/**: Top-level page components (mapped to routes)
  - **services/**: API clients and service logic (e.g., Gemini, Mapbox, DB)
  - **styles/**: Global CSS, Tailwind setup
    - **index.css**: Main Tailwind/CSS entry
  - **__tests__/**: Unit/integration tests (Vitest)
  - **App.jsx**: Root React component
  - **main.jsx**: React/Vite entry point
- **tests/**: End-to-end tests (Playwright)
- **.gitignore**: Files/folders Git should ignore
- **index.html**: Main HTML file for Vite
- **package.json**: Project metadata, dependencies, scripts
- **postcss.config.js**: Tailwind/PostCSS config
- **tailwind.config.js**: Tailwind theme/plugins config
- **vite.config.js**: Vite build tool config
