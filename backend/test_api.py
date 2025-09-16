#!/usr/bin/env python3
"""
Test script to verify DeepSeek API connection
"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_deepseek_api():
    """Test the DeepSeek API connection"""
    
    api_key = os.getenv("DEEPSEEK_API_KEY")
    api_url = os.getenv("DEEPSEEK_API_URL", "https://api.deepseek.com/chat/completions")
    
    if not api_key:
        print("❌ ERROR: DEEPSEEK_API_KEY not found in environment variables")
        return False
    
    print(f"🔑 API Key: {api_key[:20]}...")
    print(f"🌐 API URL: {api_url}")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    test_data = {
        "model": "deepseek/deepseek-chat",  # Correct OpenRouter model identifier
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say hello in a friendly way."}
        ],
        "max_tokens": 100,
        "temperature": 0.7
    }
    
    try:
        print("🔄 Testing API connection...")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                api_url,
                headers=headers,
                json=test_data
            )
            
            print(f"📊 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                message = result["choices"][0]["message"]["content"]
                print(f"✅ SUCCESS! API Response: {message}")
                return True
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"📄 Response: {response.text}")
                
                # Common error diagnostics
                if response.status_code == 401:
                    print("💡 This looks like an authentication error. Check your API key.")
                elif response.status_code == 404:
                    print("💡 This looks like an endpoint error. Check the API URL.")
                elif response.status_code == 429:
                    print("💡 Rate limit exceeded. Wait a moment and try again.")
                
                return False
                
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("💡 This could be a network issue or incorrect API endpoint.")
        return False

if __name__ == "__main__":
    print("🧪 DeepSeek API Connection Test")
    print("=" * 40)
    
    result = asyncio.run(test_deepseek_api())
    
    if result:
        print("\n🎉 API connection is working! Your FloatChat should work now.")
    else:
        print("\n🔧 API connection failed. Please check your configuration.")
        print("\nTroubleshooting steps:")
        print("1. Verify your API key is correct")
        print("2. Check if you have credits/quota remaining")
        print("3. Ensure the API endpoint URL is correct")
        print("4. Check your internet connection")