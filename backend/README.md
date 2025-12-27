# GearGuard Backend

## Setup Instructions

1.  **Environment Setup**:
    *   Navigate to `backend/`.
    *   Create a `.env` file from `env.example`:
        ```bash
        cp env.example .env
        ```
    *   Edit `.env` and add your MySQL database credentials (DB_NAME, DB_USER, DB_PASSWORD, etc.).
    *   Ensure MySQL is running and the database `gearguard` exists.

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run Migrations**:
    ```bash
    python manage.py makemigrations apps.authx apps.teams apps.equipment apps.maintenance
    python manage.py migrate
    ```

4.  **Create Superuser** (Admin):
    ```bash
    python manage.py createsuperuser
    ```

5.  **Run Server**:
    ```bash
    python manage.py runserver
    ```

## API Documentation

### Authentication
*   `POST /auth/register/` - Register new user.
*   `POST /auth/login/` - Login (Returns JWT).
*   `GET /auth/me/` - Get current user profile.
*   `POST /auth/logout/` - Logout (Blacklist token).

### Maintenance Teams
*   `GET /teams/` - List teams.
*   `POST /teams/` - Create team (Admin/Manager).

### Equipment
*   `GET /equipment/` - List equipment (with `open_request_count`).
*   `POST /equipment/` - Add equipment.
*   `GET /equipment/{id}/maintenance-requests/` - History.

### Maintenance Requests
*   `GET /maintenance/` - List all requests.
*   `POST /maintenance/` - Create request (Auto-fills team/tech).
*   `GET /maintenance/kanban/` - Kanban board view.
*   `GET /maintenance/calendar/` - Calendar view (Preventive).

## Project Structure
*   `apps/authx`: Custom User model & Auth.
*   `apps/teams`: Maintenance Teams.
*   `apps/equipment`: Asset Management.
*   `apps/maintenance`: Requests, Kanban, Signals.
