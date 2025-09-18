#!/usr/bin/env python3
"""
Script to evaluate the accuracy of the LLM model
"""
import asyncio
import sys
import os
import json
from typing import List, Tuple

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from llm_utils import OpenRouterLLM

# Sample test dataset - in a real scenario, you would have a more comprehensive dataset
TEST_DATASET = [
    {
        "question": "What is the primary purpose of Argo floats?",
        "expected_keywords": ["ocean", "data", "collect", "temperature", "salinity", "pressure"],
        "type": "factual"
    },
    {
        "question": "How do Argo floats measure ocean temperature?",
        "expected_keywords": ["sensor", "temperature", "profiling", "depth"],
        "type": "technical"
    },
    {
        "question": "Explain the relationship between temperature and salinity in ocean water.",
        "expected_keywords": ["density", "thermohaline", "circulation", "water mass"],
        "type": "conceptual"
    }
]

async def evaluate_model_accuracy():
    """Evaluate the accuracy of the model with test questions"""
    print("Evaluating model accuracy...")
    
    # Initialize the LLM
    llm = OpenRouterLLM()
    
    correct_responses = 0
    total_responses = len(TEST_DATASET)
    
    for i, test_case in enumerate(TEST_DATASET):
        print(f"\nTest {i+1}/{total_responses}: {test_case['question']}")
        
        try:
            # Get model response
            response = await llm.generate_response(
                test_case['question'], 
                response_type="explanation"
            )
            
            # Simple keyword matching evaluation
            response_lower = response.lower()
            matched_keywords = [
                keyword for keyword in test_case['expected_keywords'] 
                if keyword.lower() in response_lower
            ]
            
            # Calculate accuracy for this test case
            accuracy = len(matched_keywords) / len(test_case['expected_keywords'])
            
            print(f"  Expected keywords: {test_case['expected_keywords']}")
            print(f"  Matched keywords: {matched_keywords}")
            print(f"  Accuracy: {accuracy:.2%}")
            
            # Consider it correct if at least 50% of keywords are found
            if accuracy >= 0.5:
                correct_responses += 1
                print("  Result: ✅ PASS")
            else:
                print("  Result: ❌ FAIL")
                
        except Exception as e:
            print(f"  Error: {e}")
            print("  Result: ❌ FAIL")
    
    # Calculate overall accuracy
    overall_accuracy = correct_responses / total_responses
    print(f"\n{'='*50}")
    print(f"Overall Model Accuracy: {overall_accuracy:.2%}")
    print(f"Correct Responses: {correct_responses}/{total_responses}")
    print(f"{'='*50}")
    
    return overall_accuracy

def create_comprehensive_test_dataset():
    """Create a more comprehensive test dataset for better accuracy measurement"""
    return [
        # Factual questions about Argo program
        {
            "question": "When was the Argo program initiated?",
            "expected_keywords": ["2000", "2000s", "millennium", "beginning"],
            "type": "factual"
        },
        {
            "question": "How many Argo floats are typically active in the ocean?",
            "expected_keywords": ["3000", "4000", "thousands", "fleet"],
            "type": "factual"
        },
        # Technical questions about measurements
        {
            "question": "What physical properties do Argo floats measure?",
            "expected_keywords": ["temperature", "salinity", "pressure", "conductivity"],
            "type": "technical"
        },
        {
            "question": "At what depth do Argo floats typically operate?",
            "expected_keywords": ["2000", "depth", "meter", "profiling"],
            "type": "technical"
        },
        # Conceptual questions about oceanography
        {
            "question": "Why is the Argo program important for climate science?",
            "expected_keywords": ["climate", "monitoring", "ocean", "heat", "storage"],
            "type": "conceptual"
        },
        {
            "question": "How does the data from Argo floats contribute to weather prediction?",
            "expected_keywords": ["weather", "prediction", "forecast", "ocean", "atmosphere"],
            "type": "conceptual"
        }
    ]

async def run_comprehensive_evaluation():
    """Run a more comprehensive evaluation with an expanded dataset"""
    print("Running comprehensive model accuracy evaluation...")
    
    # Use the comprehensive dataset
    test_dataset = create_comprehensive_test_dataset()
    
    # Initialize the LLM
    llm = OpenRouterLLM()
    
    correct_responses = 0
    total_responses = len(test_dataset)
    
    for i, test_case in enumerate(test_dataset):
        print(f"\nTest {i+1}/{total_responses}: {test_case['question']}")
        
        try:
            # Get model response
            response = await llm.generate_response(
                test_case['question'], 
                response_type="explanation"
            )
            
            # Simple keyword matching evaluation
            response_lower = response.lower()
            matched_keywords = [
                keyword for keyword in test_case['expected_keywords'] 
                if keyword.lower() in response_lower
            ]
            
            # Calculate accuracy for this test case
            accuracy = len(matched_keywords) / len(test_case['expected_keywords'])
            
            print(f"  Expected keywords: {test_case['expected_keywords']}")
            print(f"  Matched keywords: {matched_keywords}")
            print(f"  Accuracy: {accuracy:.2%}")
            
            # Consider it correct if at least 50% of keywords are found
            if accuracy >= 0.5:
                correct_responses += 1
                print("  Result: ✅ PASS")
            else:
                print("  Result: ❌ FAIL")
                
        except Exception as e:
            print(f"  Error: {e}")
            print("  Result: ❌ FAIL")
    
    # Calculate overall accuracy
    overall_accuracy = correct_responses / total_responses
    print(f"\n{'='*60}")
    print(f"Comprehensive Model Accuracy Evaluation Results")
    print(f"{'='*60}")
    print(f"Overall Model Accuracy: {overall_accuracy:.2%}")
    print(f"Correct Responses: {correct_responses}/{total_responses}")
    print(f"{'='*60}")
    
    return overall_accuracy

if __name__ == "__main__":
    print("Model Accuracy Evaluation Script")
    print("=" * 40)
    
    # Run basic evaluation
    basic_accuracy = asyncio.run(evaluate_model_accuracy())
    
    print("\n" + "="*50)
    print("BASIC EVALUATION COMPLETE")
    print("="*50)
    
    # Run comprehensive evaluation automatically
    print("\nRunning comprehensive evaluation...")
    comprehensive_accuracy = asyncio.run(run_comprehensive_evaluation())
    print(f"\nComparison:")
    print(f"Basic Evaluation Accuracy: {basic_accuracy:.2%}")
    print(f"Comprehensive Evaluation Accuracy: {comprehensive_accuracy:.2%}")