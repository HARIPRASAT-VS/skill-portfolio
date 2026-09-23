# SkillFolio

A student skill portfolio platform utilizing the MERN stack (MongoDB, Express, React, Node.js).

## Simple Startup Instructions

To run the application locally, you'll need two terminal windows.

### Terminal 1 (Backend Server)
```bash
cd server
npm install
npm run seed
npm run dev
```
The backend API will be available at: `http://localhost:5000`

### Terminal 2 (Frontend Client)
```bash
cd client
npm install
npm run dev
```
The frontend UI will be available at: `http://localhost:5173`

*(Note: Ensure you have added your MongoDB Atlas `MONGO_URI` to `server/.env` before running the seed script.)*