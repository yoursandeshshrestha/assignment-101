import os
import re
import PyPDF2
import pdfplumber
from docx import Document
from email_validator import validate_email, EmailNotValidError

class ResumeParser:
    def __init__(self):
        """Initialize the resume parser"""
        pass
    
    def parse_resume(self, file_path):
        """Parse resume file and extract information"""
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            text = self._extract_pdf_text(file_path)
        elif file_ext in ['.docx', '.doc']:
            text = self._extract_docx_text(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
        
        # Debug: print extracted text
        print(f"DEBUG: Extracted text: {repr(text)}")
        
        # Extract only name, email, and phone
        name = self._extract_name(text)
        email = self._extract_email(text)
        phone = self._extract_phone(text)
        
        print(f"DEBUG: Extracted name: {repr(name)}")
        print(f"DEBUG: Extracted email: {repr(email)}")
        print(f"DEBUG: Extracted phone: {repr(phone)}")
        
        result = {
            'name': name,
            'email': email,
            'phone': phone,
            'text': text
        }
        
        return result
    
    def _extract_pdf_text(self, file_path):
        """Extract text from PDF file using multiple methods"""
        text = ""
        
        # Try pdfplumber first (better for complex layouts)
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"pdfplumber failed: {e}")
            
            # Fallback to PyPDF2
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
            except Exception as e2:
                print(f"PyPDF2 also failed: {e2}")
                raise Exception("Failed to extract text from PDF")
        
        return text.strip()
    
    def _extract_docx_text(self, file_path):
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Failed to extract text from DOCX: {e}")
    
    def _extract_name(self, text):
        """Extract name from resume text"""
        lines = text.split('\n')
        
        # First, look for explicit "Name:" pattern
        for line in lines:
            line = line.strip()
            if line.lower().startswith('name:'):
                name = line[5:].strip()  # Remove "Name:" prefix
                if name and len(name) < 100:
                    return name
        
        # Look for name in first few lines (original logic)
        for i, line in enumerate(lines[:5]):
            line = line.strip()
            if len(line) > 0 and len(line) < 100:  # Reasonable name length
                # Check if line looks like a name (2-4 words, title case)
                words = line.split()
                if 2 <= len(words) <= 4:
                    # Check if all words start with capital letters
                    if all(word[0].isupper() for word in words if word):
                        # Avoid common non-name patterns
                        if not any(word.lower() in ['resume', 'cv', 'curriculum', 'vitae'] for word in words):
                            return line
        
        # If no name found, try to extract from email (common pattern: firstname.lastname@domain.com)
        email = self._extract_email(text)
        if email and '@' in email:
            local_part = email.split('@')[0]
            if '.' in local_part:
                # Convert firstname.lastname to "Firstname Lastname"
                name_parts = local_part.split('.')
                if len(name_parts) == 2:
                    name = f"{name_parts[0].capitalize()} {name_parts[1].capitalize()}"
                    return name
            else:
                # If no dot in email, use the local part as first name
                if len(local_part) > 2:  # Avoid very short names
                    return local_part.capitalize()
        
        return None
    
    def _extract_email(self, text):
        """Extract email address from text"""
        lines = text.split('\n')
        
        # First, look for explicit "Email:" or "email:" pattern
        for line in lines:
            line = line.strip()
            print(f"DEBUG: Checking line for email: {repr(line)}")
            if line.lower().startswith('email:'):
                email = line[6:].strip()  # Remove "email:" prefix
                print(f"DEBUG: Found email prefix, extracted: {repr(email)}")
                if email:
                    try:
                        validate_email(email)
                        print(f"DEBUG: Email validation passed: {email}")
                        return email
                    except EmailNotValidError as e:
                        print(f"DEBUG: Email validation failed: {e}")
                        pass
        
        # Then look for email patterns in the text
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        print(f"DEBUG: Found emails with regex: {emails}")
        
        if emails:
            # Validate email
            try:
                validate_email(emails[0])
                print(f"DEBUG: Regex email validation passed: {emails[0]}")
                return emails[0]
            except EmailNotValidError as e:
                print(f"DEBUG: Regex email validation failed: {e}")
                pass
        
        print("DEBUG: No email found")
        return None
    
    def _extract_phone(self, text):
        """Extract phone number from text"""
        lines = text.split('\n')
        
        # First, look for explicit "Phone:" pattern
        for line in lines:
            line = line.strip()
            if line.lower().startswith('phone:'):
                phone = line[6:].strip()  # Remove "Phone:" prefix
                if phone:
                    # Clean the phone number
                    phone_str = re.sub(r'[^\d+]', '', phone)
                    if len(phone_str) >= 10:  # Minimum phone number length
                        return phone_str
        
        # Then look for phone patterns in the text
        phone_patterns = [
            r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # US format
            r'\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}',  # Simple format
        ]
        
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            if matches:
                # Clean the first match
                phone_str = ''.join(matches[0]) if isinstance(matches[0], tuple) else matches[0]
                phone_str = re.sub(r'[^\d+]', '', phone_str)  # Keep only digits and +
                
                if len(phone_str) >= 10:  # Minimum phone number length
                    return phone_str
        
        return None
    
