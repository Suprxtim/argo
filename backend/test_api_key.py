#!/usr/bin/env python3
"""
Test script to verify OpenRouter API key configuration
"""
import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))

from llm_utils import OpenRouterLLM

async def test_api_key():
    """Test if the API key is correctly configured and working"""
    print("Testing OpenRouter API key configuration...")
    
    # Initialize the LLM
    llm = OpenRouterLLM()
    
    # Check if API key is loaded
    if not llm.api_key:
        print("❌ ERROR: API key not found in configuration")
        return False
    
    print(f"✅ API key loaded: {llm.api_key[:10]}...{llm.api_key[-5:]}")
    print(f"✅ API URL: {llm.api_url}")
    print(f"✅ Model: deepseek/deepseek-r1:free")
    
    # Test a simple API call
    try:
        print("Testing API connectivity...")
        response = await llm.generate_response("Hello, this is a test.", response_type="greeting")
        print("✅ API connection successful!")
        print(f"Sample response: {response[:100]}...")
        return True
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False

async def test_model_info():
    """Test to verify model information"""
    print("\nTesting model information...")
    llm = OpenRouterLLM()
    
    # Test a data analysis request
    try:
        response = await llm.generate_response("What is the relationship between temperature and salinity in ocean data?", response_type="explanation")
        print("✅ Model is generating appropriate responses!")
        print(f"Explanation response: {response[:100]}...")
        return True
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

if __name__ == "__main__":
    result1 = asyncio.run(test_api_key())
    result2 = asyncio.run(test_model_info())
    
    if result1 and result2:
        print("\n🎉 All tests passed! The new API key and model are working correctly.")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Please check the configuration.")
        sys.exit(1)