# Weather Patrol

Weather Patrol is a completed full-stack application for processing and displaying data from a Campbell Scientific weather station.

The backend monitors a TOA5 data file, validates and caches incoming observations, and exposes the results through REST and Server-Sent Events. The React frontend displays current conditions and receives live updates without polling.

## Project status

The application was completed and functional. The hosted demonstration is currently offline because maintaining paid hosting was no longer justified.

## What it demonstrates

- Processing Campbell Scientific TOA5 weather data
- File monitoring and automatic data ingestion
- Schema-based validation
- REST API design
- Real-time browser updates with Server-Sent Events
- In-memory caching
- React frontend development
- Node.js and Express backend development
- Security headers, CORS controls, and rate limiting

## Architecture

### Frontend

- React
- Vite
- Tailwind CSS
- Light, dark, and denim themes

### Backend

- Node.js
- Express
- Chokidar for monitoring the source data file
- NodeCache for fast access to processed observations
- Server-Sent Events for real-time updates

## API endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/latest` | Returns the latest weather observation |
| `GET /api/data` | Returns cached weather data |
| `GET /api/sse` | Opens a real-time event stream |
| `GET /api/health` | Reports application health |

## Local setup

Clone the repository:

```bash
git clone https://github.com/markrusselldev/weather-patrol.git
cd weather-patrol
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

Start the backend:

```bash
npm start
```

Start the frontend in a separate terminal:

```bash
npm run dev
```

The backend monitors `toa5.dat` for changes and sends updated weather observations to the frontend.

## License

MIT
