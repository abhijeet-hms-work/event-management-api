# Event Management API

A robust RESTful API for managing events and user registrations built with Node.js, Express, and PostgreSQL.

## Features

- ✅ Create and manage events with capacity limits (max 1000)
- ✅ User registration and authentication
- ✅ Event registration with duplicate and capacity checking
- ✅ Concurrent registration handling with database locks
- ✅ Prevent registration for past events
- ✅ Custom sorting for upcoming events
- ✅ Comprehensive event statistics
- ✅ Proper error handling and validation

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Connection Pooling:** node-postgres (pg)

## Project Structure

```
event-management-api/
├── config/
│   └── database.js          # Database connection pool
├── controllers/
│   ├── eventController.js   # Event request handlers
│   └── userController.js    # User request handlers
├── services/
│   ├── eventService.js      # Event business logic
│   └── userService.js       # User business logic
├── routes/
│   ├── eventRoutes.js       # Event API routes
│   └── userRoutes.js        # User API routes
├── middleware/
│   ├── errorHandler.js      # Error handling middleware
│   └── validation.js        # Input validation middleware
├── database/
│   └── schema.sql           # Database schema
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── server.js                # Application entry point
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step 1: Clone the Repository

git clone <repository-url>
cd event-management-api

### Step 2: Install Dependencies

npm install

### Step 3: Database Setup

1. Create a PostgreSQL database:

   ```bash
   createdb event_management
   ```

2. Run the schema file:

   ```bash
   psql -d event_management -f database/schema.sql
   ```

### Step 4: Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/event_management
PORT=3000
NODE_ENV=development
```

### Step 5: Start the Server

Development mode (with auto-reload):
npm run dev

Production mode:
npm start

## API Documentation

### Base URL
http://localhost:3000/api

---

### User Endpoints

#### 1. Create User
POST /api/users
Content-Type: application/json

{
"name": "John Doe",
"email": "john@example.com"
}

**Response (201):**
{
"status": "success",
"message": "User created successfully",
"data": {
"user": {
"id": 1,
"name": "John Doe",
"email": "john@example.com",
"created_at": "2025-10-15T10:30:00.000Z"
}
}
}

#### 2. Get All Users
GET /api/users

#### 3. Get User by ID
GET /api/users/:userId

---

### Event Endpoints

#### 1. Create Event
POST /api/events
Content-Type: application/json

{
"title": "Tech Conference 2025",
"date_time": "2025-12-15T09:00:00Z",
"location": "Mumbai Convention Center",
"capacity": 500
}

**Response (201):**
{
"status": "success",
"message": "Event created successfully",
"data": {
"event_id": 1,
"event": {
"id": 1,
"title": "Tech Conference 2025",
"date_time": "2025-12-15T09:00:00.000Z",
"location": "Mumbai Convention Center",
"capacity": 500,
"created_at": "2025-10-15T10:30:00.000Z"
}
}
}

**Validation Rules:**
- Title: Required, non-empty string
- Date/Time: Valid ISO 8601 format
- Location: Required, non-empty string
- Capacity: Integer between 1 and 1000

---

#### 2. Get Event Details
GET /api/events/:eventId

**Response (200):**
{
"status": "success",
"data": {
"event": {
"id": 1,
"title": "Tech Conference 2025",
"date_time": "2025-12-15T09:00:00.000Z",
"location": "Mumbai Convention Center",
"capacity": 500,
"created_at": "2025-10-15T10:30:00.000Z",
"registered_count": 2,
"registrations": [
{
"id": 1,
"name": "John Doe",
"email": "john@example.com",
"registered_at": "2025-10-15T11:00:00.000Z"
}
]
}
}
}

---

#### 3. Register for Event
POST /api/events/:eventId/register
Content-Type: application/json

{
"user_id": 1
}

**Response (200):**
{
"status": "success",
"data": {
"message": "Successfully registered for event",
"user_id": 1,
"event_id": 1
}
}

**Business Rules:**
- ❌ Cannot register for past events
- ❌ Cannot register if event is full
- ❌ Cannot register twice for the same event
- ✅ Uses database locks to prevent race conditions

**Error Responses:**

Event Full (400):
{
"status": "fail",
"message": "Event is full"
}

Already Registered (400):
{
"status": "fail",
"message": "User already registered for this event"
}

Past Event (400):
{
"status": "fail",
"message": "Cannot register for past events"
}

---

#### 4. Cancel Registration
DELETE /api/events/:eventId/register
Content-Type: application/json

{
"user_id": 1
}

**Response (200):**
{
"status": "success",
"data": {
"message": "Registration cancelled successfully",
"user_id": 1,
"event_id": 1
}
}

---

#### 5. List Upcoming Events
GET /api/events/upcoming

**Response (200):**
{
"status": "success",
"count": 2,
"data": {
"events": [
{
"id": 1,
"title": "Tech Conference 2025",
"date_time": "2025-12-15T09:00:00.000Z",
"location": "Mumbai Convention Center",
"capacity": 500,
"registered_count": "25"
}
]
}
}

**Custom Sorting:**
1. By date (ascending) - earliest events first
2. By location (alphabetically) - for events on the same date

---

#### 6. Event Statistics
GET /api/events/:eventId/stats

**Response (200):**
{
"status": "success",
"data": {
"stats": {
"event_id": 1,
"total_registrations": 250,
"remaining_capacity": 250,
"capacity_percentage": 50.00
}
}
}

---

## Error Handling

The API uses consistent HTTP status codes and error responses:

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
{
"status": "fail",
"message": "Descriptive error message"
}

---

## Concurrency Handling

The API handles concurrent registrations using PostgreSQL row-level locks:

// Lock event row during registration
await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [eventId]);

This prevents race conditions when multiple users try to register simultaneously for events near capacity.

---

## Database Schema

### Users Table
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### Events Table
CREATE TABLE events (
id SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
date_time TIMESTAMP NOT NULL,
location VARCHAR(255) NOT NULL,
capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### Event Registrations (Junction Table)
CREATE TABLE event_registrations (
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (user_id, event_id)
);

---

## Testing with cURL

### Create a User
curl -X POST http://localhost:3000/api/users
-H "Content-Type: application/json"
-d '{"name":"John Doe","email":"john@example.com"}'

### Create an Event
curl -X POST http://localhost:3000/api/events
-H "Content-Type: application/json"
-d '{
"title":"Tech Meetup",
"date_time":"2025-12-20T18:00:00Z",
"location":"Bangalore",
"capacity":100
}'

### Register for Event
curl -X POST http://localhost:3000/api/events/1/register
-H "Content-Type: application/json"
-d '{"user_id":1}'

### Get Upcoming Events
curl http://localhost:3000/api/events/upcoming

---

## Performance Optimizations

1. **Connection Pooling:** Uses pg Pool with max 20 connections
2. **Database Indexes:** Indexes on date_time, location, and foreign keys
3. **Row-Level Locking:** Prevents race conditions during registration
4. **Efficient Queries:** LEFT JOINs and aggregations for statistics

---

## Development Best Practices

- ✅ Modular architecture (MVC pattern)
- ✅ Separation of concerns (controllers, services, routes)
- ✅ Comprehensive input validation
- ✅ Custom error classes
- ✅ Transaction management for critical operations
- ✅ Environment-based configuration



