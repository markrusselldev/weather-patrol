# Weather Patrol

## Project Overview

### Backend Server (toa5-file-server)

[https://github.com/markrusselldev/toa5-file-server](https://github.com/markrusselldev/toa5-file-server)

**Purpose**: Handles TOA5 weather data files from a weather station.

**Framework**: Created with create-react-app.

**Functionality**:

- Reads, validates, and caches weather data from a .dat file, updated every 15 minutes.
- Exposes two API endpoints to provide the latest weather data and all weather data.
- Uses Server-Sent Events (SSE) to notify the frontend of file updates.

**Endpoints**:

- `/api/latest`: Returns the latest weather data.
- `/api/data`: Returns all cached weather data.
- `/api/sse`: Establishes SSE connection for real-time updates.

### Frontend App (weather-patrol)

**Purpose**: Displays weather data served by the backend.

**Framework**: Created with Vite.

**Functionality**:

- Fetches weather data from the backend API endpoints.
- Listens for SSE updates to dynamically update the displayed data.

**Key Components**:

- `index.html`: The entry point for the application.
- `src/main.jsx`: Initializes the React application.
- `public/themes/*.css`: CSS themes for styling the application.
- `.eslintrc.cjs`: ESLint configuration for code quality.
- `postcss.config.js`: Configuration for PostCSS plugins.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/weather-patrol.git
   ```

2. Navigate to the backend server directory and install dependencies:

   ```sh
   cd weather-patrol/toa5-file-server
   npm install
   ```

3. Start the backend server:

   ```sh
   npm start
   ```

4. In a new terminal window, navigate to the frontend app directory and install dependencies:

   ```sh
   cd ../weather-patrol
   npm install
   ```

5. Start the frontend app:

   ```sh
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173` to see the application in action.

## Usage

- The backend server will automatically read and cache the weather data from the specified .dat file every 15 minutes.
- The frontend app will fetch the latest data from the backend and update the UI dynamically using SSE.

## License

Distributed under the MIT License.
&copy; 2024 Mark David Russell. All rights reserved.

## Acknowledgements

- Thanks to all contributors and maintainers of the libraries and tools used in this project.
