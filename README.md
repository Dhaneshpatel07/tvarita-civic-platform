# Tvarita Civic Issue System

Tvarita is a full-stack platform for reporting and managing local civic issues. It includes a React Native mobile app for citizens, a React-based admin dashboard, and a Node.js/Express backend.

## Technical Overview

### Mobile App (React Native)
- Location-aware reporting using `expo-location`.
- Image processing and Base64 encoding for reliable uploads.
- Real-time upvoting with proximity verification (100m).

### Backend (Node.js/Express)
- Modular MVC architecture.
- MongoDB with 2dsphere indexing for geospatial queries.
- Cloudinary integration for image hosting and automated cleanup.
- JWT-based authentication with Bcrypt password hashing.

### Web Admin (React/Vite)
- Interactive map interface using Leaflet.js.
- Real-time issue tracking with automated priority scoring.
- Status management and resolution workflow.

## Project Structure
- `/backend`: API server and database models.
- `/mobile-app`: Expo-based citizen application.
- `/web-admin`: Management dashboard for authorities.

## Setup Instructions

1. **Backend**:
   - `npm install`
   - Setup `.env` with `MONGODB_URI`, `JWT_SECRET`, and Cloudinary keys.
   - `npm start`

2. **Web Admin**:
   - `npm install`
   - `npm run dev`

3. **Mobile App**:
   - `npm install`
   - `npx expo start`

## Default Admin
- **Email**: admin@tvarita.com
- **Pass**: dhanesh
