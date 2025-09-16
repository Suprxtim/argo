"""
Alternative LLM configuration for OpenAI API
If you prefer to use OpenAI instead of DeepSeek
"""

# Option 1: Use OpenAI GPT-4
# Update your .env file with:
# OPENAI_API_KEY=your_openai_api_key_here
# LLM_PROVIDER=openai

# Option 2: Use other providers
# ANTHROPIC_API_KEY=your_anthropic_key_here
# LLM_PROVIDER=anthropic

# The system will automatically detect and use the available provider