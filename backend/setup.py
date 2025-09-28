#!/usr/bin/env python3
"""
Setup script for the AI Interview Assistant Backend
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    print("Installing Python requirements...")
    try:
        subprocess.check_call(["python3", "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False
    return True

def check_env_file():
    """Check if .env file exists and has required variables"""
    env_path = ".env"
    if not os.path.exists(env_path):
        print("⚠️  .env file not found!")
        print("Please create a .env file with your OpenAI API key:")
        print("OPENAI_API_KEY=your_openai_api_key_here")
        return False
    
    # Check if OPENAI_API_KEY is in the file
    with open(env_path, 'r') as f:
        content = f.read()
        if 'OPENAI_API_KEY=' not in content:
            print("⚠️  OPENAI_API_KEY not found in .env file!")
            print("Please add your OpenAI API key to the .env file:")
            print("OPENAI_API_KEY=your_openai_api_key_here")
            return False
    
    print("✅ .env file found with OPENAI_API_KEY")
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up AI Interview Assistant Backend...")
    print("This backend provides:")
    print("  📄 Resume parsing (PDF/DOCX)")
    print("  🤖 AI-powered interview questions")
    print("  📊 Answer scoring and feedback")
    print("  📝 Candidate summary generation")
    
    # Install requirements
    if not install_requirements():
        print("❌ Setup failed!")
        return
    
    # Check environment configuration
    if not check_env_file():
        print("❌ Environment setup incomplete!")
        return
    
    print("\n✅ Setup complete!")
    print("\n🚀 To start the backend server, run:")
    print("  python3 app.py")
    print("\n📡 The server will be available at: http://localhost:8080")
    print("\n🔗 API Endpoints:")
    print("  POST /parse-resume          - Parse resume files")
    print("  POST /chat/generate-questions - Generate interview questions")
    print("  POST /chat/score-answer     - Score candidate answers")
    print("  POST /chat/generate-summary - Generate candidate summaries")
    print("  GET  /health                - Health check")

if __name__ == "__main__":
    main()
