# Student REST API Lab (Q1 + Q2)

A small full-stack application demonstrating a REST API with **GET** and **POST** methods. It uses Node.js built-in HTTP module, a responsive HTML/CSS/JavaScript frontend, and a local JSON file as the data store. No MongoDB account or internet database is required.

## Requirements
- Node.js 18 or later
- npm (included with Node.js)

## Run on Windows
1. Extract the ZIP file.
2. Open the extracted `student-rest-api` folder in VS Code.
3. Open Terminal in that folder.
4. Run `npm install`.
5. Run `npm start` (no external npm packages are needed).
6. Open `http://localhost:3000` in your browser.

## API endpoints
| Method | Endpoint | Purpose | Success response |
|---|---|---|---|
| GET | `/api/students` | Retrieve all students | `200 OK` |
| POST | `/api/students` | Register a student using JSON | `201 Created` |

### POST JSON example
```json
{
  "name": "Ananya Rao",
  "email": "ananya.rao@example.com",
  "course": "Data Science",
  "year": 2
}
```

## HTTP status codes handled
- `200 OK`: GET request completed successfully.
- `201 Created`: a student was registered successfully.
- `400 Bad Request`: missing/invalid fields or invalid email/year.
- `404 Not Found`: unknown API endpoint.
- `409 Conflict`: email is already registered.
- `500 Internal Server Error`: server/data-store error.

## Files
- `server.js` — Node.js HTTP server and REST API routes.
- `public/index.html` — application layout.
- `public/styles.css` — styling and responsive layout.
- `public/app.js` — GET/POST requests, table rendering, and response messages.
- `data/students.json` — sample records and local persistent data.
- `report/Student_REST_API_Lab_Report.pdf` — report with explanation, code, and screenshots.
- `screenshots/` — screenshots captured from the running application.

## Notes
This is a lab demonstration. Data is stored locally in `data/students.json`, not in MongoDB. Newly registered students persist across server restarts. Do not use this simple file store for a multi-user production application.
