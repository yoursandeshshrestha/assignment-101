# Resume Parser Backend

A Python-based resume parsing service that extracts contact information and text from PDF and DOCX files.

## Features

- **PDF Parsing**: Uses `pdfplumber` and `PyPDF2` for robust text extraction
- **DOCX Parsing**: Uses `python-docx` for Microsoft Word documents
- **Contact Extraction**: Extracts only name, email, and phone number
- **REST API**: Flask-based API with CORS support
- **Simple & Fast**: Minimal dependencies, focused functionality

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Run the setup script:**

   ```bash
   python3 setup.py
   ```

   This will:

   - Install all required Python packages
   - Set up the environment

3. **Start the server:**

   ```bash
   python3 app.py
   ```

   The server will be available at `http://localhost:5000`

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

### Parse Resume

```
POST /parse-resume
```

Upload and parse a resume file.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body: File upload (PDF or DOCX)

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "text": "Full resume text content..."
  }
}
```

## Dependencies

- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **PyPDF2**: PDF text extraction
- **pdfplumber**: Advanced PDF parsing
- **python-docx**: DOCX file processing
- **email-validator**: Email validation

## Development

The backend service is designed to work with the React frontend. When the backend is running, the frontend will automatically use it for resume parsing. If the backend is not available, the frontend will fall back to client-side parsing for DOCX files.

## Error Handling

The service includes comprehensive error handling:

- File type validation
- Text extraction fallbacks
- Contact information validation
- Graceful degradation when services are unavailable

## Production Deployment

For production deployment, consider:

- Using a production WSGI server (e.g., Gunicorn)
- Setting up proper logging
- Adding authentication if needed
- Using environment variables for configuration
- Setting up monitoring and health checks
