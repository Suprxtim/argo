"""
Test script to verify LLM connection
"""
import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from llm_utils import DeepSeekLLM

async def test_connection():
    print("Testing LLM connection...")
    
    # Initialize the LLM
    llm = DeepSeekLLM()
    
    # Check if API key is configured
    if not llm.api_key:
        print("ERROR: API key not found!")
        return False
        
    print(f"API Key configured: {'Yes' if llm.api_key else 'No'}")
    print(f"API URL: {llm.api_url}")
    
    # Test a simple query
    try:
        response = await llm.generate_response(
            "What is the Argo float program?", 
            response_type="explanation"
        )
        print("Connection successful!")
        print(f"Response: {response[:200]}...")
        return True
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_connection())
    if not result:
        exit(1)