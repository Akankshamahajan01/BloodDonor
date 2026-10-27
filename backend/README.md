# BloodConnect Backend API

Node.js + Express + MongoDB backend following **MVC Architecture**.

---

## Project Structure

```
backend/
├── controllers/
│   ├── authController.js       ← Register, Login, Get Me
│   ├── donorController.js      ← Donor CRUD + Search + Stats
│   └── requestController.js   ← Blood Requests + Matching
├── middleware/
│   ├── protect.js              ← JWT authentication guard
│   └── errorHandler.js        ← Global error handler
├── models/
│   ├── User.js                 ← User schema (bcrypt hashing)
│   ├── Donor.js                ← Donor schema (eligibility logic)
│   └── BloodRequest.js        ← Blood request schema
├── routes/
│   ├── authRoutes.js
│   ├── donorRoutes.js
│   └── requestRoutes.js
├── .env                        ← Environment variables (not committed)
├── .env.example                ← Template for .env
├── server.js                   ← Entry point
└── package.json
```

---

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure `.env`
Copy `.env.example` to `.env` and fill in your values:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bloodconnect
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500
```

### 3. Run locally
```bash
npm start       # production
npm run dev     # development with nodemon
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET  | `/api/auth/me` | ✅ Bearer | Get current user profile |

### Donors — `/api/donors`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET  | `/api/donors` | No | Get all eligible donors |
| GET  | `/api/donors/search?bloodGroup=A%2B&location=Delhi` | No | Search donors |
| GET  | `/api/donors/stats` | No | Aggregate stats |
| GET  | `/api/donors/:id` | No | Get donor by ID |
| POST | `/api/donors/register` | ✅ Bearer | Register as donor |

### Blood Requests — `/api/requests`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST  | `/api/requests` | ✅ Bearer | Create request + get matches |
| GET   | `/api/requests` | ✅ Bearer | Get all requests |
| GET   | `/api/requests/:id` | ✅ Bearer | Get request + matches |
| PATCH | `/api/requests/:id/status` | ✅ Bearer | Update status |

---

## Postman / Thunder Client Testing

### Step 1 — Register
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Akanksha Mahajan",
  "email": "akanksha@example.com",
  "phone": "9876543210",
  "password": "Test@1234"
}
```

### Step 2 — Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "akanksha@example.com",
  "password": "Test@1234"
}
```
Copy the `token` from the response.

### Step 3 — Get Profile (Protected)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token>
```

### Step 4 — Register as Donor (Protected)
```
POST http://localhost:5000/api/donors/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Akanksha Mahajan",
  "age": 24,
  "bloodGroup": "B+",
  "phone": "9876543210",
  "email": "akanksha@example.com",
  "location": "Delhi",
  "lastDonationDate": "2025-01-15"
}
```

### Step 5 — Search Donors
```
GET http://localhost:5000/api/donors/search?bloodGroup=B%2B&location=Delhi
```

### Step 6 — Create Blood Request (Protected)
```
POST http://localhost:5000/api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientName": "Ramesh Kumar",
  "bloodGroup": "B+",
  "units": 2,
  "urgency": "urgent",
  "hospital": "AIIMS Delhi",
  "location": "Delhi"
}
```

---

## Deployment (Render)

1. Push the repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add all environment variables from `.env`
7. After deploy, copy the URL (e.g. `https://bloodconnect-api.onrender.com`)
8. Update `js/config.js` → `API_BASE_URL` with your deployed URL

---

## MVC Architecture

| Layer | Responsibility |
|-------|---------------|
| **Model** | Mongoose schemas with validation and business logic (eligibility, hashing) |
| **View** | Frontend HTML/JS (in `/pages` and `/js` folders) |
| **Controller** | Express route handler functions in `/controllers` |
| **Routes** | URL definitions that map to controller functions |
| **Middleware** | JWT auth guard and global error handler |
