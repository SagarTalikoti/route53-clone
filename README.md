# Route 53 Clone

A full-stack web application that clones the core functionality of AWS Route 53. It allows users to manage DNS Hosted Zones and DNS Records through a modern, responsive interface.

## 🏗 Architecture Overview

This project is built using a modern full-stack architecture separated into a frontend client and a backend REST API.

### Frontend
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context (for mock Authentication)
- **Data Fetching**: Native `fetch` API

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (local database)
- **ORM**: SQLAlchemy
- **CORS**: Configured to accept requests from the Next.js frontend

---

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)

### 1. Start the Backend API
Navigate to the backend directory, install the dependencies, and start the FastAPI server:

```bash
cd backend
pip install fastapi uvicorn sqlalchemy
uvicorn main:app --reload
```
The backend API will be available at `http://localhost:8000`.

### 2. Start the Frontend Application
In a new terminal window, navigate to the frontend directory, install dependencies, and start the Next.js development server:

```bash
cd frontend
npm install
npm run dev
```
The frontend application will be available at `http://localhost:3000`.

---

## 🗄 Database Schema

The backend uses SQLite with SQLAlchemy ORM. The schema consists of three primary models:

### 1. `HostedZone`
Stores the DNS hosted zones.
- `id` (String, Primary Key): Unique identifier (e.g., `Z123456789`)
- `name` (String): The domain name (e.g., `example.com`)
- `description` (String, nullable): Optional description
- `is_private` (Boolean): Indicates if it's a private or public zone (default: `False`)
- `record_count` (Integer): Denormalized count of records in this zone (default: `0`)
- *Relationships*: One-to-Many with `DNSRecord`

### 2. `DNSRecord`
Stores the individual DNS records associated with a hosted zone.
- `id` (Integer, Primary Key): Unique auto-incrementing ID
- `hosted_zone_id` (String, Foreign Key): References `HostedZone.id`
- `name` (String): Record name (e.g., `www.example.com`)
- `type` (String): Record type (e.g., `A`, `CNAME`, `TXT`, `MX`)
- `value` (String): The routing value/IP address
- `ttl` (Integer): Time to Live in seconds (default: `300`)
- `routing_policy` (String): Routing policy type (default: `Simple`)

### 3. `User`
Used for authentication/mock login state.
- `id` (Integer, Primary Key): Unique auto-incrementing ID
- `email` (String, Unique): User email address
- `hashed_password` (String): Encrypted password

---

## 🔌 API Overview

The FastAPI backend exposes the following RESTful endpoints. All endpoints assume the `http://localhost:8000` base URL.

### Health Check
- `GET /`
  - Returns a basic success message indicating the API is running.

### Hosted Zones
- `GET /api/hosted-zones`
  - Returns a list of all hosted zones.
- `POST /api/hosted-zones`
  - Creates a new hosted zone. Generates a random `Z...` prefix ID.
- `GET /api/hosted-zones/{zone_id}`
  - Retrieves details for a specific hosted zone.
- `DELETE /api/hosted-zones/{zone_id}`
  - Deletes a specific hosted zone and all its associated records (cascade delete).

### DNS Records
- `GET /api/hosted-zones/{zone_id}/records`
  - Returns all DNS records for a specific hosted zone.
- `POST /api/hosted-zones/{zone_id}/records`
  - Creates a new DNS record within the specified hosted zone. Automatically increments the `record_count` on the parent zone.
- `DELETE /api/hosted-zones/{zone_id}/records/{record_id}`
  - Deletes a specific DNS record. Decrements the parent zone's `record_count`.
- `POST /api/hosted-zones/{zone_id}/records/bulk-delete`
  - Deletes multiple records at once using a list of `record_ids` in the request body. Updates the parent zone's `record_count` accordingly.
