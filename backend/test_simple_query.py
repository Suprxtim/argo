"""
Simple test to verify the system works with a basic query
This can be run when rate limits are reset
"""
import asyncio
import os
import sys

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from llm_utils import OpenRouterLLM

async def test_simple_query():
    """Test a simple query to verify the system works"""
    print("Testing simple query with FloatChat...")
    
    # Initialize the LLM
    llm = OpenRouterLLM()
    
    # Test a simple greeting query
    query = "hi"
    response_type = "greeting"
    
    print(f"Sending query: '{query}'")
    
    try:
        # Generate response
        response = await llm.generate_response(query, response_type=response_type)
        print(f"Response: {response}")
        
        # Check if it's a proper FloatChat response (not fallback)
        if "I apologize" not in response and "unable to connect" not in response:
            print("✓ Success! FloatChat is working properly")
            print("✓ Response correctly identifies as FloatChat:", "FloatChat" in response)
        else:
            print("⚠ Still rate limited or having connection issues")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_simple_query())