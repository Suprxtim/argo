# Model Accuracy Evaluation

This document describes how to evaluate the accuracy of the LLM model used in the FloatChat application.

## Overview

The model accuracy evaluation script (`backend/model_accuracy_test.py`) provides a framework for measuring the performance of the LLM as a percentage. It works by:

1. Sending predefined test questions to the model
2. Comparing the model's responses against expected keywords
3. Calculating accuracy as a percentage based on keyword matches

## How It Works

The evaluation script contains two types of tests:

1. **Basic Evaluation**: 3 core questions about Argo floats
2. **Comprehensive Evaluation**: 6 detailed questions covering various aspects of oceanography

For each question, the script:
- Sends the question to the LLM
- Compares the response against expected keywords
- Calculates accuracy as: (matched keywords / total expected keywords) * 100%
- Determines if the response passes based on a 50% threshold

## Running the Evaluation

To run the model accuracy evaluation:

```bash
cd backend
python model_accuracy_test.py
```

## Interpreting Results

The script outputs accuracy as percentages:
- **Per-question accuracy**: Percentage of expected keywords found in each response
- **Overall accuracy**: Percentage of questions that passed the evaluation (>=50% keyword match)

Example output:
```
Overall Model Accuracy: 66.67%
Correct Responses: 4/6
```

This means 4 out of 6 questions passed the evaluation, resulting in 66.67% overall accuracy.

## Customizing the Evaluation

To improve accuracy measurement, you can:

1. **Expand the test dataset**: Add more comprehensive test cases with relevant questions and expected keywords
2. **Refine expected keywords**: Adjust keywords to better match the domain-specific terminology
3. **Adjust the passing threshold**: Modify the 50% threshold in the script to be more or less strict
4. **Implement advanced evaluation methods**: Add semantic similarity or other NLP-based evaluation techniques

## Example Test Case

```python
{
    "question": "What is the primary purpose of Argo floats?",
    "expected_keywords": ["ocean", "data", "collect", "temperature", "salinity", "pressure"],
    "type": "factual"
}
```

## Rate Limiting Considerations

Note that the OpenRouter API may impose rate limits, which could affect evaluation results. If you encounter rate limiting errors (HTTP 429), consider:

1. Adding your own API key to increase rate limits
2. Adding delays between requests
3. Reducing the number of test cases
4. Running evaluations during off-peak hours

## Adding New Test Cases

To add new test cases, simply extend the `TEST_DATASET` or `create_comprehensive_test_dataset()` functions in the script with additional questions and expected keywords.