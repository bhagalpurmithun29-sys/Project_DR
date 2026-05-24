# Retinal AI

Retinal AI is a full-stack diabetic retinopathy screening and care-coordination platform. It combines a React web app, an Express/MongoDB API, Cloudinary image uploads, Python-based retinal scan inference, and Groq-powered clinical text generation for patients, clinicians, diagnosis centers, and administrators.

The project is designed around the scan workflow: register a patient, upload retinal images, analyze scans with the AI model, let a clinician review the result, and publish a patient-facing report with prescription notes and follow-up actions.

## Core Features

- Role-based authentication for patients, clinicians, diagnosis centers, technicians, and admins.
- Admin verification flow for doctor and diagnosis center accounts.
- Patient dashboard with profile completion, scan history, bilateral reports, analytics, appointments, notifications, and AI chat.
- Doctor dashboard with patient lists, scan review, AI analysis, clinical notes, prescriptions, appointment management, and profile setup.
- Diagnosis center dashboard with patient intake, scan upload, bilateral scan grouping, referral workflow, center profile, and activity tracking.
- AI scan analysis through `backend/ai/resnet_predict.py` using the model files in `backend/ai/models/`.
- Groq Llama-powered clinical summaries and DiabetesAI chat.
- MongoDB persistence for users, patients, doctors, centers, scans, appointments, notifications, and chat history.
- Cloudinary-backed image uploads for profiles and retinal scans.
- English/Hindi-oriented localization support through i18next.
- Light/dark theme context and reusable protected route guards.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Tailwind CSS 4, Framer Motion |
| UI/Data | Lucide React, Recharts, jsPDF, i18next |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT, bcrypt, Google OAuth |
| Storage | Cloudinary, local static fallback for uploads |
| AI Vision | Python, PyTorch ResNet-50 model bridge |
| AI Text | Groq OpenAI-compatible chat completions, Llama 3.3 |
| Testing | Node test runner for backend utilities, ESLint for frontend |

## Project Structure

```text
Project_DR/
|-- backend/
|   |-- ai/
|   |   |-- models/
|   |   |   |-- best.pt
|   |   |   `-- resnet.pth
|   |   `-- resnet_predict.py
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- tests/
|   |-- utils/
|   |-- build.sh
|   |-- package.json
|   |-- requirements.txt
|   `-- server.js
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   |-- vercel.json
|   `-- vite.config.js
|-- package.json
`-- prd.md
```

## Prerequisites

- Node.js `20+`
- npm
- Python `3.9+`
- MongoDB Atlas or local MongoDB
- Cloudinary account
- Google OAuth client ID
- Groq API key

For AI scan analysis, keep the model files available at:

- `backend/ai/models/resnet.pth`
- `backend/ai/models/best.pt`

## Environment Variables

Create `backend/.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret

GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

The frontend automatically appends `/api` to `VITE_API_BASE_URL`, so both `http://localhost:5001` and `http://localhost:5001/api` are supported.

Do not commit `.env` files. They are ignored by `.gitignore`.

## Installation

Install the root dev dependency used to run both apps together:

```bash
npm install
```

Install backend dependencies:

```bash
npm install --prefix backend
```

Install frontend dependencies:

```bash
npm install --prefix frontend
```

Set up the Python AI environment:

```bash
cd backend
python3 -m venv ai/venv
source ai/venv/bin/activate
pip install -r requirements.txt torch torchvision pillow requests
cd ..
```

## Running Locally

Start the backend and frontend together:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`

You can also run them separately:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Runs backend and frontend concurrently. |
| `npm run build` | Installs backend/frontend dependencies and builds the frontend. |
| `npm start` | Starts `backend/server.js`. |
| `npm test --prefix backend` | Runs backend utility tests. |
| `npm run lint --prefix frontend` | Runs frontend ESLint. |
| `npm run build --prefix frontend` | Creates the Vite production build. |

## Main App Routes

| Route | Access |
| --- | --- |
| `/` | Landing page |
| `/login` | Login |
| `/register` | Registration |
| `/forgot-password` | Security-question password recovery |
| `/dashboard` | Patient dashboard |
| `/analytics` | Patient analytics |
| `/reports` | Patient scan history |
| `/report/:id` | Patient report detail |
| `/appointments` | Patient appointments |
| `/ai-assistant` | DiabetesAI assistant |
| `/doctor-dashboard` | Doctor dashboard |
| `/doctor-profile` | Doctor profile |
| `/doctor/scan-history` | Doctor scan review/history |
| `/doctor/appointments` | Doctor appointments |
| `/diagnosis-center/*` | Diagnosis center workspace |
| `/admin-dashboard` | Admin verification dashboard |

## API Overview

All protected routes require a JWT in the `Authorization: Bearer <token>` header.

| API Prefix | Purpose |
| --- | --- |
| `/api/auth` | Register, login, Google auth, current user, password/security-question flows, admin verification |
| `/api/patients` | Patient profile, patient creation, patient lists, patient photos, patient scans |
| `/api/doctors` | Doctor profile and photo management |
| `/api/diagnosis-centers` | Center profile, center photo, center listing |
| `/api/scans` | Scan creation, listing, detail, update, analysis, report generation, referral, deletion |
| `/api/appointments` | Appointment creation, listing, and status updates |
| `/api/notifications` | Notification listing, read state, deletion |
| `/api/chat` | DiabetesAI messages, chat history, chat clearing |

## AI Workflow

1. A doctor or diagnosis center creates a scan through `POST /api/scans`.
2. Uploaded scan images are stored through Cloudinary.
3. `POST /api/scans/:id/analyze` executes `backend/ai/resnet_predict.py`.
4. The Python bridge loads `backend/ai/models/resnet.pth`, predicts a DR class, and returns JSON.
5. The backend maps the prediction to a risk level and stores confidence, findings, and status on the scan.
6. `backend/services/aiService.js` calls Groq to generate a concise clinical summary.
7. A doctor reviews the scan, adds prescription details, and marks the report as ready for the patient.

The scan lifecycle is:

```text
Pending -> Analyzed -> Reviewed
```

## Deployment Notes

Frontend deployment:

- `frontend/vercel.json` rewrites all routes to `index.html` for SPA routing.
- Set `VITE_API_BASE_URL` to the deployed backend URL.
- Set `VITE_GOOGLE_CLIENT_ID` in the Vercel environment.

Backend deployment:

- Set all backend environment variables in the hosting provider.
- Use `npm run build` from the repo root when you want to install dependencies and build the frontend.
- Use `npm start` to run `backend/server.js`.
- In production, `backend/server.js` serves `frontend/dist` when `NODE_ENV=production`.
- Update `FRONTEND_URL` or `CORS_ORIGINS` to include the deployed frontend domain.

Before production, review the default admin seeding logic in `backend/controllers/authController.js` and replace any development credentials with your own secure onboarding process.

## Testing And Quality Checks

Run backend tests:

```bash
npm test --prefix backend
```

Run frontend lint:

```bash
npm run lint --prefix frontend
```

Run a production frontend build:

```bash
npm run build --prefix frontend
```

## Security And Medical Disclaimer

- Keep MongoDB, Cloudinary, Google, Groq, and JWT secrets out of source control.
- Patient images and clinical records should be treated as sensitive health data.
- Admin verification should be used before allowing clinical accounts to access protected workflows.
- Retinal AI is an AI-assisted screening and workflow tool. Final diagnosis, treatment, and prescriptions must be reviewed and approved by a qualified medical professional.

## License

ISC
