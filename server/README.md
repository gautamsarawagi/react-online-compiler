# React Component Editor - Backend Server

A Node.js/Express backend server for storing and managing React components with NeonDB integration.

## Features

- **RESTful API** for component management
- **PostgreSQL/NeonDB** integration with automatic table creation
- **Input validation** and error handling
- **CORS** enabled for frontend integration
- **Environment-based configuration**

## API Endpoints

### 1. Create Component
- **POST** `/api/component`
- **Body**: `{ "code": "React component code" }`
- **Response**: Component with generated UUID

### 2. Get Component (Preview)
- **GET** `/api/preview/:id`
- **Response**: Component code and metadata

### 3. Update Component
- **PUT** `/api/component/:id`
- **Body**: `{ "code": "Updated React component code" }`
- **Response**: Updated component

### 4. Delete Component
- **DELETE** `/api/component/:id`
- **Response**: Success message

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment configuration**:
   - Copy `env.example` to `.env`
   - Add your NeonDB connection string to `DATABASE_URL`

3. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Schema

The server automatically creates a `components` table with:
- `id` (UUID, Primary Key)
- `code` (TEXT, React component code)
- `created_at` (Timestamp)
- `updated_at` (Timestamp, auto-updated)

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: NeonDB connection string
- `CLIENT_URL`: Frontend URL for CORS

## Health Check

- **GET** `/health` - Server status endpoint 