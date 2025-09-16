"""
Final test to verify the visualization fix
"""
import requests
import json

# Test the backend API directly
def test_visualization_fix():
    url = "http://localhost:8000/query"
    payload = {
        "message": "Show me a temperature vs salinity plot",
        "include_visualization": True
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            data = response.json()
            print("API Response Status:", response.status_code)
            print("Success:", data.get("success"))
            print("Has Plot URL:", "plot_url" in data and data["plot_url"] is not None)
            
            if data.get("plot_url"):
                plot_url = data["plot_url"]
                print("Plot URL Type:", "Base64 HTML" if plot_url.startswith("data:text/html;base64,") else "File path")
                print("Query Type:", data.get("query_type"))
                print("Text Response Preview:", data.get("text_response", "")[:100] + "...")
                return True
            else:
                print("No visualization generated")
                return False
        else:
            print("API Error:", response.status_code)
            print("Response:", response.text)
            return False
    except Exception as e:
        print("Test failed with error:", str(e))
        return False

if __name__ == "__main__":
    print("Testing visualization fix...")
    success = test_visualization_fix()
    if success:
        print("\n✅ Visualization fix verification PASSED")
        print("The visualization should now display correctly in the chat interface")
    else:
        print("\n❌ Visualization fix verification FAILED")
        print("Check the server logs for more information")