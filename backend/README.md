# AQUA Guardian - Backend API

FastAPI backend server for the AQUA Guardian pollution reporting and monitoring system.

## Features

- 🔐 User authentication with Supabase
- 📊 Real-time dashboard analytics
- 🤖 AI-powered pollution image classification
- 🗺️ Geographic pollution tracking
- ⛓️ Blockchain integration for report verification
- 📧 Automated authority notifications

## Prerequisites

- Python 3.9 or higher
- Virtual environment (venv)
- Supabase account and credentials

## Setup

### 1. Create Virtual Environment

```bash
python -m venv .venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
.venv\Scripts\activate
```

**Linux/Mac:**
```bash
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory with the following:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Running the Server

### Quick Start (Windows)

Simply double-click `start_backend.bat` or run:

```bash
start_backend.bat
```

### Manual Start

**Windows:**
```bash
.venv\Scripts\activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Linux/Mac:**
```bash
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on `http://localhost:8000`

## API Documentation

Once the server is running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── api/              # API route handlers
│   ├── auth.py       # Authentication endpoints
│   ├── reports.py    # Pollution report endpoints
│   ├── dashboard.py  # Dashboard analytics endpoints
│   ├── ai.py         # AI inference endpoints
│   ├── cleanup.py    # Cleanup event endpoints
│   └── rewards.py    # Gamification/rewards endpoints
├── db/               # Database models and connections
├── ml/               # Machine learning models
├── blockchain/       # Blockchain integration
├── utils/            # Utility functions
├── main.py           # FastAPI application entry point
└── requirements.txt  # Python dependencies
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Reports
- `POST /reports/` - Submit pollution report
- `GET /reports/` - Get all reports
- `GET /reports/{id}` - Get specific report
- `POST /reports/{id}/verify` - Verify report

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/water-quality` - Get latest water quality data
- `GET /dashboard/water-quality-history` - Get historical water quality
- `GET /dashboard/reports/timeline` - Get reports timeline
- `GET /dashboard/reports/by-type` - Get reports by pollution type
- `GET /dashboard/reports/by-status` - Get reports by status
- `GET /dashboard/reports/geographic-heatmap` - Get geographic distribution
- `GET /dashboard/reports/severity-distribution` - Get severity distribution
- `GET /dashboard/marine-impact/metrics` - Get marine impact metrics

## Troubleshooting

### Import Errors

If you encounter import errors, ensure all subdirectories have `__init__.py` files:
- `api/__init__.py`
- `db/__init__.py`
- `ml/__init__.py`
- `utils/__init__.py`
- `blockchain/__init__.py`

### Port Already in Use

If port 8000 is already in use, change the port in the startup command:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Don't forget to update the frontend `.env` file to match:
```
VITE_API_URL=http://localhost:8001
```

### Database Connection Issues

Verify your Supabase credentials in the `.env` file and ensure your Supabase project is active.

## Development

### Adding New Endpoints

1. Create or modify files in the `api/` directory
2. Import and register the router in `main.py`
3. The server will auto-reload with `--reload` flag

### Running Tests

```bash
pytest tests/
```

## License

Part of the AQUA Guardian project.
