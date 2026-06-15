# Project and Task Management Platform

A full-stack web application designed to manage projects and correlative tasks.

## Technologies

### Backend
* Java
* Spring Boot
* Spring Security & JWT (JSON Web Tokens)
* Spring Data JPA
* Maven

### Frontend
* Angular 17+ (Standalone Components)
* Angular Material
* Signals & RxJS
* jwt-decode

## Architecture Overview

The frontend follows a structural approach divided into three main directories to ensure scalability:
* **Core:** Contains singletons, global layout components (like the Navbar), HTTP interceptors, and authentication guards.
* **Features:** Contains the isolated business logic modules (Projects, Tasks, Auth).
* **Shared:** Contains reusable UI components and formatting pipes.

## Application Routes

### Frontend Routes (Angular)

| Route | Access | Description |
| :--- | :--- | :--- |
| `/auth/login` | Public | User authentication form. The global Navbar is hidden on this route. |
| `/projects` | Protected | Main dashboard displaying the list of projects with client-side filtering. |
| `/projects/:id` | Protected | Detailed view of a specific project and its associated tasks. |

### Backend Endpoints (Spring Boot)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticates a user and returns a signed JWT containing custom claims. |
| `GET` | `/api/v1/projects` | Retrieves a list of projects for the authenticated user. |
| `POST` | `/api/v1/projects` | Creates a new project in the database. |
| `GET` | `/api/v1/tasks` | Retrieves tasks associated with a specific project ID. |
| `POST` | `/api/v1/tasks` | Creates a new task. Returns a 400/409 error if the parent project is closed. |
