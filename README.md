# Database ERD Visualizer

A web app to generate interactive ERDs from your database schema metadata. Supports multiple databases (PostgreSQL, MySQL, etc.).

## Project Structure

- `frontend/` — React app (JS) with React Flow for ERD visualization
- `backend/` — Node.js/Express API (MVC pattern)

## Getting Started

### Backend
```
cd backend
npm install
node src/app.js
```

### Frontend
```
cd frontend
npm install
npm start
```

---

1. Select your database type in the UI
2. Run the provided SQL script in your DB console
3. Upload the output file
4. View your interactive ERD!
