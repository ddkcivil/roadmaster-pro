# Vue.js Migration Plan

This document outlines the high-level steps required to migrate the RoadMaster Pro frontend from React to Vue.js, incorporating an admin template.

## Current React App Status (Completed Features)

The RoadMaster Pro app is currently built with React and includes the following working features:

- [x] User authentication with login/logout and role-based access (Project Manager, Site Engineer, Supervisor, Lab Technician)
- [x] Project management: create, edit, delete, and select projects
- [x] Dashboard module with overview
- [x] BOQ (Bill of Quantities) and billing management
- [x] RFI (Request for Information) management
- [x] Laboratory and quality control module
- [x] Resource management for vehicles and inventory
- [x] Correspondence and document management with PDF text extraction
- [x] Schedule and planning module
- [x] Daily work reports
- [x] AI assistant chat modal
- [x] Dark mode theme toggle
- [x] Mobile-responsive design
- [x] Local data persistence with JSON storage
- [x] Capacitor integration for file system operations

### Recent Updates (Completed)
- [x] Fixed syntax errors in modal JSX structure
- [x] Added login management with full-page authentication
- [x] Implemented mock PDF text extraction for correspondence
- [x] Enhanced UI with modern design patterns
- [x] Added user role persistence and session management

## Phase 1: Project Setup and Template Integration

- [x] Initialize a new Vue.js project (e.g., using Vite + Vue).
- [x] Install necessary dependencies for Quasar admin framework.
- [x] Integrate Quasar admin framework into the new Vue.js project, ensuring basic layout and styling are functional.
- [x] Fix Tailwind CSS PostCSS configuration for v4 compatibility.

## Phase 2: Core Functionality Migration (Authentication)

- [x] Migrate `LoginPage.tsx` to `LoginPage.vue`.
  - [x] Re-implement form handling, input states, and basic validation in Vue.js.
  - [x] Adapt authentication logic (`handleLogin`) to Vue.js methods and state management.
- [x] Migrate `RegisterPage.tsx` to `RegisterPage.vue`.
  - [x] Re-implement form handling, input states, and basic validation in Vue.js.
  - [x] Adapt registration logic (`handleRegister`) to Vue.js methods and state management.
- [x] Update application-level authentication state management in Vue.js (e.g., using Pinia or Vuex).
- [x] Implement navigation between Login and Register pages within Vue Router (if implemented).

## Phase 3: Data Services and Persistence

- [x] Adapt `services/dataService.ts` for use within the Vue.js project.
  - [x] Ensure compatibility with Capacitor Filesystem API in a Vue.js context.
  - [x] Re-test loading and saving of `projects.json`.
- [x] Adapt `services/fileService.ts` for use within the Vue.js project.
  - [x] Ensure compatibility with Capacitor Filesystem API for file storage, loading, and deletion.
  - [x] Re-test file operations.

## Phase 4: Component Migration (Main Application Modules)

- [x] Migrate `App.tsx`'s core logic and layout to `App.vue` (or a main layout component).
  - [x] Re-implement sidebar navigation, theme toggling, and AI modal integration.
  - [x] Adapt project selection and global state handling.
- [x] Migrate `ProjectsList.tsx` to `ProjectsList.vue`.
  - [x] Re-implement project display, search, and action buttons.
  - [x] Adapt project selection, editing, adding, and deletion logic.
- [x] Migrate `Dashboard.tsx` to `Dashboard.vue`.
- [x] Migrate `BOQManager.tsx` to `BOQManager.vue`.
- [x] Migrate `RFIModule.tsx` to `RFIModule.vue`.
- [x] Migrate `LabModule.tsx` to `LabModule.vue`.
- [x] Migrate `ResourceManager.tsx` to `ResourceManager.vue`.
- [x] Migrate `CorrespondenceManager.tsx` to `CorrespondenceManager.vue`.
  - [x] Re-implement document upload, viewing, and deletion logic using the adapted `fileService`.
- [x] Migrate `ScheduleModule.tsx` to `ScheduleModule.vue`.
- [x] Migrate `DailyReportModule.tsx` to `DailyReportModule.vue`.
- [x] Migrate `AIChatModal.tsx` to `AIChatModal.vue`.
- [x] Migrate `ThemeToggle.tsx` to `ThemeToggle.vue`.

## Phase 5: Styling and Responsiveness

- [x] Re-apply or adapt existing Tailwind CSS classes and custom styles within Vue.js components.
- [x] Ensure responsiveness across different screen sizes.

## Phase 6: Testing and Refinement

- [x] Thoroughly test all migrated functionalities (login, registration, CRUD operations for projects, documents, etc.).
- [x] Perform end-to-end testing of the application.
- [x] Optimize performance and address any UI/UX inconsistencies.

## Considerations:

-   **State Management:** Decide on a global state management solution for Vue.js (Pinia is recommended for new Vue 3 projects, or Vuex).
-   **Routing:** Integrate Vue Router for navigation between views.
-   **Capacitor Integration:** Ensure that Capacitor continues to function correctly with the Vue.js frontend, especially for filesystem operations.
-   **TypeScript:** Maintain TypeScript usage for type safety throughout the Vue.js project.
