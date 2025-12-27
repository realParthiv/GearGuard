# GearGuard Backend

This is the central API for the GearGuard platform, built with **Django REST Framework** and **MySQL**.

## 🚀 Quick Start

1.  **Environment Setup**:
    *   Create a `.env` file from `env.example`.
    *   Configure your MySQL credentials.
    *   Ensure a database exists (e.g., `gearguard`).

2.  **Initialize Database**:
    ```bash
    pip install -r requirements.txt
    python manage.py migrate
    python seed_all.py
    ```

3.  **Run Server**:
    ```bash
    python manage.py runserver
    ```

## 🛠️ Automation Scripts

We've provided powerful scripts to manage your development environment:

- **`wipe_db.py`**: Completely clears the database and resets all Primary Key IDs back to 1.
- **`seed_all.py`**: Populates the database with a high-quality multi-company dataset (Adani Ports & GearGuard Corp).
- **`manage.py migrate`**: Standard Django command to create/update tables.

## 🎭 API Suite Overview

### Auth & Employees
- `POST /auth/register/`: Register a new Company + Owner.
- `POST /auth/login/`: Role-aware login (Returns User object + JWT).
- `/auth/managers/`: CRUD for Manager accounts (Owner only).
- `/auth/employees/`: CRUD for Technicians and standard Users.

### Maintenance & Equipment
- `/equipment/`: Machinery management with open task counters.
- `/maintenance/`: Primary ticket lifecycle (Kanban, Calendar, Assignments).
- `/maintenance/stats/`: Dashboard analytics.

---
For detailed cURL examples and payloads, refer to the **[API Blueprint](file:///C:/Users/PARTHIV/.gemini/antigravity/brain/4979fc70-8b6e-4418-b02c-f542b57c4e04/roles_and_flows.md)**.
