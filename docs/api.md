# API Reference

The ShopSense backend exposes several REST API endpoints for event ingestion and analytics.

## Ingestion API

### POST `/api/events`
Ingests a single event from a client session.
- **Body:**
  ```json
  {
    "event_id": "string",
    "user_id": "string",
    "session_id": "string",
    "timestamp": "ISO-8601",
    "event_type": "string",
    "website_id": "string",
    "page": "string"
  }
  ```
- **Returns:** `{ "success": true, "event_id": "...", "duplicate": boolean }`

## Analytics API

### GET `/api/analytics/overview`
Retrieves general session metrics.
- **Returns:** `{ "success": true, "total_sessions": 10, ... }`

### GET `/api/analytics/ux-health`
Retrieves calculated UX health based on session events.
- **Returns:** `{ "success": true, "frictionLevel": "LOW|MEDIUM|HIGH", "frictionScore": 15, ... }`
