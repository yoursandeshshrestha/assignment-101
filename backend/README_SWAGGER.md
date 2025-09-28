# Swagger API Documentation

This document explains how to use the Swagger API documentation for the Swipe Interview API.

## Setup

1. **Install Dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**
   Create a `.env` file in the backend directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the Swagger-enabled Server**

   ```bash
   python app.py
   ```

4. **Access Swagger UI**
   Open your browser and navigate to:
   ```
   http://localhost:7077/docs/
   ```

## API Endpoints

### Health Check

- **GET** `/api/v1/health/`
- Returns the health status of the service

### Resume Parsing

- **POST** `/api/v1/resume/parse`
- Upload and parse a resume file (PDF or DOCX)
- Extracts name, email, phone number, and full text

### AI Chat Operations

#### Generate Questions

- **POST** `/api/v1/chat/generate-questions`
- Generates 6 technical interview questions (2 easy, 2 medium, 2 hard)
- Returns questions with difficulty levels, time limits, and categories

#### Score Answer

- **POST** `/api/v1/chat/score-answer`
- Scores a candidate's answer using AI
- Returns detailed scoring breakdown and feedback

#### Generate Summary

- **POST** `/api/v1/chat/generate-summary`
- Generates a professional candidate summary
- Based on interview performance and answers

## Request/Response Examples

### Resume Parsing Request

```bash
curl -X POST "http://localhost:8080/api/v1/resume/parse" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@resume.pdf"
```

### Resume Parsing Response

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

### Generate Questions Response

```json
{
  "success": true,
  "questions": [
    {
      "id": "1",
      "text": "Explain the difference between let, const, and var in JavaScript",
      "difficulty": "medium",
      "timeLimit": 60,
      "category": "Frontend"
    }
  ]
}
```

### Score Answer Request

```json
{
  "question": {
    "text": "Explain the difference between let, const, and var in JavaScript",
    "difficulty": "medium",
    "category": "Frontend"
  },
  "answer": "let and const are block-scoped while var is function-scoped..."
}
```

### Score Answer Response

```json
{
  "success": true,
  "score": 85,
  "feedback": "Good understanding of JavaScript concepts...",
  "detailed_scores": {
    "technical_accuracy": 18,
    "problem_solving": 17,
    "communication": 16,
    "relevance": 19,
    "depth_of_knowledge": 15
  },
  "strengths": ["Clear explanation", "Good examples"],
  "areas_for_improvement": ["More technical depth"],
  "suggestions": ["Practice more coding problems"]
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad Request (missing or invalid data)
- `500` - Internal Server Error

## Features

- **Interactive Documentation**: Test endpoints directly from the Swagger UI
- **Request/Response Models**: Clear documentation of data structures
- **Error Handling**: Comprehensive error responses
- **File Upload Support**: Resume parsing with file upload
- **AI Integration**: OpenAI-powered question generation and scoring

## Development

To modify the API documentation:

1. Edit the models in `app.py`
2. Update endpoint decorators with new parameters
3. Restart the server to see changes
4. Access `/docs/` to view updated documentation

## Production Considerations

For production deployment:

1. Disable debug mode
2. Use a production WSGI server (e.g., Gunicorn)
3. Set up proper logging
4. Configure environment variables securely
5. Add authentication if needed
6. Set up monitoring and health checks
