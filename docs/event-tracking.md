# Event Tracking

Event tracking is achieved by listening to user interactions on the client side.

- **Types of Events:** Clicks, form interactions, back navigations, quantity changes, and heartbeats.
- **Heartbeats:** Periodic pings are sent to the backend to keep sessions alive.
- **Payload:** Each event includes an `event_id`, `session_id`, `user_id`, `timestamp`, `event_type`, and `page`.
- **Deduplication:** The backend checks the `event_id` against stored events to ensure idempotency.
