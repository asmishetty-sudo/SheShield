# SheShield – Real-Time Personal Safety Platform

**SheShield** is a full-stack web application designed to enhance personal safety through instant SOS alerts, live location tracking, and community-driven emergency response.

It allows users to quickly send distress signals, notify trusted contacts, and connect with nearby volunteers for rapid assistance in critical situations.

---

## Features

* One-Tap SOS Alert
  Instantly send emergency alerts with location

* Live Location Tracking
  Real-time tracking of victims and volunteers

* Trusted Contacts System
  Add emergency contacts for quick notification

* Volunteer Network
  Nearby users can accept and respond to SOS alerts

* Admin Dashboard
  Monitor SOS activity, users, and response analytics

* Authentication & Role-Based Access
  User, Volunteer, and Admin roles

* Analytics
  Response time, resolution rate, and activity charts

---

## Project Structure

```bash
sheshield/
│
├── frontend/ (Next.js Frontend)
│   ├── app/               # Pages & routing
│   ├── components/        # Reusable UI components
│   ├── contexts/          # Global state (User, Admin, Info)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities (API, socket, location)
│   └── .env.example       # Environment variables template
│
├── backend/ (Backend - Node.js/Express)
│   ├── controllers/       # Business logic
│   ├── models/            # Database schemas (MongoDB)
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation
│   ├── services/          # For messaging implementation
│   ├── config/            # For cloudinary
│   ├── socket/            # Real-time communication (Socket.IO)
│   └── .env.example       # Environment variables template
│
└── README.md
```

---

## Tech Stack

**Frontend**

* Next.js (App Router)
* Tailwind CSS
* Recharts (analytics)
* Leaflet (maps)

**Backend**

* Node.js
* Express.js
* MongoDB
* Socket.IO (real-time updates)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sheshield.git
cd sheshield
```

---

### 2. Setup Environment Variables

Create a `.env` file in both client and server folders using `.env.example`:

```bash
cp .env.example .env
```

Fill in required values such as:

* MongoDB URI
* JWT secret
* Backend URL

---

### 3. Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

---

### 4. Run the Project

#### Start Backend

```bash
nodemon server.js
```

#### Start Frontend

```bash
cd ../client
npm run dev
```

---

## Usage Flow

1. User registers or logs in
2. Adds trusted contacts
3. Presses SOS button in emergency
4. Location is shared in real-time
5. Volunteers receive alert and respond
6. Admin monitors activity via dashboard

---

## Future Improvements

* Mobile app (React Native)
* Push notifications
* AI-based danger prediction
* Offline SOS support (SMS fallback)

---
## Demo
- [Live Demo](https://she-shield-zeta.vercel.app/)
- [Demo Video](https://youtu.be/U6oMOUTUaR8)

---
## Author

Asmi M Shetty
Software Developer

---

## Disclaimer

SheShield is a project/demo application and should not be relied upon as a sole safety solution in real-world critical emergencies.

---

## Support

If you find this project useful:

* Star the repository
* Share it
* Contribute

