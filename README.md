# Assignment 101

A React-based interview application that allows users to upload resumes and conduct AI-powered interviews.

## Features

- Resume Upload: Accept PDF/DOCX files and extract Name, Email, Phone
- AI Interview: Generate and conduct technical interview questions
- Answer Scoring: AI evaluates answers and provides feedback
- Candidate Management: View and manage interview candidates
- Real-time Chat: Interactive interview experience

## How it Works

1. **Upload Resume**: User uploads a PDF or DOCX resume
2. **Extract Information**: System extracts name, email, and phone number
3. **Start Interview**: AI generates 6 technical questions (2 easy, 2 medium, 2 hard)
4. **Answer Questions**: User answers questions through chat interface
5. **Get Feedback**: AI scores answers and provides detailed feedback
6. **View Results**: Interviewer can view candidate performance and download results

## User Flow

### For Interviewees (Candidates)

1. **Upload Resume** → Select PDF/DOCX file
2. **Fill Missing Info** → Complete name, email, phone if not extracted
3. **Start Interview** → AI generates 6 technical questions
4. **Answer Questions** → Type responses in chat interface
5. **Get Scores** → Receive immediate feedback on each answer
6. **View Summary** → See final results and download report

### For Interviewers (Recruiters)

1. **Access Dashboard** → View all candidates
2. **Filter Candidates** → Search by name, status, or score
3. **Review Details** → Click on candidate to see full interview
4. **Analyze Performance** → Check scores, feedback, and answers
5. **Download Results** → Export candidate summary and data

## Tech Stack

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend

- **Python Flask** - Web framework
- **OpenAI API** - AI integration
- **pdfplumber** - PDF parsing
- **python-docx** - DOCX parsing
- **email-validator** - Email validation

### Storage & Data

- **IndexedDB** - Client-side storage
- **Redux Persist** - State persistence
- **JSON** - Data format

## UI Showcase

### Resume Upload Screen

![Resume Upload](uiShowcase/resume-upload.png)

### Filling Missing Details

![Filling Missing Details](uiShowcase/filling-missing-details.png)

### Question Generation

![Question Generation](uiShowcase/question-generation.png)

### Interviewer Dashboard

![Interviewer Dashboard](uiShowcase/interviewer-dashboard.png)

### Student Detail Modal

![Student Detail Modal](uiShowcase/student-detail-model.png)

### Summary Screen

![Summary Screen](uiShowcase/summary.png)

### Database Indexed

![Database Indexed](uiShowcase/DB-indexed.png)

### Error Message

![Error Message](uiShowcase/error-message.png)

### Flowchart

![Flowchart](uiShowcase/flowchart.png)

### Test Screen

![Test Screen](uiShowcase/test.png)
