QUBOt
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
```
├─ docker-compose.yml  
   # Defines services: Redis, Backend (FastAPI), Celery Worker, Frontend

├─ src/
│  ├─ backend/
│  │  ├─ main.py  
│  │     # FastAPI entrypoint
│  │  ├─ tasks.py  
│  │     # Celery tasks for optimization
│  │  ├─ celery_app.py  
│  │     # Celery app instantiation
│  │  ├─ routes/
│  │  │  └─ upload.py  
│  │        # File upload & WebSocket routes
│  │  ├─ utils/  
│  │     # Quantum logic & optimization utility code
│  │  └─ requirements.txt  
│  │     # Python dependencies

│  └─ frontend/
│     ├─ App.tsx  
│     │  # React application entry
│     ├─ pages/  
│     │  # Main pages: Solvers, Datasets, Playground, etc.
│     ├─ components/  
│     │  # Shared UI & form components
│     ├─ vite.config.ts  
│     │  # Vite config
│     └─ package.json  
│        # Frontend dependencies

└─ README.md  
```


--------------------------------------------------------------------------------

## Features

1. **Upload & Edit**  
   - Upload `.npy` QUBO matrix files as datasets.
   - Upload `.py` solver files as optimization algorithms.

2. **Optimization Progress**  
   - Real-time updates over WebSocket (FastAPI + Redis).
   - Graphical progress charts with `recharts`.

3. **Run the optimization**  
   - Celery tasks used to isolate the optimization task to run in different processes in order to not interfere with the rest of the page.

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

### 2. Docker Usage
A docker-compose.yml is provided to orchestrate all services (Backend, Frontend, Redis, Celery) in containers:

- Install Docker Desktop if not already installed. Before starting with commands, make sure you have the Docker Desktop up and running.
- Clone this repository:
```bash
git clone https://github.com/leonidas1312/qubot
```
- Move to root directory:
```bash
cd qubot
```
- Build and start:
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




