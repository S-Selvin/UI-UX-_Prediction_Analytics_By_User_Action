# ShopSense – Predictive UX Analytics

## Overview

ShopSense analyzes user interaction data to identify behavioral patterns, possible UX friction, and abandonment risk. 

ShopSense currently uses a deterministic rule-based analytics and prediction approach rather than Machine Learning.

## Problem Statement

Traditional website analytics provide raw metrics, but they may not clearly explain user behavior, UX friction or possible abandonment patterns. By the time a user abandons a cart or form, the opportunity to help them is gone. ShopSense attempts to convert interaction events into meaningful behavioral insights.

## Key Features

- User interaction tracking (clicks, scrolls, custom events)
- Session tracking and management
- Event collection
- Behavioral feature extraction
- Engagement analysis
- Navigation confusion detection
- UX problem detection
- Explanable risk reasons
- Recommendation engine
- Admin analytics dashboard
- Multi-website support

*(Note: ShopSense relies on deterministic logic to detect UX issues, not AI/ML models.)*

## System Architecture

```
User Website
↓
Event Tracking
↓
REST API
↓
Backend
↓
Data Storage
↓
Feature Extraction
↓
Rule-Based Prediction
↓
UX Analysis
↓
Recommendations
↓
Admin Dashboard
```

## Technical Stack

| Category | Technology |
|---|---|
| Frontend (Analyzed Site) | React, TypeScript, Vite, Tailwind CSS |
| Admin Dashboard | React, TypeScript, Vite, Tailwind CSS |
| Backend API | Node.js, Express.js, TypeScript |
| Storage | Server-side JSON persistence |
| Build Tool | Vite, tsc |

## How It Works

### 1. Event Tracking
ShopSense captures user actions (clicks, navigation, idle time, etc.) via an embedded SDK script and converts them into structured events.

### 2. Session Management
Events are tagged with a unique `session_id`, linking all actions of a user during an active session. Heartbeats and stale checks manage active/ended session statuses.

### 3. Data Processing
Raw events are validated and ingested via the backend REST API, ensuring duplicate events are ignored and related records (websites, users, sessions) are safely updated.

### 4. Feature Extraction
Events are grouped by session to calculate metrics such as interaction counts, form interactions, cart modifications, and back navigations.

### 5. Risk Calculation
A deterministic rule-based approach evaluates extracted features to calculate friction levels (LOW, MEDIUM, HIGH) without exposing sensitive implementation details.

### 6. UX Problem Detection
Behavioral patterns (like excessive back navigations or form friction) are matched against predefined thresholds to flag potential UX issues.

### 7. Recommendations
Based on detected UX issues, rule sets generate actionable suggestions for website owners (e.g., "Simplify checkout form").

### 8. Dashboard
An admin portal provides real-time visibility into KPIs, live sessions, event trends, and identified UX problem areas.

## Example Event

```json
{
  "event_id": "evt_123456",
  "userId": "U101",
  "sessionId": "S5001",
  "event_type": "checkout_form_interaction",
  "page": "/checkout",
  "timestamp": "2026-01-01T10:30:00Z"
}
```

## Installation

Ensure you have Node.js installed.

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ShopSense
   ```

2. **Backend Installation:**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Installation:**
   ```bash
   cd frontend
   npm install
   ```

4. **Admin Dashboard Installation:**
   ```bash
   cd admin
   npm install
   ```

5. **Environment Configuration:**
   Copy the example environment files (if applicable):
   ```bash
   cp backend/.env.example backend/.env
   # Update backend/.env variables as needed
   ```

## Development

Run the three services in separate terminals:

**1. Run Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**2. Run Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**3. Run Admin Dashboard:**
```bash
cd admin
npm run dev
# Runs on http://localhost:5174
```

## API

### `POST /api/events`
- **Purpose**: Ingests new interaction events from the tracked website.
- **Request Body**:
  ```json
  {
    "event_id": "unique-id",
    "user_id": "u-123",
    "session_id": "s-456",
    "timestamp": "2026-01-01T10:30:00Z",
    "event_type": "click",
    "website_id": "demo-site",
    "page": "/products"
  }
  ```
- **Response**: `{ "success": true, "event_id": "unique-id", "duplicate": false }`

### `GET /api/analytics/overview`
- **Purpose**: Retrieves high-level KPIs for the dashboard.
- **Response**: `{ "success": true, "total_sessions": 10, "active_sessions": 2, ... }`

## Project Structure

```text
ShopSense/
├── admin/          # Admin Dashboard (React/Vite)
├── backend/        # REST API Server & Logic (Node.js/Express)
│   ├── src/        # Server source code
│   └── data/       # JSON storage files
├── docs/           # Documentation
├── frontend/       # Demo Analyzed Website (React/Vite)
├── screenshots/    # Project screenshots
└── package.json    # Root project dependencies
```

## Screenshots

Screenshots of the application can be added to the `screenshots/` directory.

- `screenshots/01-homepage.png`
- `screenshots/02-admin-dashboard.png`

## Advantages

- Explainability (transparent rules)
- Simple architecture
- Low infrastructure cost
- Easy debugging
- Actionable UX insights

## Limitations

- Rule-based prediction (not machine learning)
- Depends on collected interaction data
- JSON storage limitations (not optimized for massive concurrency)
- Production scalability limitations

## Future Improvements

- PostgreSQL/MongoDB storage replacement
- Machine Learning models for advanced behavioral anomaly detection
- Real-time analytics optimization
- Advanced funnel analysis
- A/B testing
- Role-based authentication
- Cloud deployment

## License

MIT License (or your chosen open-source license).
