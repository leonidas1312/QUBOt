QUBOt README
============

Welcome to **QUBOt**! This repository aims to foster a community for optimization enthusiasts—developers, research scientists, operations researchers, and more. QUBOt organizes and provides:

- **Solvers (Optimization Algorithms):** Upload or explore algorithms (e.g., Python `.py` solver files).
- **Datasets:** Data files for optimization problems (currently `.npy` QUBO matrices).
- **Playground:** A platform to apply a chosen solver on a selected dataset interactively.
- **Community:** A forum-like environment for sharing results, discussing performance, and collaborating on optimization challenges.

--------------------------------------------------------------------------------

Table of Contents
-----------------
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Local Development](#local-development)
6. [Docker Usage](#docker-usage)
7. [Contributing](#contributing)
8. [License](#license)

--------------------------------------------------------------------------------

## Overview

QUBOt is a comprehensive platform for QUBO (Quadratic Unconstrained Binary Optimization) problems. Users can:
- **Upload** QUBO matrices (`.npy` files).
- **Develop or upload** solvers (Python `.py` scripts) for optimization.
- **Experiment** with various solver–dataset combinations in the Playground.
- **Engage** with the community by sharing results, best practices, or general discussion about the progress of algorithms on particular datasets.

--------------------------------------------------------------------------------

## Project Structure

Below is a brief outline of the repository:

Directory structure:
└── leonidas1312-qubo-solver-showcase/
    ├── bun.lockb
    ├── public/
    ├── package.json
    ├── README.md
    ├── docker-compose.yml
    ├── supabase/
    │   └── config.toml
    └── src/
        ├── backend/
        │   ├── main.py
        │   ├── __pycache__/
        │   ├── requirements.txt
        │   ├── routes/
        │   │   ├── __pycache__/
        │   │   └── upload.py
        │   ├── celery_app.py
        │   ├── tasks.py
        │   ├── backend_dockerfile
        │   └── utils/
        │       ├── QEAO.py
        │       ├── quantum_opt_cudaq.py
        │       └── __pycache__/
        ├── frontend/
        │   ├── main.tsx
        │   ├── index.html
        │   ├── App.tsx
        │   ├── eslint.config.js
        │   ├── vite.config.ts
        │   ├── index.css
        │   ├── components/
        │   │   ├── FileUpload.tsx
        │   │   ├── SubmissionForm.tsx
        │   │   ├── OptimizationResults.tsx
        │   │   ├── ResultsDisplay.tsx
        │   │   ├── AppSidebar.tsx
        │   │   ├── ui/
        │   │   │   ├── tooltip.tsx
        │   │   │   ├── toaster.tsx
        │   │   │   ├── input-otp.tsx
        │   │   │   ├── alert.tsx
        │   │   │   ├── sonner.tsx
        │   │   │   ├── input.tsx
        │   │   │   ├── accordion.tsx
        │   │   │   ├── toggle-group.tsx
        │   │   │   ├── table.tsx
        │   │   │   ├── switch.tsx
        │   │   │   ├── label.tsx
        │   │   │   ├── navigation-menu.tsx
        │   │   │   ├── dropdown-menu.tsx
        │   │   │   ├── toast.tsx
        │   │   │   ├── form.tsx
        │   │   │   ├── popover.tsx
        │   │   │   ├── chart.tsx
        │   │   │   ├── use-toast.ts
        │   │   │   ├── alert-dialog.tsx
        │   │   │   ├── skeleton.tsx
        │   │   │   ├── sidebar.tsx
        │   │   │   ├── radio-group.tsx
        │   │   │   ├── hover-card.tsx
        │   │   │   ├── breadcrumb.tsx
        │   │   │   ├── badge.tsx
        │   │   │   ├── collapsible.tsx
        │   │   │   ├── pagination.tsx
        │   │   │   ├── select.tsx
        │   │   │   ├── command.tsx
        │   │   │   ├── progress.tsx
        │   │   │   ├── button.tsx
        │   │   │   ├── checkbox.tsx
        │   │   │   ├── slider.tsx
        │   │   │   ├── context-menu.tsx
        │   │   │   ├── scroll-area.tsx
        │   │   │   ├── avatar.tsx
        │   │   │   ├── separator.tsx
        │   │   │   ├── textarea.tsx
        │   │   │   ├── toggle.tsx
        │   │   │   ├── sheet.tsx
        │   │   │   ├── dialog.tsx
        │   │   │   ├── card.tsx
        │   │   │   ├── resizable.tsx
        │   │   │   ├── menubar.tsx
        │   │   │   ├── tabs.tsx
        │   │   │   ├── carousel.tsx
        │   │   │   ├── calendar.tsx
        │   │   │   ├── drawer.tsx
        │   │   │   └── aspect-ratio.tsx
        │   │   └── uploads/
        │   │       ├── AlgorithmParametersForm.tsx
        │   │       ├── FileUploadForm.tsx
        │   │       ├── DatasetUpload.tsx
        │   │       └── SolverUpload.tsx
        │   ├── postcss.config.js
        │   ├── tsconfig.node.json
        │   ├── lib/
        │   │   └── utils.ts
        │   ├── tsconfig.app.json
        │   ├── package.json
        │   ├── hooks/
        │   │   ├── use-mobile.tsx
        │   │   └── use-toast.ts
        │   ├── pages/
        │   │   ├── Solvers.tsx
        │   │   ├── Community.tsx
        │   │   ├── Playground.tsx
        │   │   ├── Index.tsx
        │   │   ├── Datasets.tsx
        │   │   └── Login.tsx
        │   ├── components.json
        │   ├── contexts/
        │   │   └── ResultsContext.tsx
        │   ├── tailwind.config.ts
        │   ├── integrations/
        │   │   └── supabase/
        │   │       ├── types.ts
        │   │       └── client.ts
        │   ├── App.css
        │   ├── tsconfig.json
        │   ├── package-lock.json
        │   ├── frontend_dockerfile
        │   ├── vite-env.d.ts
        │   └── supabase/
        │       └── config.toml
        └── integrations/
            └── supabase/
                ├── types.ts
                └── client.ts




--------------------------------------------------------------------------------

## Features

1. **Upload & Edit**  
   - Upload `.npy` QUBO matrix files as datasets.
   - Upload `.py` solver files as optimization algorithms.

2. **Optimization Progress**  
   - Real-time updates over WebSocket (FastAPI + Redis).
   - Graphical progress charts with `recharts`.

3. **Quantum + RL**  
   - Celery tasks implementing a quantum-inspired RL solver (using PennyLane, PyTorch, etc.).

4. **Community Forum**  
   - Share your results, experiences, tips, or start discussions on best solver–dataset combos.

5. **Playground**  
   - Use any solver on any dataset.
   - Visualize iteration-by-iteration progress.

--------------------------------------------------------------------------------

## Tech Stack

- **Backend:**
  - [FastAPI](https://fastapi.tiangolo.com/) (Python)
  - [Celery](https://docs.celeryproject.org/en/stable/) + [Redis](https://redis.io/)
  - [NumPy](https://numpy.org/), [PennyLane](https://pennylane.ai/), [PyTorch](https://pytorch.org/)

- **Frontend:**
  - [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
  - [ShadCN UI](https://ui.shadcn.com/) + [TailwindCSS](https://tailwindcss.com/)
  - [Recharts](https://recharts.org/)

- **Infrastructure/Deployment:**
  - Docker / Docker Compose
  - Supabase (for data storage and authentication)

--------------------------------------------------------------------------------

## Local Development

### 1. Prerequisites
- [Node.js & npm](https://nodejs.org/en/) (recommended installation via [nvm](https://github.com/nvm-sh/nvm)).
- [Python 3.11](https://www.python.org/downloads/) or higher for the backend + `pip`.

### 2. Clone & Install
```bash
git clone <REPOSITORY_URL>
cd QUBOt
```
#### Backend:
```bash
cd src/backend
pip install -r requirements.txt
```
#### Frontend:
```bash
cd ../frontend
npm install
npm run dev
```
### 3. Running locally
- Backend runs on http://127.0.0.1:8000
- Frontend runs on http://127.0.0.1:8080

Check your browser at http://127.0.0.1:8080. If you modify Python or React files, auto-reloads will reflect changes.

## Docker Usage
A docker-compose.yml is provided to orchestrate all services (Backend, Frontend, Redis, Celery) in containers:

1. Install Docker and Docker Compose if not already installed.
2. Clone this repository:
```bash
git clone <REPOSITORY_URL>
cd QUBOt
```
3. Build and start:
```bash
docker-compose up --build
```

# Services:

- Redis: Exposes port 6379.
- Backend (FastAPI): Exposes port 8000.
- Celery Worker: Consumes tasks from Redis.
- Frontend (React): Exposes port 8080.
  
Once containers are running, visit http://localhost:8080 to access the application.

Note: If you prefer detached mode, use docker-compose up -d --build.




