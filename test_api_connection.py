import os
import httpx
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv("backend/.env")

# Get API configuration
api_key = os.getenv("DEEPSEEK_API_KEY")
api_url = os.getenv("DEEPSEEK_API_URL", "https://openrouter.ai/api/v1/chat/completions")

print(f"API Key configured: {'Yes' if api_key else 'No'}")
print(f"API Key length: {len(api_key) if api_key else 0}")
print(f"API URL: {api_url}")

# Test API connection with the new model
async def test_api():
    if not api_key:
        print("No API key found!")
        return
        
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    # Test with the new model
    model = "google/gemma-2-9b-it:free"
    print(f"\nTesting model: {model}")
    request_data = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Hello, this is a test message."}
        ],
        "max_tokens": 100
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(api_url, headers=headers, json=request_data)
            print(f"API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("API Connection Successful!")
                print(f"Response: {result['choices'][0]['message']['content']}")
                return model  # Return the working model
            else:
                print(f"API Error: {response.status_code}")
                try:
                    error_content = response.json()
                    print(f"Error Message: {error_content.get('error', {}).get('message', 'Unknown error')}")
                except:
                    print(f"Error Content: {response.text[:200]}...")
                    
    except Exception as e:
        print(f"Connection Error: {e}")
    
    return None

# Run the test
if __name__ == "__main__":
    asyncio.run(test_api())