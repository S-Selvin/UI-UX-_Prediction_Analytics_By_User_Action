# System Architecture

ShopSense is built on a simple three-tier architecture:

1. **Frontend (Analyzed Site):** A React application that embeds the ShopSense tracking script. It captures DOM events and sends them to the backend.
2. **Backend API:** A Node.js Express server that processes incoming events, updates session state, and calculates rule-based UX friction scores. It stores data locally in JSON files.
3. **Admin Dashboard:** A React application that queries the backend to display real-time session tracking, trends, and UX insights.

Data flows linearly from user interactions on the Frontend to the Backend for processing, and is retrieved by the Admin Dashboard for visualization.
