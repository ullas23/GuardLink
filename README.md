# GuardLink - AI-Powered SOC Log Analysis Platform

GuardLink is an MVP cybersecurity platform that uses Gemini AI to analyze security logs and generate SOC-style attack analysis reports.

## Features

- **AI-Powered Analysis**: Uses Google Gemini AI for intelligent log analysis
- **Multiple Input Methods**: Paste log text or upload files (.txt, .log, .csv, .json)
- **Premium UI**: Glassmorphic design with smooth animations
- **Attack Classification**: Categorizes threats into 17 attack categories
- **MITRE Mapping**: Maps attacks to MITRE ATT&CK framework
- **SOC Recommendations**: Provides actionable security recommendations
- **Analysis History**: Stores and retrieves previous analyses

## Architecture

- **Backend**: Python FastAPI with Gemini AI integration
- **Frontend**: React with Vite, premium glassmorphic UI
- **AI Engine**: Google Gemini for log analysis
- **Storage**: LocalStorage for history, JSON for latest report

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google Gemini API key

### Setup Instructions

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd guardlink/backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Gemini API key
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the backend server
uvicorn main:app --reload --port 8001
```

The backend will start on `http://localhost:8001`

#### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd guardlink/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or another available port)

#### 3. Access GuardLink

Open your browser and navigate to the frontend URL shown in the terminal (typically `http://localhost:5173`)

## Usage

1. **Sample Logs**: Try the built-in sample logs (Port Scan, Brute Force, DDoS, SQL Injection, Normal)
2. **File Upload**: Upload log files (.txt, .log, .csv, .json) up to 10MB
3. **Text Input**: Paste log text directly into the input area
4. **Analysis**: Click "Analyze Logs" to process with AI
5. **Results**: View comprehensive analysis with indicators, recommendations, and MITRE mapping

## Supported File Types

- `.txt` - Plain text logs
- `.log` - Standard log files
- `.csv` - Comma-separated values
- `.json` - JSON formatted logs

## Attack Categories

GuardLink classifies logs into:
- Reconnaissance Attacks
- Credential Attacks
- Denial of Service / DDoS
- Malware Activity
- Command & Control / C2
- Data Exfiltration
- Web Application Attacks
- DNS-Based Attacks
- Insider Threats
- Lateral Movement
- Privilege Escalation
- Persistence Mechanisms
- Phishing & Email Attacks
- Cloud Attacks
- IoT & OT Attacks
- Benign
- Unknown

## API Endpoints

- `GET /` - Health check
- `POST /api/analyze` - Analyze logs
- `GET /api/report/latest` - Get latest report
- `POST /api/clear` - Clear reports

## Project Structure

```
guardlink/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── ai_engine.py         # Gemini AI integration
│   ├── indicator_extractor.py # Security indicator extraction
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── sample_logs/         # Sample log files
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── App.jsx         # Main application
    │   ├── api.js          # API client
    │   └── styles.css      # Global styles
    ├── package.json        # Node dependencies
    └── vite.config.js      # Vite configuration
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Limits

- Maximum file size: 10 MB
- Maximum log lines processed: 1000
- Analysis history stored: 10 most recent analyses

## Development

### Running Tests

```bash
# Backend tests
cd guardlink/backend
python -m pytest

# Frontend tests
cd guardlink/frontend
npm test
```

### Building for Production

```bash
# Frontend build
cd guardlink/frontend
npm run build
```

## Troubleshooting

### Backend Issues

1. **Gemini API Key Error**: Ensure your API key is correctly set in `.env`
2. **Import Errors**: Make sure all dependencies are installed with `pip install -r requirements.txt`
3. **Port Conflicts**: Change the port in the uvicorn command if 8001 is in use

### Frontend Issues

1. **Backend Connection**: Ensure backend is running on `http://localhost:8001`
2. **CORS Errors**: The backend is configured for multiple frontend ports (5173, 5174, 5175) - adjust if needed
3. **Build Errors**: Clear node_modules and reinstall dependencies

## Project Recovery (Full Rebuild Instructions)

If cloning this repository fresh or recovering after deletion:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd guardlink
```

### 2. Backend Setup

```bash
# Navigate to backend
cd guardlink/backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env
# Edit .env and add your Gemini API key:
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run Backend

```bash
uvicorn main:app --reload --port 8001
```

Backend will be available at: http://localhost:8001

### 4. Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd guardlink/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173 (or another port if 5173 is in use)

### 5. Verify Installation

1. Open browser to frontend URL
2. Check backend health: http://localhost:8001
3. Test analysis with sample logs

## Security Notes

- API keys are stored in environment variables only
- No sensitive data is stored in the frontend
- File uploads are validated for type and size
- All analysis is performed server-side
- `.env`, `venv/`, `node_modules/`, and `__pycache__/` are excluded from Git

## License

This project is provided as an MVP for demonstration purposes.

## Support

For issues and questions, please refer to the project documentation or check the console for error messages.
