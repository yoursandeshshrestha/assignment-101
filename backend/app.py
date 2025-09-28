from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restx import Api, Resource, fields, Namespace
import os
import tempfile
from dotenv import load_dotenv
from resume_parser import ResumeParser

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Flask-RESTX API
api = Api(
    app,
    version='1.0',
    title='Swipe Interview API',
    description='AI-powered interview platform API for resume parsing, question generation, and answer scoring',
    doc='/docs/',  # Swagger UI will be available at /docs/
    prefix='/api/v1'
)

# Initialize resume parser
parser = ResumeParser()

# Define namespaces
health_ns = Namespace('health', description='Health check operations')
resume_ns = Namespace('resume', description='Resume parsing operations')
chat_ns = Namespace('chat', description='AI chat operations')

# Add namespaces to API
api.add_namespace(health_ns)
api.add_namespace(resume_ns)
api.add_namespace(chat_ns)

# Root route with navigation links
@app.route('/')
def index():
    """Root endpoint with navigation links"""
    return jsonify({
        "message": "Swipe Interview API",
        "version": "1.0",
        "description": "AI-powered interview platform API for resume parsing, question generation, and answer scoring",
        "links": {
            "health": "/api/v1/health/",
            "docs": "/docs/",
            "swagger_json": "/api/v1/swagger.json"
        },
        "endpoints": {
            "health_check": "GET /api/v1/health/",
            "parse_resume": "POST /api/v1/resume/parse",
            "generate_questions": "POST /api/v1/chat/generate-questions",
            "score_answer": "POST /api/v1/chat/score-answer",
            "generate_summary": "POST /api/v1/chat/generate-summary"
        }
    })

# Define models for request/response documentation
health_response_model = api.model('HealthResponse', {
    'status': fields.String(required=True, description='Service status', example='healthy'),
    'message': fields.String(required=True, description='Status message', example='Resume parser service is running')
})

resume_parse_response_model = api.model('ResumeParseResponse', {
    'success': fields.Boolean(required=True, description='Operation success status'),
    'data': fields.Nested(api.model('ResumeData', {
        'name': fields.String(description='Extracted name', example='John Doe'),
        'email': fields.String(description='Extracted email', example='john.doe@example.com'),
        'phone': fields.String(description='Extracted phone number', example='+1-555-123-4567'),
        'text': fields.String(description='Full resume text content')
    }), description='Parsed resume data'),
    'error': fields.String(description='Error message if operation failed')
})

question_model = api.model('Question', {
    'id': fields.String(required=True, description='Question ID', example='1'),
    'text': fields.String(required=True, description='Question text', example='Explain the difference between let, const, and var in JavaScript'),
    'difficulty': fields.String(required=True, description='Question difficulty', enum=['easy', 'medium', 'hard'], example='medium'),
    'timeLimit': fields.Integer(required=True, description='Time limit in seconds', example=60),
    'category': fields.String(required=True, description='Question category', example='Frontend')
})

questions_response_model = api.model('QuestionsResponse', {
    'success': fields.Boolean(required=True, description='Operation success status'),
    'questions': fields.List(fields.Nested(question_model), description='Generated interview questions'),
    'error': fields.String(description='Error message if operation failed')
})

score_request_model = api.model('ScoreRequest', {
    'question': fields.Nested(api.model('QuestionForScoring', {
        'text': fields.String(required=True, description='Question text'),
        'difficulty': fields.String(required=True, description='Question difficulty'),
        'category': fields.String(required=True, description='Question category')
    }), required=True, description='Question details'),
    'answer': fields.String(required=True, description='Candidate answer', example='let and const are block-scoped while var is function-scoped...')
})

detailed_scores_model = api.model('DetailedScores', {
    'technical_accuracy': fields.Integer(description='Technical accuracy score (0-20)', example=18),
    'problem_solving': fields.Integer(description='Problem solving score (0-20)', example=17),
    'communication': fields.Integer(description='Communication score (0-20)', example=16),
    'relevance': fields.Integer(description='Relevance score (0-20)', example=19),
    'depth_of_knowledge': fields.Integer(description='Depth of knowledge score (0-20)', example=15)
})

score_response_model = api.model('ScoreResponse', {
    'success': fields.Boolean(required=True, description='Operation success status'),
    'score': fields.Integer(required=True, description='Overall score (0-100)', example=85),
    'feedback': fields.String(required=True, description='Detailed feedback', example='Good understanding of JavaScript concepts...'),
    'detailed_scores': fields.Nested(detailed_scores_model, description='Detailed scoring breakdown'),
    'strengths': fields.List(fields.String, description='Identified strengths', example=['Clear explanation', 'Good examples']),
    'areas_for_improvement': fields.List(fields.String, description='Areas for improvement', example=['More technical depth']),
    'suggestions': fields.List(fields.String, description='Suggestions for improvement', example=['Practice more coding problems']),
    'error': fields.String(description='Error message if operation failed')
})

candidate_model = api.model('Candidate', {
    'name': fields.String(required=True, description='Candidate name', example='John Doe'),
    'email': fields.String(required=True, description='Candidate email', example='john.doe@example.com'),
    'answers': fields.List(fields.Nested(api.model('Answer', {
        'answer': fields.String(description='Answer text'),
        'score': fields.Integer(description='Answer score')
    })), description='Interview answers'),
    'questions': fields.List(fields.Nested(api.model('QuestionForSummary', {
        'text': fields.String(description='Question text')
    })), description='Interview questions'),
    'finalScore': fields.Integer(description='Final interview score', example=85)
})

summary_request_model = api.model('SummaryRequest', {
    'candidate': fields.Nested(candidate_model, required=True, description='Candidate data for summary generation')
})

summary_response_model = api.model('SummaryResponse', {
    'success': fields.Boolean(required=True, description='Operation success status'),
    'summary': fields.String(required=True, description='Generated candidate summary', example='John demonstrates solid technical knowledge...'),
    'error': fields.String(description='Error message if operation failed')
})


# Health Check Endpoint
@health_ns.route('/')
class HealthCheck(Resource):
    @health_ns.doc('health_check')
    @health_ns.marshal_with(health_response_model)
    def get(self):
        """Health check endpoint"""
        return {"status": "healthy", "message": "Resume parser service is running"}

# Resume Parsing Endpoint
@resume_ns.route('/parse')
class ParseResume(Resource):
    @resume_ns.doc('parse_resume')
    @resume_ns.expect(api.parser().add_argument('file', location='files', type='file', required=True, help='Resume file (PDF or DOCX)'))
    @resume_ns.marshal_with(resume_parse_response_model)
    def post(self):
        """Parse resume file and extract information"""
        try:
            # Check if file is present in request
            if 'file' not in request.files:
                return {"success": False, "error": "No file provided"}, 400
            
            file = request.files['file']
            
            if file.filename == '':
                return {"success": False, "error": "No file selected"}, 400
            
            # Check file type
            allowed_extensions = {'.pdf', '.docx', '.doc'}
            file_ext = os.path.splitext(file.filename)[1].lower()
            
            if file_ext not in allowed_extensions:
                return {"success": False, "error": "Unsupported file type. Please upload PDF or DOCX file."}, 400
            
            # Save file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
                file.save(temp_file.name)
                temp_file_path = temp_file.name
            
            try:
                # Parse the resume
                result = parser.parse_resume(temp_file_path)
                
                return {
                    "success": True,
                    "data": result
                }
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to parse resume: {str(e)}"
            }, 500

# Question Generation Endpoint
@chat_ns.route('/generate-questions')
class GenerateQuestions(Resource):
    @chat_ns.doc('generate_questions')
    @chat_ns.marshal_with(questions_response_model)
    def post(self):
        """Generate interview questions using AI"""
        try:
            # Check if API key is available
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                return {
                    "success": False,
                    "error": "OpenAI API key not found in environment variables"
                }, 500
            
            prompt = """
            Generate 6 technical interview questions for a full-stack developer position (React/Node.js).
            Create 2 easy, 2 medium, and 2 hard questions.
            Each question should be practical and relevant to real-world development.
            Return the questions in JSON format with the following structure:
            [
              {
                "id": "1",
                "text": "Question text here",
                "difficulty": "easy|medium|hard",
                "timeLimit": 20|60|120,
                "category": "Frontend|Backend|System Design|Database|DevOps"
              }
            ]
            """
            
            print(f"🔑 Using API key: {api_key[:10]}...")
            
            # Use direct API call approach to avoid client initialization issues
            print("🌐 Making direct OpenAI API call...")
            import requests
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an AI assistant that helps conduct technical interviews for full-stack developers. Provide clear, concise, and helpful responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 1500,
                "temperature": 0.7
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code != 200:
                error_text = response.text
                print(f"❌ OpenAI API error: {response.status_code} - {error_text}")
                return {
                    "success": False,
                    "error": f"OpenAI API call failed with status {response.status_code}: {error_text}"
                }, 500
            
            result = response.json()
            questions_text = result['choices'][0]['message']['content']
            print("✅ OpenAI API call succeeded")
            
            if not questions_text or questions_text.strip() == "":
                print("❌ Empty response from OpenAI")
                return {
                    "success": False,
                    "error": "OpenAI returned empty response"
                }, 500
            
            print(f"📄 Response length: {len(questions_text)} characters")
            print(f"📄 Response preview: {questions_text[:200]}...")
            
            # Parse the JSON response
            import json
            try:
                questions = json.loads(questions_text)
                print(f"✅ Parsed {len(questions)} questions")
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing error: {e}")
                print(f"Raw response: {questions_text[:500]}...")
                
                # Try to extract JSON from the response if it's wrapped in markdown
                try:
                    # Look for JSON code blocks
                    import re
                    json_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', questions_text, re.DOTALL)
                    if json_match:
                        json_text = json_match.group(1)
                        questions = json.loads(json_text)
                        print(f"✅ Extracted JSON from markdown: {len(questions)} questions")
                    else:
                        raise Exception("No JSON found in response")
                except Exception as extract_error:
                    print(f"❌ Could not extract JSON: {extract_error}")
                    return {
                        "success": False,
                        "error": f"Failed to parse AI response as JSON: {str(e)}. Could not extract JSON: {str(extract_error)}"
                    }, 500
            
            # Ensure proper formatting
            formatted_questions = []
            for i, q in enumerate(questions):
                formatted_questions.append({
                    "id": str(i + 1),
                    "text": q.get("text", ""),
                    "difficulty": q.get("difficulty", "easy"),
                    "timeLimit": 20 if q.get("difficulty") == "easy" else 60 if q.get("difficulty") == "medium" else 120,
                    "category": q.get("category", "Frontend")
                })
            
            print(f"✅ Returning {len(formatted_questions)} formatted questions")
            return {
                "success": True,
                "questions": formatted_questions
            }
            
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return {
                "success": False,
                "error": f"Failed to generate questions: {str(e)}"
            }, 500

# Answer Scoring Endpoint
@chat_ns.route('/score-answer')
class ScoreAnswer(Resource):
    @chat_ns.doc('score_answer')
    @chat_ns.expect(score_request_model)
    @chat_ns.marshal_with(score_response_model)
    def post(self):
        """Score an interview answer using AI"""
        try:
            data = request.get_json()
            
            if not data or 'question' not in data or 'answer' not in data:
                return {"success": False, "error": "Missing question or answer data"}, 400
            
            question = data['question']
            answer = data['answer']
            
            # Handle empty or missing answers
            if not answer or answer.strip() == "":
                return {
                    "success": True,
                    "score": 0,
                    "feedback": "No answer provided. Please provide a response to receive a score.",
                    "detailed_scores": {
                        "technical_accuracy": 0,
                        "problem_solving": 0,
                        "communication": 0,
                        "relevance": 0,
                        "depth_of_knowledge": 0
                    },
                    "strengths": [],
                    "areas_for_improvement": ["Provide a complete answer to the question"],
                    "suggestions": ["Take time to read the question carefully and provide a thoughtful response"]
                }
            
            # Detect and penalize nonsensical answers
            answer_lower = answer.lower().strip()
            
            # Check for random gibberish patterns
            import re
            
            # Pattern 1: Random character sequences (like fdkjvbvvkbvsd)
            random_pattern = re.compile(r'^[a-z]{10,}$')
            if random_pattern.match(answer_lower) and len(answer_lower) > 8:
                return {
                    "success": True,
                    "score": 5,
                    "feedback": "Answer appears to be random characters or gibberish. Please provide a meaningful response to the technical question.",
                    "detailed_scores": {
                        "technical_accuracy": 0,
                        "problem_solving": 0,
                        "communication": 1,
                        "relevance": 0,
                        "depth_of_knowledge": 0
                    },
                    "strengths": [],
                    "areas_for_improvement": ["Provide a coherent technical answer"],
                    "suggestions": ["Read the question carefully and provide a relevant technical response"]
                }
            
            # Pattern 2: Repeated characters (like aaaaa, bbbbb)
            repeated_pattern = re.compile(r'^(.)\1{4,}$')
            if repeated_pattern.match(answer_lower):
                return {
                    "success": True,
                    "score": 5,
                    "feedback": "Answer appears to be repeated characters. Please provide a meaningful response to the technical question.",
                    "detailed_scores": {
                        "technical_accuracy": 0,
                        "problem_solving": 0,
                        "communication": 1,
                        "relevance": 0,
                        "depth_of_knowledge": 0
                    },
                    "strengths": [],
                    "areas_for_improvement": ["Provide a coherent technical answer"],
                    "suggestions": ["Read the question carefully and provide a relevant technical response"]
                }
            
            # Pattern 3: Very short answers (less than 10 characters) that aren't technical
            if len(answer.strip()) < 10:
                # Check if it contains any technical keywords
                technical_keywords = ['react', 'javascript', 'node', 'html', 'css', 'api', 'database', 'server', 'client', 'frontend', 'backend', 'function', 'variable', 'component', 'state', 'props', 'hook', 'async', 'await', 'promise', 'json', 'http', 'rest', 'graphql', 'sql', 'nosql', 'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'git', 'github', 'ci', 'cd', 'testing', 'jest', 'cypress', 'selenium', 'typescript', 'webpack', 'babel', 'npm', 'yarn', 'package', 'module', 'import', 'export', 'class', 'object', 'array', 'string', 'number', 'boolean', 'null', 'undefined', 'error', 'exception', 'try', 'catch', 'finally', 'if', 'else', 'for', 'while', 'loop', 'recursion', 'algorithm', 'data structure', 'array', 'object', 'function', 'method', 'property', 'attribute', 'element', 'dom', 'bom', 'event', 'listener', 'callback', 'closure', 'scope', 'hoisting', 'prototype', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'solid', 'dry', 'kiss', 'yagni', 'mvc', 'mvp', 'mvvm', 'flux', 'redux', 'mobx', 'rxjs', 'observable', 'subject', 'behavior', 'replay', 'async', 'await', 'promise', 'then', 'catch', 'finally', 'resolve', 'reject', 'pending', 'fulfilled', 'rejected', 'settled', 'race', 'all', 'allsettled', 'any', 'finally', 'finally', 'finally']
                
                has_technical_content = any(keyword in answer_lower for keyword in technical_keywords)
                
                if not has_technical_content:
                    return {
                        "success": True,
                        "score": 10,
                        "feedback": "Answer is too short and doesn't contain technical content. Please provide a more detailed response explaining your technical knowledge.",
                        "detailed_scores": {
                            "technical_accuracy": 0,
                            "problem_solving": 0,
                            "communication": 2,
                            "relevance": 0,
                            "depth_of_knowledge": 0
                        },
                        "strengths": [],
                        "areas_for_improvement": ["Provide a more detailed technical answer"],
                        "suggestions": ["Expand your answer with technical details and examples"]
                    }
            
            # Pattern 4: Check for common non-answers
            non_answers = ['idk', 'dunno', 'no idea', 'dont know', "don't know", 'not sure', 'maybe', 'probably', 'i think', 'i guess', 'not really', 'kind of', 'sort of', 'a bit', 'a little', 'somewhat', 'somehow', 'somewhere', 'sometime', 'someone', 'something', 'anything', 'everything', 'nothing', 'whatever', 'anyway', 'anyhow', 'somehow', 'someway', 'somewhere', 'sometime', 'someone', 'something', 'anything', 'everything', 'nothing', 'whatever', 'anyway', 'anyhow']
            
            if answer_lower in non_answers:
                return {
                    "success": True,
                    "score": 15,
                    "feedback": "Answer indicates uncertainty. Please provide a more confident response based on your technical knowledge.",
                    "detailed_scores": {
                        "technical_accuracy": 0,
                        "problem_solving": 0,
                        "communication": 3,
                        "relevance": 0,
                        "depth_of_knowledge": 0
                    },
                    "strengths": [],
                    "areas_for_improvement": ["Provide a more confident technical answer"],
                    "suggestions": ["Draw from your technical knowledge and experience to provide a more detailed response"]
                }
            
            prompt = f"""
            You are an expert technical interviewer evaluating a candidate's answer for a full-stack developer position.
            
            QUESTION DETAILS:
            Question: {question.get('text', '')}
            Difficulty Level: {question.get('difficulty', '')}
            Category: {question.get('category', '')}
            
            CANDIDATE'S ANSWER:
            {answer}
            
            EVALUATION CRITERIA:
            Please evaluate this answer based on the following criteria (each worth 20 points, total 100):
            
            1. TECHNICAL ACCURACY (20 points):
               - Correctness of technical concepts
               - Understanding of the technology
               - Accuracy of implementation details
            
            2. PROBLEM-SOLVING APPROACH (20 points):
               - Logical thinking process
               - Step-by-step reasoning
               - Consideration of edge cases
               - Alternative solutions mentioned
            
            3. COMMUNICATION CLARITY (20 points):
               - Clear explanation of concepts
               - Well-structured response
               - Use of appropriate technical terminology
               - Ability to explain complex ideas simply
            
            4. RELEVANCE TO QUESTION (20 points):
               - Directly addresses the question asked
               - Stays on topic
               - Provides relevant examples
               - Shows understanding of the context
            
            5. DEPTH OF KNOWLEDGE (20 points):
               - Demonstrates deep understanding
               - Shows practical experience
               - Mentions best practices
               - Shows awareness of industry standards
            
            SCORING GUIDELINES:
            - 90-100: Exceptional - Demonstrates mastery, provides excellent examples, shows deep understanding
            - 80-89: Good - Solid understanding, good examples, minor gaps in knowledge
            - 70-79: Satisfactory - Basic understanding, some good points, room for improvement
            - 60-69: Below Average - Limited understanding, some correct points, significant gaps
            - 40-59: Poor - Minimal understanding, many incorrect points, needs significant improvement
            - 0-39: Very Poor - Little to no understanding, mostly incorrect, requires extensive learning
            
            Return your evaluation in this exact JSON format:
            {{
                "score": 85,
                "feedback": "Detailed feedback explaining the score and areas for improvement",
                "technical_accuracy": 18,
                "problem_solving": 17,
                "communication": 16,
                "relevance": 19,
                "depth_of_knowledge": 15,
                "strengths": ["List specific strengths shown in the answer"],
                "areas_for_improvement": ["List specific areas that need improvement"],
                "suggestions": ["Provide specific suggestions for improvement"]
            }}
            """
            
            # Use direct API call approach
            import requests
            headers = {
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are an expert technical interviewer. Evaluate answers objectively and provide constructive feedback."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 800,
                "temperature": 0.7
            }
            
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data, timeout=30)
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"OpenAI API call failed with status {response.status_code}: {response.text}"
                }, 500
            
            result = response.json()
            result_text = result['choices'][0]['message']['content']
            
            # Parse the JSON response
            import json
            try:
                result = json.loads(result_text)
                
                # Validate and clean the response
                score = max(0, min(100, result.get('score', 0)))
                feedback = result.get('feedback', 'No feedback provided.')
                
                # Enhanced response with detailed scoring
                response_data = {
                    "success": True,
                    "score": score,
                    "feedback": feedback,
                    "detailed_scores": {
                        "technical_accuracy": result.get('technical_accuracy', 0),
                        "problem_solving": result.get('problem_solving', 0),
                        "communication": result.get('communication', 0),
                        "relevance": result.get('relevance', 0),
                        "depth_of_knowledge": result.get('depth_of_knowledge', 0)
                    },
                    "strengths": result.get('strengths', []),
                    "areas_for_improvement": result.get('areas_for_improvement', []),
                    "suggestions": result.get('suggestions', [])
                }
                
                return response_data
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing error in score response: {e}")
                print(f"Raw response: {result_text[:500]}...")
                
                # Try to extract basic score and feedback if JSON parsing fails
                import re
                score_match = re.search(r'"score":\s*(\d+)', result_text)
                feedback_match = re.search(r'"feedback":\s*"([^"]+)"', result_text)
                
                if score_match and feedback_match:
                    return {
                        "success": True,
                        "score": int(score_match.group(1)),
                        "feedback": feedback_match.group(1),
                        "detailed_scores": {},
                        "strengths": [],
                        "areas_for_improvement": [],
                        "suggestions": []
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Failed to parse scoring response: {str(e)}"
                    }, 500
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to score answer: {str(e)}"
            }, 500

# Summary Generation Endpoint
@chat_ns.route('/generate-summary')
class GenerateSummary(Resource):
    @chat_ns.doc('generate_summary')
    @chat_ns.expect(summary_request_model)
    @chat_ns.marshal_with(summary_response_model)
    def post(self):
        """Generate candidate summary using AI"""
        try:
            data = request.get_json()
            
            if not data or 'candidate' not in data:
                return {"success": False, "error": "Missing candidate data"}, 400
            
            candidate = data['candidate']
            
            # Format the interview data
            interview_responses = ""
            answers = candidate.get('answers', [])
            questions = candidate.get('questions', [])
            
            for i, answer in enumerate(answers):
                # Safely get question text, handle case where questions list might be shorter
                if i < len(questions):
                    question_text = questions[i].get('text', f'Question {i+1}')
                else:
                    question_text = f'Question {i+1}'
                
                interview_responses += f"Q{i+1}: {question_text}\n"
                interview_responses += f"A{i+1}: {answer.get('answer', '')}\n"
                interview_responses += f"Score: {answer.get('score', 0)}%\n\n"
            
            prompt = f"""
            Generate a professional summary for this candidate based on their interview performance.
            
            Candidate: {candidate.get('name', 'Unknown')}
            Email: {candidate.get('email', 'Unknown')}
            Questions answered: {len(candidate.get('answers', []))}/{len(candidate.get('questions', []))}
            Overall score: {candidate.get('finalScore', 'Not calculated')}%
            
            Interview responses:
            {interview_responses}
            
            Provide a concise, professional summary (2-3 sentences) highlighting:
            - Technical strengths
            - Areas for improvement
            - Overall assessment
            """
            
            # Use direct API call approach
            import requests
            headers = {
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are an expert HR professional. Generate professional, objective candidate summaries."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 500,
                "temperature": 0.7
            }
            
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data, timeout=30)
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"OpenAI API call failed with status {response.status_code}: {response.text}"
                }, 500
            
            result = response.json()
            summary = result['choices'][0]['message']['content']
            
            if not summary or summary.strip() == "":
                return {
                    "success": False,
                    "error": "OpenAI returned empty summary"
                }, 500
            
            return {
                "success": True,
                "summary": summary
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate summary: {str(e)}"
            }, 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 7078))
    app.run(debug=True, host='0.0.0.0', port=port)
