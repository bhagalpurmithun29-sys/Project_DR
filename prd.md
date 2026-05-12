# Retinal AI Flutter App PRD

## 1. Document Summary

- Product: `Retinal AI`
- New deliverable: Flutter application for mobile-first access to the existing Retinal AI platform
- Existing system analyzed: React frontend + Node/Express backend + MongoDB + Python AI inference
- PRD version: `1.0`
- Date: `2026-05-10`

## 2. Background

Retinal AI is already a working multi-role diabetic retinopathy scanning platform. The current product supports:

- Patient registration, profile management, reports, analytics, appointments, and AI chat
- Doctor profile management, scan review, clinical follow-up, and appointments
- Diagnosis center workflows for patient intake, scan upload, and doctor referral
- Admin verification of doctors and diagnosis centers
- AI-powered retinal scan analysis and AI-generated report summaries

The current web app is built in React and talks to an Express API. The backend already exposes the main role-based APIs needed for a mobile app. The next step is to create a Flutter app that brings the platform to Android and iOS without rebuilding backend business logic from scratch.

## 3. Problem Statement

The current product is web-first. That limits adoption in real scanning workflows where:

- Patients primarily use mobile devices
- Doctors need quick access to alerts, reports, and appointments on the go
- Diagnosis centers may need lightweight mobile access for patient lookup and scan workflow coordination
- The product needs a stronger app presence for trust, retention, and distribution

## 4. Product Goal

Build a Flutter app that reuses the existing backend and delivers a secure, role-based mobile experience for patients, doctors, and diagnosis centers, while keeping admin-heavy verification workflows primarily on web in the first release.

## 5. Success Metrics

- 70%+ of patient logins happen from mobile within 90 days of launch
- 40%+ of appointment bookings come from the Flutter app within 90 days
- 50%+ of reviewed patient reports are opened on mobile within 30 days of notification
- Doctor notification open rate improves by 25%
- Patient weekly retention improves by 20%
- Crash-free sessions stay above 99.5%

## 6. Users and Roles

### 6.1 Patient

Primary needs:

- Sign up and log in securely
- Complete and update profile
- View scan history and bilateral reports
- Track risk trends and analytics
- Book and monitor appointments
- Chat with the diabetes-focused AI assistant
- Receive notifications when reports or appointments change

### 6.2 Doctor

Primary needs:

- Sign in after admin verification
- Manage profile and credentials
- View assigned or referred scans
- Review AI outputs and finalize reports
- Add prescription and clinical notes
- Manage appointment requests
- Receive clinical alerts

### 6.3 Diagnosis Center

Primary needs:

- Sign in after admin verification
- Manage center profile
- Add patients
- Upload scan records and refer cases
- Track center activity and report status

### 6.4 Admin

Primary needs:

- Verify or reject doctor and diagnosis center accounts
- Audit registration pipeline

Recommendation:

- Keep admin as web-only in Flutter v1
- Reassess admin mobile support in phase 2 after operational feedback

## 7. Product Scope

## 7.1 In Scope for Flutter v1

- Single Flutter app with role-based routing after login
- JWT authentication with persistent session
- Email/password login
- Google login if backend/mobile OAuth setup is completed
- Forgot password using security questions flow
- Patient dashboard
- Patient profile editing and photo upload
- Patient reports and report detail view
- Patient analytics and risk trend charts
- Patient appointment booking and tracking
- Patient AI assistant chat with chat history
- Doctor dashboard
- Doctor profile management
- Doctor scan queue and scan detail review
- Doctor appointment management
- Diagnosis center dashboard
- Diagnosis center profile management
- Patient registration from center account
- Scan upload, scan list, and doctor referral
- Notification center for all supported roles
- Basic localization support for English and Hindi
- Light/dark theme support if design system budget allows

## 7.2 Out of Scope for Flutter v1

- Rebuilding AI inference in Flutter
- Offline scan analysis
- Full admin console in mobile
- Push-to-PACS or hospital EMR integrations
- Advanced voice transcription if native speech support is not stable enough for release
- Replacing existing backend APIs

## 7.3 Phase 2 Candidates

- Admin mobile approval console
- Push notifications with FCM/APNs
- Voice chat input in AI assistant
- Teleconsultation or in-app calling
- Stronger appointment calendar sync
- Multi-center analytics exports
- Tablet-optimized doctor review workspace

## 8. Current System Analysis

The existing backend already supports most of the required mobile workflows.

### 8.1 Existing Backend Capabilities

- Authentication: register, login, Google login, profile fetch, password flows, account deletion
- Patients: get own profile, update profile, photo upload, list patients, create patient, get patient scans
- Doctors: create/update doctor profile, get profile, upload profile photo
- Diagnosis centers: get/update center profile, upload photo, list centers
- Scans: create, list, detail, update, analyze, generate report, refer, delete
- Appointments: create, patient list, doctor list, update status
- Chat: send message, fetch history, clear history
- Notifications: present in backend/frontend flow and should be reused by Flutter

### 8.2 Existing Product Behaviors to Preserve

- Role-based access: `patient`, `doctor`, `diagnosis_center`, `admin`
- Pending verification block for doctor and diagnosis center accounts
- DOB cannot be in the future
- Appointment booking allowed only from tomorrow onward
- One active appointment per doctor/patient pair
- Bilateral scan grouping logic
- Clinical scan lifecycle: `Pending` -> `Analyzed` -> `Reviewed`
- AI assistant restricted to diabetes-related queries
- Patient recovery through two security questions

### 8.3 Gaps for Mobile Delivery

- No Flutter client exists yet
- Web navigation and dense dashboards need mobile-native redesign
- Voice assistant UX is browser-oriented today
- Admin workflows are better suited to larger screens
- Notification UX should be upgraded to push in later phases

## 9. Product Strategy Recommendation

Build one Flutter app with multi-role support, but optimize the actual v1 experience in this order:

1. Patient experience as the highest-priority mobile journey
2. Doctor experience for alerts, appointments, and lightweight clinical review
3. Diagnosis center experience for profile, patient intake, and scan coordination
4. Admin remains on web for v1

This reduces risk and aligns with the strongest mobile use cases in the current platform.

## 10. User Experience Requirements

## 10.1 Patient App Modules

- Onboarding and authentication
- Home dashboard with latest report status, risk summary, and upcoming appointments
- My reports list with bilateral grouping
- Report detail page with scan images, AI result, findings, summary, prescription, and doctor status
- Analytics page with trends over time
- Appointments page with doctor selection, booking, and status tracking
- AI assistant chat page with persistent history
- Notification inbox
- Profile and settings

## 10.2 Doctor App Modules

- Login and verification status handling
- Dashboard with counts for pending review, high-risk cases, appointments, and notifications
- Scan queue list
- Scan detail with patient info, left/right images, AI output, findings, summary, prescription input, and send-to-patient action
- Appointment request management
- Doctor profile and credentials
- Notification inbox

## 10.3 Diagnosis Center App Modules

- Login and verification status handling
- Dashboard with total patients, scans, pending cases, and recent activity
- Patient list and add patient form
- Scan upload flow
- Scan list and status tracking
- Refer-to-doctor flow
- Center profile
- Notification inbox

## 10.4 Admin UX Recommendation

- Do not ship a full Flutter admin module in v1
- If needed, add only a simple read-only admin status page in phase 2

## 11. Functional Requirements

## 11.1 Authentication

- Users must be able to register and log in with email and password
- Users must remain logged in securely using stored auth tokens
- Users must be logged out automatically on invalid or expired token
- Doctor and diagnosis center users with `pending` or `rejected` verification must see clear status messaging
- Forgot password must support the current security-question-based flow

## 11.2 Profile Management

- Patients can edit name, age, phone, email, gender, DOB, and profile photo
- Doctors can edit specialization, license details, phone, country, experience, bio, degrees, DOB, and photo
- Diagnosis centers can edit center name, type, address, city, phone, email, license number, and photo

## 11.3 Scan Management

- Diagnosis centers can create scans and upload retinal images
- Doctors can view scans assigned to them or uploaded by themselves
- Doctors can view AI outputs and finalize reviews
- Flutter app should visually support bilateral scan pairing where applicable
- Scan detail should expose status, risk level, findings, summary, and timestamps

## 11.4 Reports

- Patients can view only finalized/relevant reports intended for them
- Doctor review detail must support prescription and clinical notes
- Report pages must support share/download planning, even if PDF export is delayed to phase 2

## 11.5 Appointments

- Patients can browse doctors and create appointments
- Patients can view appointment status changes
- Doctors can confirm, reject, or complete appointments

## 11.6 AI Assistant

- Patients can send diabetes-related questions
- Chat history must persist per user
- Clear-history action should be supported
- The app should clearly show that AI guidance does not replace a doctor

## 11.7 Notifications

- Users can view in-app notifications
- Users can mark notifications as read
- Important events include new appointment requests, report readiness, and status updates

## 12. Non-Functional Requirements

- Platform support: Android first, iOS supported in the same codebase
- Performance: key screens should load in under 2.5 seconds on normal mobile networks
- Security: JWT auth, secure token storage, HTTPS-only production traffic
- Reliability: graceful error states for API, DB, or AI failures
- Accessibility: readable contrast, scalable text, clear tap targets
- Localization: architecture must support English and Hindi
- Maintainability: clean architecture with feature modules and typed models

## 13. Flutter Technical Recommendation

## 13.1 App Architecture

Recommended:

- Flutter with Dart
- `go_router` for routing
- `dio` for API client
- `flutter_secure_storage` for tokens
- `riverpod` or `bloc` for state management
- `freezed` and `json_serializable` for models
- `fl_chart` for patient analytics
- `image_picker` for avatar and scan upload
- `firebase_messaging` later for push notifications

## 13.2 Suggested Flutter Folder Structure

```text
lib/
  app/
  core/
    api/
    config/
    storage/
    theme/
    utils/
  features/
    auth/
    patient/
    doctor/
    diagnosis_center/
    notifications/
    chat/
    appointments/
  shared/
    widgets/
    models/
```

## 13.3 Backend Reuse Plan

- Keep the current Node/Express backend as the main API layer
- Reuse the current MongoDB schemas and business rules
- Keep Python AI inference and LLM summary generation on the server
- Add only minimal API enhancements if Flutter uncovers response-shape inconsistencies

## 14. API Mapping for Flutter

Key backend routes already available:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/me`
- `PUT /api/auth/change-password`
- `PUT /api/auth/set-password`
- `POST /api/auth/security-questions`
- `POST /api/auth/verify-security-questions`
- `POST /api/auth/reset-password`
- `GET /api/patients/me`
- `PUT /api/patients/me/profile`
- `PUT /api/patients/me/photo`
- `GET /api/patients/:id/scans`
- `POST /api/patients`
- `GET /api/doctors/profile`
- `POST /api/doctors/profile`
- `GET /api/diagnosis-centers/me`
- `PUT /api/diagnosis-centers/me`
- `POST /api/scans`
- `GET /api/scans`
- `GET /api/scans/:id`
- `PUT /api/scans/:id`
- `POST /api/scans/:id/analyze`
- `POST /api/scans/:id/refer`
- `POST /api/appointments`
- `GET /api/appointments/patient/me`
- `GET /api/appointments/doctor/me`
- `PATCH /api/appointments/:id`
- `POST /api/chat/message`
- `GET /api/chat/history`
- `DELETE /api/chat/history`

## 15. Screen List

### Shared

- Splash
- Role-aware login
- Registration
- Forgot password
- Verification pending/rejected status
- Notification center
- Settings

### Patient

- Dashboard
- My reports
- Report detail
- Analytics
- Appointments
- Book appointment
- AI assistant chat
- Profile

### Doctor

- Dashboard
- Scan queue
- Scan detail/review
- Appointments
- Doctor profile

### Diagnosis Center

- Dashboard
- Patients
- Add patient
- Upload scan
- Scan list
- Center profile

## 16. Risks and Constraints

- AI scan upload and clinical review on small screens may need tablet-first refinements
- Current backend responses may not always be normalized for mobile-friendly models
- Google login for Flutter may need extra backend/mobile OAuth testing
- Push notifications are not fully productized yet
- Some current business logic is embedded in frontend grouping behavior and should be moved or duplicated carefully
- Medical workflows require careful wording, disclaimer handling, and error states

## 17. Milestones

### Phase 0: Planning and API validation

- Audit all existing APIs with sample payloads
- Freeze mobile v1 scope
- Define Flutter design system and navigation map

### Phase 1: Foundation

- Project setup
- Auth flow
- Secure token storage
- Shared network layer
- Shared models

### Phase 2: Patient MVP

- Dashboard
- Profile
- Reports
- Analytics
- Appointments
- AI assistant
- Notifications

### Phase 3: Doctor MVP

- Dashboard
- Scan queue
- Scan review detail
- Appointment actions
- Profile

### Phase 4: Diagnosis Center MVP

- Dashboard
- Add patient
- Upload scans
- Refer workflow
- Profile

### Phase 5: Hardening and launch

- QA
- API fixes
- performance tuning
- store build preparation

## 18. Acceptance Criteria for V1

- Patient can register, log in, edit profile, view reports, book appointments, and use AI chat
- Doctor can log in, view pending scans, review scans, update appointments, and manage profile
- Diagnosis center can log in, manage patients, upload scans, and refer to doctors
- Pending verification accounts are handled correctly
- Notifications are visible in-app
- The app works on Android and iOS with stable authenticated sessions

## 19. Final Recommendation

The best version of this project is not a full desktop workflow forced into a phone screen. The strongest Flutter v1 is a role-based mobile app centered on patients first, with practical doctor and diagnosis center tools, while leaving admin verification on web for now.

This approach gives the team a realistic path to launch faster, reuse the current backend heavily, and create a production-ready app without rewriting the platform.
