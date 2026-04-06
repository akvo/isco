# Low-Level Design (LLD)

## System Summary

The ISCO platform is a full-stack data collection and survey administration system. It allows organizations to manage dynamic questionnaires (forms, question groups, questions, cascades, options) and tracks user submissions and data across different organizational types (ISCO Types, Member Types).

**Primary Tech Stack**:
- **Frontend**: React 17 SPA, React Router, Pullstate (state management), Ant Design (UI), Axios, SCSS, Webpack (react-scripts).
- **Backend**: Python FastAPI, SQLAlchemy ORM, Pydantic, Uvicorn, PostgreSQL (relational database), Alembic (migrations).
- **Infrastructure**: Docker & Docker Compose (containerization), GCR (Google Container Registry) for images, Semaphore CI for CI/CD pipelines.

## Module Decomposition

### Backend (`/backend`)
The backend is a FastAPI application exposing RESTful JSON endpoints.
- **`core/`**: Core environment configuration, logging, and application bootstrapping (`config.py`).
- **`db/`**: Database connection management, CRUD operations (e.g. `crud_user.py`), and Alembic migrations.
- **`models/`**: SQLAlchemy declarative base models mapping directly to the PostgreSQL database schema (e.g., `user.py`, `form.py`, `data.py`).
- **`routes/`**: FastAPI API routers (controllers) that handle incoming HTTP requests and map them to CRUD operations and business logic (e.g., `user.py`, `survey.py`).
- **`middleware.py`**: Interceptors and dependency injectors, notably handling JWT parsing, Token verification, and Role-Based Access Control (RBAC).

### Frontend (`/frontend`)
The frontend is built with React and organized by features and functional components.
- **`src/pages/`**: Top-level route components representing views (e.g., `SurveyEditor`, `ManageUser`, `DataCleaning`).
- **`src/components/`**: Reusable generic layout or UI components (e.g., Modals, Layouts).
- **`src/lib/`**: Centralized logic such as generic HTTP instances (`api`), and global state `store` built with Pullstate.
- **`src/App.js`**: Main entry point that sets up standard react-router routes and a `<Secure />` wrapper protecting specific paths depending on `user.role`.

## Data Architecture

The data architecture is heavily relational. Key entities:
- **Users & Organizations**:
  - `User`: Central entity with attributes like `role` (secretariat_admin, member_admin, member_user). Linked to `Organisation`.
  - `Organisation`: Tracks `OrganisationIsco` and `OrganisationMember` traits.
- **Survey & Forms Design**:
  - `Form` > `Question_Group` > `Question` > `Option` / `Cascade`.
  - Controls repeat logic and access logic specific to `isco_type` and `member_type`.
- **Answers**:
  - Submissions are logged as `Data` and the individual values as `Answer` items.

*Note: Database schema is maintained using SQLAlchemy abstractions and orchestrated through Alembic versions.*

## Integration Points

- **Database**: PostgreSQL database instance interacting strictly through SQLAlchemy.
- **Authentication**: Custom implemented stateless JWT authentication.
- **Proxy**: During development, the frontend proxy redirects `/api/*` to the FastAPI server at configured port (usually `5000`). In production, this is orchestrated via standard `nginx` configurations.
- **External Email Notifications**: Configured to route via Mailjet (`mailjet-rest`) for notifications (implied by backend `requirements.txt`).

## Security & Safety

- **Authentication**: Stateless, JWT (JSON Web Tokens). Handled via `OAuth2PasswordBearer`. Tokens are issued separately for short-term access and refresh capability (`ACCESS_TOKEN_EXPIRE_DAYS`, `REFRESH_TOKEN_EXPIRE_DAYS`).
- **Client Side Safety**: Tokens are pushed through cookies, and HTTP calls attach it implicitly. If HTTP `401` or `403` are encountered, the global Axios interceptor (`lib/api`) or the React `App.js` handles forced logouts and session destructions.
- **Authorization (RBAC)**: Handled backend-side via FastAPI Depends injection in `middleware.py`:
  - `verify_user`: Validates email and verifies approval.
  - `verify_admin`: Validates role is `secretariat_admin` or `member_admin`.
  - `verify_super_admin`: Validates role is strictly `secretariat_admin`.
- **Passwords**: Hashed automatically using `passlib(bcrypt)`. Never stored in plaintext. No plain secrets are committed to Git. All credentials and keys (like `SECRET_KEY`) inject via `.env` files.
