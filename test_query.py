import requests
import json

# Test query to the backend
url = "http://localhost:8000/query"
headers = {"Content-Type": "application/json"}

# Test query that should generate a visualization
data = {
    "message": "Show me the temperature profile with depth",
    "language": "en",
    "include_visualization": True
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)