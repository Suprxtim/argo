# Data Accuracy Evaluation

This document describes how to evaluate the accuracy of data processing and numerical calculations in the FloatChat application.

## Overview

The data accuracy evaluation script (`backend/data_accuracy_test.py`) provides a comprehensive framework for measuring the accuracy of data processing operations as percentages. It evaluates three key aspects of data handling:

1. **Data Loading Accuracy**: Verifies that data is loaded correctly with proper validation
2. **Filtering Accuracy**: Tests that data filtering operations work correctly
3. **Summary Statistics Accuracy**: Ensures that statistical summaries are calculated accurately

## How It Works

The evaluation script runs a series of tests on the data processing pipeline:

### Data Loading Accuracy Tests (5 tests)
1. **Data Loading**: Verifies data can be loaded successfully
2. **Column Validation**: Ensures all expected columns are present
3. **NaN Value Check**: Confirms no critical columns contain NaN values
4. **Value Range Validation**: Checks that all values are within physically realistic ranges
5. **Data Type Validation**: Verifies columns have correct data types
6. **Duplicate Detection**: Ensures no duplicate rows exist
7. **Physical Consistency**: Validates that pressure-depth relationships are consistent

### Filtering Accuracy Tests (3 tests)
1. **Depth Filtering**: Tests filtering by depth ranges
2. **Geographic Filtering**: Tests filtering by latitude/longitude bounds
3. **Date Filtering**: Tests filtering by date ranges

### Summary Statistics Accuracy Tests (4 tests)
1. **Key Presence**: Verifies summary contains all expected statistical keys
2. **Temperature Range Consistency**: Ensures temperature min/mean/max are logically consistent
3. **Salinity Range Consistency**: Ensures salinity min/mean/max are logically consistent and within bounds
4. **Geographic Coverage Validation**: Verifies latitude/longitude ranges are valid

## Running the Evaluation

To run the data accuracy evaluation:

```bash
cd backend
python data_accuracy_test.py
```

## Interpreting Results

The script outputs accuracy as percentages for each test category:

```
Data Loading Accuracy: 100.00% (5/5 tests passed)
Filtering Accuracy: 100.00% (3/3 tests passed)
Summary Statistics Accuracy: 100.00% (4/4 tests passed)

==================================================
Overall Data Accuracy: 100.00%
Total Tests Passed: 12/12
==================================================
```

The overall accuracy is calculated as: (Total Passed Tests / Total Tests) × 100%

## Example Output Explanation

In the example above:
- **12 tests** were run across all categories
- **12 tests** passed, resulting in **100.00%** overall accuracy
- Each category achieved 100% accuracy, indicating all data processing operations are working correctly

## Data Validation Mechanisms

The system includes built-in data validation mechanisms:

1. **Range Validation**: 
   - Temperature: -2°C to 40°C
   - Salinity: 20 to 45 PSU
   - Latitude: -90° to 90°
   - Longitude: -180° to 180°
   - Depth: 0 to 6000 meters

2. **Physical Consistency Checks**:
   - Pressure-depth relationships
   - Data type validation
   - Duplicate detection

3. **Statistical Integrity**:
   - Min/mean/max consistency
   - Geographic coverage validation

## Customizing the Evaluation

To extend the evaluation, you can:

1. **Add More Test Cases**: Extend the test functions with additional validation scenarios
2. **Modify Thresholds**: Adjust the acceptable ranges for physical consistency checks
3. **Add New Categories**: Create additional test functions for other aspects of data processing

## Integration with Model Accuracy Testing

This data accuracy evaluation complements the model accuracy testing (`model_accuracy_test.py`) by providing a complete picture of system performance:
- **Data Accuracy**: Measures the correctness of data processing operations
- **Model Accuracy**: Measures the correctness of LLM responses

Both evaluations return results as percentages for easy comparison and monitoring.