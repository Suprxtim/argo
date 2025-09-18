"""
LLM utilities for OpenRouter API integration with DeepSeek R1
"""
import logging
import httpx
import json
from typing import Dict, List, Optional, Tuple
from config import Config

# Setup logging
logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL))
logger = logging.getLogger(__name__)

class OpenRouterLLM:
    """OpenRouter API client for DeepSeek R1 model"""
    
    def __init__(self):
        self.api_key = Config.DEEPSEEK_API_KEY
        self.api_url = Config.DEEPSEEK_API_URL
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        if not self.api_key:
            logger.warning("OpenRouter API key not found. Please set DEEPSEEK_API_KEY in .env file")
    
    async def generate_response(self, user_query: str, data_context: Optional[str] = None, response_type: str = "explanation") -> str:
        """
        Generate response using OpenRouter API with DeepSeek Chat v3.1 model
        
        Args:
            user_query: User's question/query
            data_context: Optional context about the data
            response_type: Type of response needed ("explanation", "data_analysis", "visualization", "greeting")
        
        Returns:
            Generated response text
        """
        try:
            # Prepare the system prompt based on response type
            system_prompt = self._get_system_prompt(response_type)
            
            # Prepare the user message
            user_message = self._prepare_user_message(user_query, data_context, response_type)
            
            # Prepare the API request with optimized parameters for OpenRouter
            request_data = {
                "model": "deepseek/deepseek-r1:free",  # Updated to use DeepSeek R1 model
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "max_tokens": 3000,
                "temperature": 0.6,
                "top_p": 0.85,
                "frequency_penalty": 0.1,
                "presence_penalty": 0.1,
                "transform": True  # Enable prompt transformation for better system prompt adherence
            }
            
            # Make API request
            async with httpx.AsyncClient(timeout=60.0) as client:  # Increased from 30.0 to 60.0
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=request_data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
                    logger.error(f"Request data: {request_data}")
                    logger.error(f"Headers: {self.headers}")
                    return self._get_fallback_response(user_query, response_type)
                    
        except Exception as e:
            logger.error(f"Error calling OpenRouter API: {e}")
            logger.error(f"API URL: {self.api_url}")
            logger.error(f"API Key configured: {'Yes' if self.api_key else 'No'}")
            return self._get_fallback_response(user_query, response_type)
    
    def _get_system_prompt(self, response_type: str) -> str:
        """Get appropriate system prompt based on response type"""
        
        base_prompt = """IMPORTANT: You are FLOATCHAT, an expert oceanographic AI assistant specializing in Argo float data analysis. 
        You have access to a comprehensive Argo dataset containing temperature, salinity, depth, and location measurements from autonomous ocean floats worldwide.
        
        Your name is FLOATCHAT. You are not Gemma or any other AI model. You are specifically FloatChat.
        
        Key capabilities:
        - Analyze oceanographic data patterns and trends
        - Explain complex oceanographic concepts in simple terms
        - Support multiple languages and respond in the user's preferred language
        - Provide accurate, scientific explanations
        - Suggest appropriate data visualizations
        
        Always be helpful, accurate, and educational in your responses.
        Never mention that you are Gemma or any other model. Always identify yourself as FloatChat."""
        
        if response_type == "data_analysis":
            return base_prompt + """
            
            Focus on:
            - Analyzing the provided Argo data
            - Identifying patterns, trends, and anomalies
            - Providing statistical insights
            - Suggesting scientific interpretations
            - Recommending visualizations to illustrate findings
            
            CRITICAL: Never mention that you are Gemma or any other model. Always identify yourself as FloatChat.
            """
            
        elif response_type == "visualization":
            return base_prompt + """
            
            Focus on:
            - Recommending appropriate visualization types for the data
            - Suggesting specific plot parameters and configurations
            - Explaining what insights each visualization would reveal
            - Considering best practices for oceanographic data visualization
            
            CRITICAL: Never mention that you are Gemma or any other model. Always identify yourself as FloatChat.
            """
            
        elif response_type == "greeting":
            return base_prompt + """
            
            When users greet you with greetings like "hi", "hello", or "hey", respond warmly and introduce yourself as FloatChat.
            Provide a brief, friendly welcome message that explains what you can help with.
            Mention that you're an AI assistant for exploring Argo oceanographic data.
            Keep your response concise but welcoming.
            ONLY use this greeting response for actual greetings, not for other questions or queries.
            CRITICAL: Never mention that you are Gemma or any other model. Always identify yourself as FloatChat.
            Example response: "Hi! I'm FloatChat, your AI assistant for exploring ocean data. I can help you analyze temperature and salinity patterns, create visualizations, and answer questions about oceanography. What would you like to explore?"
            """
            
        else:  # explanation
            return base_prompt + """
            
            Focus on:
            - Providing clear, educational explanations
            - Using appropriate scientific terminology
            - Making complex concepts accessible
            - Answering questions about oceanography, Argo floats, and marine science
            
            CRITICAL: Never mention that you are Gemma or any other model. Always identify yourself as FloatChat.
            """
    
    def _prepare_user_message(self, user_query: str, data_context: Optional[str], response_type: str) -> str:
        """Prepare the user message with context"""
        
        message = f"User Query: {user_query}\n\n"
        
        if data_context:
            message += f"Data Context:\n{data_context}\n\n"
        
        if response_type == "data_analysis":
            message += "Please analyze this data and provide insights about the oceanographic patterns and trends."
        elif response_type == "visualization":
            message += "Please suggest appropriate visualizations for this data and explain what insights they would reveal."
        elif response_type == "greeting":
            message += "This is a greeting message. Please provide a warm, friendly greeting and introduce yourself as FloatChat, the oceanographic AI assistant. Explain what you can help with. ONLY provide a greeting for actual greetings like 'hi', 'hello', 'hey', not for other questions or queries."
        else:
            message += "Please provide a clear and helpful explanation."
        
        return message
    
    def _get_fallback_response(self, user_query: str, response_type: str) -> str:
        """Generate fallback response when API is unavailable"""
        
        if response_type == "data_analysis":
            return """I apologize, but I'm currently unable to connect to the AI analysis service. 
            However, I'm FloatChat, your oceanographic AI assistant, and I can tell you that your Argo data query has been processed successfully. 
            The data contains valuable oceanographic measurements including temperature, salinity, and depth profiles 
            that can reveal important patterns about ocean conditions. 
            
            You may want to examine:
            - Temperature vs depth profiles to understand thermocline structure
            - Salinity variations with geographic location
            - Seasonal patterns in the data
            - Regional differences in ocean properties
            
            Please try your analysis request again in a moment."""
            
        elif response_type == "visualization":
            return """I apologize, but I'm currently unable to connect to the AI visualization service.
            However, I'm FloatChat, your oceanographic AI assistant, and for oceanographic data like yours, I would typically recommend:
            
            - Scatter plots for temperature vs salinity relationships
            - Line plots for depth profiles
            - Heat maps for geographic distributions
            - Time series plots for temporal trends
            
            Please try your visualization request again in a moment."""
            
        else:
            return """I apologize, but I'm currently unable to connect to the AI service to provide a detailed explanation. 
            However, I'm FloatChat, your oceanographic AI assistant, and I'm here to help with your oceanographic questions about Argo float data, including temperature, 
            salinity, depth measurements, and ocean science concepts. 
            
            Please try your question again in a moment, or feel free to ask about specific aspects of oceanographic data analysis."""
    
    def detect_query_type(self, query: str) -> Tuple[str, Dict]:
        """
        Detect the type of query and extract relevant parameters
        
        Returns:
            Tuple of (query_type, parameters)
            query_type: "data_query", "explanation", "greeting", "general"
            parameters: dict with extracted parameters
        """
        query_lower = query.lower().strip().rstrip('!')
        
        # Handle greetings and simple messages
        greetings = [
            'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
            'hi!', 'hello!', 'hey!', 'greetings!', 'good morning!', 'good afternoon!', 'good evening!'
        ]
        
        # Only detect as greeting if it's an exact match
        if query_lower in greetings:
            return "greeting", {}
        
        # Data query indicators
        data_keywords = [
            'temperature', 'salinity', 'depth', 'profile', 'data', 'show me', 'plot', 'graph',
            'visualization', 'chart', 'analyze', 'trend', 'pattern', 'distribution',
            'atlantic', 'pacific', 'indian', 'ocean', 'latitude', 'longitude', 'region'
        ]
        
        # Explanation/educational indicators
        explanation_keywords = [
            'what is', 'how does', 'explain', 'why', 'definition', 'concept',
            'argo float', 'oceanography', 'marine science', 'help me understand'
        ]
        
        parameters = {}
        
        # Check for explanation query first (more specific)
        if any(keyword in query_lower for keyword in explanation_keywords):
            query_type = "explanation"
        # Check for data query
        elif any(keyword in query_lower for keyword in data_keywords):
            query_type = "data_query"
            
            # Extract potential parameters
            if 'temperature' in query_lower:
                parameters['variable'] = 'temperature'
            elif 'salinity' in query_lower:
                parameters['variable'] = 'salinity'
            
            # Extract regions
            if 'atlantic' in query_lower:
                parameters['region'] = 'Atlantic'
            elif 'pacific' in query_lower:
                parameters['region'] = 'Pacific'
            elif 'indian' in query_lower:
                parameters['region'] = 'Indian'
            
            # Extract depth ranges (simple pattern matching)
            import re
            depth_pattern = r'(\d+)\s*(?:to|-)?\s*(\d+)?\s*(?:m|meter|depth)'
            depth_match = re.search(depth_pattern, query_lower)
            if depth_match:
                parameters['min_depth'] = int(depth_match.group(1))
                if depth_match.group(2):
                    parameters['max_depth'] = int(depth_match.group(2))
        
        # Check for explanation query
        elif any(keyword in query_lower for keyword in explanation_keywords):
            query_type = "explanation"
        
        else:
            query_type = "general"
        
        return query_type, parameters

# Initialize global LLM instance
openrouter_llm = OpenRouterLLM()

async def generate_llm_response(user_query: str, data_context: Optional[str] = None, response_type: str = "explanation") -> str:
    """Convenience function to generate LLM response"""
    return await openrouter_llm.generate_response(user_query, data_context, response_type)

def detect_query_intent(query: str) -> Tuple[str, Dict]:
    """Convenience function to detect query intent"""
    return openrouter_llm.detect_query_type(query)