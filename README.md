# Wakeel AI — Frontend

[![CI](https://github.com/WakeelAI-Project/WakeelAI-Frontend/actions/workflows/ci.yaml/badge.svg)](https://github.com/WakeelAI-Project/WakeelAI-Frontend/actions/workflows/ci.yaml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Platform](https://img.shields.io/badge/platform-Web-informational)

The HR/admin-facing web dashboard for **Wakeel AI**, an AI-assisted HR platform. Company owners and HR managers manage employees, departments, and leave requests, generate HR documents from templates, and chat with an AI assistant for labor-law/company-policy questions and document drafting — in Arabic or English, with full RTL support.

This is one of four repositories that make up the Wakeel AI system:

| Repo | Role |
| --- | --- |
| [WakeelAI-Mobile](https://github.com/WakeelAI-Project/WakeelAI-Mobile) | Employee-facing Flutter app |
| **WakeelAI-Frontend** *(this repo)* | HR/admin web dashboard |
| [WakeelAI-Backend](https://github.com/WakeelAI-Project/WakeelAI-Backend) | ASP.NET Core API — auth, leave, employees, documents |
| [WakeelAI-AI](https://github.com/WakeelAI-Project/WakeelAI-AI) | Node.js AI orchestrator — chat, RAG over labor law/company policy, leave/document tool-calling |

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Testing](#testing)
- [Localization](#localization)
- [Project Structure](#project-structure)
- [CI/CD & Deployment](#cicd--deployment)
- [Contributing](#contributing)
- [Team](#team)

## Features

- **Role-based dashboards** — a shared app shell (sidebar, topbar, command palette) with separate views for **Company Owner** (company profile, HR team, audit log, read-only departments/leave) and **HR Manager** (employees, leave, documents, templates).
- **Employee & department management** — full CRUD for employees and departments, with photo/logo uploads.
- **Leave management** — review, approve, and track leave requests.
- **HR document templates** — a rich template editor with a placeholder palette and live preview, plus AI-assisted clause suggestions grounded in labor law or company policy.
- **AI chat assistant** — a conversational interface (Markdown + LaTeX rendering, source citations, missing-field forms) backed by the [AI orchestrator](https://github.com/WakeelAI-Project/WakeelAI-AI)'s RAG pipeline.
- **Audit log** — a filterable, paginated history of admin actions (Owner-only).
- **Full Arabic/English localization** — every string is locale-aware, with automatic RTL/LTR layout switching plus a manual toggle.
- **Light/dark theme.**

## Tech Stack

- **[React](https://react.dev)** 19, with the [React Compiler](https://react.dev/learn/react-compiler) enabled via a Vite/Babel plugin
- **[Vite](https://vite.dev)** 8 — build tool and dev server
- **[react-router](https://reactrouter.com)** v7 — declarative, data-router routing
- **[Zustand](https://zustand-demo.pmnd.rs)** — state management (auth, AI assistant chat state)
- **[Axios](https://axios-http.com)** — HTTP client, with an interceptor handling JWT attachment and single-flight refresh-token rotation
- **[Radix UI](https://www.radix-ui.com)** + **[Tailwind CSS](https://tailwindcss.com)** v4 — unstyled accessible primitives, styled with a CSS-first design-token theme
- **[React Hook Form](https://react-hook-form.com)** — forms
- **[i18next](https://www.i18next.com)** / **react-i18next** — Arabic/English i18n with automatic locale detection
- **[react-markdown](https://github.com/remarkjs/react-markdown)** + `remark-gfm`/`remark-math` + `rehype-katex`/`rehype-sanitize` — safe Markdown and LaTeX rendering for AI assistant responses
- **[Framer Motion](https://www.framer.com/motion)** — animation

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) `20` (matches the version pinned in CI — see [`ci.yaml`](.github/workflows/ci.yaml))
- A running instance of [WakeelAI-Backend](https://github.com/WakeelAI-Project/WakeelAI-Backend) (or use the hosted default — see [Configuration](#configuration))

### Installation

```bash
git clone https://github.com/WakeelAI-Project/WakeelAI-Frontend.git
cd WakeelAI-Frontend
npm install
npm run dev
```

## Configuration

The backend API base URL is read from environment variables at build/dev time — see [`.env.example`](.env.example):

```bash
# Backend origin, no trailing slash, no /api suffix
VITE_API_BASE_URL=http://localhost:5032

# Optional: full API URL override (defaults to `${VITE_API_BASE_URL}/api`)
# VITE_API_URL=http://localhost:5032/api
```

See [`src/lib/config.js`](src/lib/config.js) for how these are read and derived.

## Testing

```bash
npm run lint
npm test
```

`npm test` runs [Vitest](https://vitest.dev) with `jsdom` and Testing Library. Both commands run in CI on every push and pull request to `develop` (see [`ci.yaml`](.github/workflows/ci.yaml)), alongside a production build check.

## Localization

Arabic and English strings live in [`src/i18n/locales/en.json`](src/i18n/locales/en.json) and [`src/i18n/locales/ar.json`](src/i18n/locales/ar.json), loaded through [`src/i18n/index.js`](src/i18n/index.js). Language is auto-detected (`localStorage`, then browser), and the document's `dir`/`lang` attributes are kept in sync automatically so layouts mirror correctly under RTL — a manual layout toggle is also available in the topbar.

## Project Structure

The app follows a feature-first structure alongside a shared component library:

```
src/
├── components/       # Shared UI: design-system primitives (ui/), app shell (layout/), landing page
│                      #   sections, overlays, data display, navigation, animation primitives
├── context/           # App-wide context (active company, notifications)
├── features/           # Feature-first domain modules (data/service/store per feature)
│   ├── auth/            # Login, route guards, auth store
│   ├── company/           # Employees, departments, leave, documents, templates, audit,
│   │                       #   dashboard, and the AI assistant chat UI
│   └── profile/            # Current-user profile
├── hooks/             # Locale/direction hooks
├── i18n/               # i18next config + Arabic/English locale files
├── lib/                 # Axios client, env config, cookie/text-direction helpers
├── pages/                 # Route-level page components
└── utils/                   # Small shared helpers
```

## CI/CD & Deployment

- **[`ci.yaml`](.github/workflows/ci.yaml)** — on every push and pull request to `develop`: installs dependencies, lints, builds, and runs the test suite.
- **Deployment** is handled by [Vercel](https://vercel.com)'s Git integration (not a GitHub Actions workflow) — every push auto-deploys, with [`vercel.json`](vercel.json) providing the SPA rewrite that client-side routing needs.
  - Production: [wakeel-ai-frontend.vercel.app](https://wakeel-ai-frontend.vercel.app)
  - `VITE_API_BASE_URL` is set to the hosted backend's origin via Vercel's project environment variables.

## Contributing

Branch off `develop` (not `main`) and name branches by what they do: `feature/<name>` for new functionality, `fix/<name>` for bug fixes, `docs/<name>` for documentation, `chore/<name>` for maintenance. Open a PR into `develop`; `main` is only updated by merging a ready `develop` for release.

## Team

Built by the Wakeel AI graduation team as an ITI AI Capstone project:

- [Assem Mohamed](https://github.com/Assem-Mohamed)
- [Ahmed Alaa](https://github.com/ahmedalaa417)
- [Hosam Abdullah](https://github.com/Hosam-Abdullah)
- [Mohanad Tarek](https://github.com/HONDA-74)
