#!/usr/bin/env python3
"""
Script to evaluate the accuracy of data processing and numerical calculations
"""
import os
import sys
import pandas as pd
import numpy as np

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from data_utils import ArgoDataManager

def test_data_loading_accuracy():
    """Test the accuracy of data loading and basic statistics"""
    print("Testing data loading accuracy...")
    
    # Initialize data manager
    data_manager = ArgoDataManager()
    
    # Load data
    df = data_manager.load_data()
    
    if df is None:
        print("❌ Failed to load data")
        return 0, 1
    
    print(f"✅ Data loaded successfully with {len(df)} records")
    
    # Check basic data structure
    expected_columns = ['profile_id', 'latitude', 'longitude', 'date', 'depth_m', 'temperature_c', 'salinity_psu', 'pressure_dbar']
    missing_columns = [col for col in expected_columns if col not in df.columns]
    
    if missing_columns:
        print(f"❌ Missing columns: {missing_columns}")
        return 0, 1
    else:
        print("✅ All expected columns present")
    
    # Test data integrity
    tests_passed = 0
    total_tests = 5
    
    # Test 1: Check for NaN values in critical columns
    critical_columns = ['temperature_c', 'salinity_psu', 'latitude', 'longitude']
    nan_counts = {col: df[col].isna().sum() for col in critical_columns}
    
    if all(count == 0 for count in nan_counts.values()):
        print("✅ No NaN values in critical columns")
        tests_passed += 1
    else:
        print(f"❌ Found NaN values: {nan_counts}")
    
    # Test 2: Check value ranges
    temp_range_check = (df['temperature_c'] >= -2) & (df['temperature_c'] <= 40)
    salinity_range_check = (df['salinity_psu'] >= 20) & (df['salinity_psu'] <= 45)
    lat_range_check = (df['latitude'] >= -90) & (df['latitude'] <= 90)
    lon_range_check = (df['longitude'] >= -180) & (df['longitude'] <= 180)
    
    if temp_range_check.all() and salinity_range_check.all() and lat_range_check.all() and lon_range_check.all():
        print("✅ All values within expected ranges")
        tests_passed += 1
    else:
        print("❌ Some values outside expected ranges")
        print(f"  Temperature range violations: {len(df[~temp_range_check])}")
        print(f"  Salinity range violations: {len(df[~salinity_range_check])}")
        print(f"  Latitude range violations: {len(df[~lat_range_check])}")
        print(f"  Longitude range violations: {len(df[~lon_range_check])}")
    
    # Test 3: Check data types
    expected_types = {
        'profile_id': (np.integer, int),
        'latitude': (np.floating, float),
        'longitude': (np.floating, float),
        'depth_m': (np.floating, float),
        'temperature_c': (np.floating, float),
        'salinity_psu': (np.floating, float),
        'pressure_dbar': (np.floating, float)
    }
    
    type_checks = []
    for col, expected_type in expected_types.items():
        if col in df.columns:
            actual_type = df[col].dtype
            # Check if actual type is one of the expected types
            if isinstance(actual_type, expected_type) or issubclass(actual_type.type, expected_type):
                type_checks.append(True)
            else:
                type_checks.append(False)
        else:
            type_checks.append(False)
    
    if all(type_checks):
        print("✅ All columns have correct data types")
        tests_passed += 1
    else:
        print("❌ Some columns have incorrect data types")
        for i, (col, expected_type) in enumerate(expected_types.items()):
            if not type_checks[i]:
                print(f"  {col}: expected {expected_type}, got {df[col].dtype}")
    
    # Test 4: Check for duplicate rows
    duplicates = df.duplicated().sum()
    if duplicates == 0:
        print("✅ No duplicate rows found")
        tests_passed += 1
    else:
        print(f"❌ Found {duplicates} duplicate rows")
    
    # Test 5: Check data consistency (pressure should correlate with depth)
    if 'depth_m' in df.columns and 'pressure_dbar' in df.columns:
        # Pressure should be approximately 1.025 times depth
        pressure_depth_ratio = df['pressure_dbar'] / (df['depth_m'] + 1e-8)  # Add small value to avoid division by zero
        ratio_mean = pressure_depth_ratio.mean()
        ratio_std = pressure_depth_ratio.std()
        
        # Expected ratio is around 1.025 with some variance
        if abs(ratio_mean - 1.025) < 0.1 and ratio_std < 0.5:
            print(f"✅ Pressure-depth relationship is consistent (ratio: {ratio_mean:.3f} ± {ratio_std:.3f})")
            tests_passed += 1
        else:
            print(f"❌ Pressure-depth relationship seems inconsistent (ratio: {ratio_mean:.3f} ± {ratio_std:.3f})")
    else:
        print("❌ Missing depth or pressure columns for consistency check")
    
    accuracy = tests_passed / total_tests
    print(f"Data Loading Accuracy: {accuracy:.2%} ({tests_passed}/{total_tests} tests passed)")
    return tests_passed, total_tests

def test_filtering_accuracy():
    """Test the accuracy of data filtering operations"""
    print("\nTesting filtering accuracy...")
    
    # Initialize data manager
    data_manager = ArgoDataManager()
    
    # Load data
    df = data_manager.load_data()
    if df is None:
        print("❌ Failed to load data for filtering test")
        return 0, 1
    
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Depth filtering
    filtered_df = data_manager.query_data({'min_depth': 100, 'max_depth': 500})
    
    if filtered_df is not None:
        # Check that all filtered values are within range
        depth_check = (filtered_df['depth_m'] >= 100) & (filtered_df['depth_m'] <= 500)
        if depth_check.all():
            print("✅ Depth filtering works correctly")
            tests_passed += 1
        else:
            print("❌ Depth filtering failed - some values outside range")
    else:
        print("❌ Depth filtering returned None")
    
    # Test 2: Geographic filtering
    filtered_df = data_manager.query_data({'min_lat': 30, 'max_lat': 60, 'min_lon': -20, 'max_lon': 20})
    
    if filtered_df is not None:
        lat_check = (filtered_df['latitude'] >= 30) & (filtered_df['latitude'] <= 60)
        lon_check = (filtered_df['longitude'] >= -20) & (filtered_df['longitude'] <= 20)
        
        if lat_check.all() and lon_check.all():
            print("✅ Geographic filtering works correctly")
            tests_passed += 1
        else:
            print("❌ Geographic filtering failed")
    else:
        print("❌ Geographic filtering returned None")
    
    # Test 3: Date filtering
    filtered_df = data_manager.query_data({'start_date': '2020-01-01', 'end_date': '2022-12-31'})
    
    if filtered_df is not None:
        try:
            dates = pd.to_datetime(filtered_df['date'])
            start_check = (dates >= pd.to_datetime('2020-01-01')).all()
            end_check = (dates <= pd.to_datetime('2022-12-31')).all()
            
            if start_check and end_check:
                print("✅ Date filtering works correctly")
                tests_passed += 1
            else:
                print("❌ Date filtering failed")
        except Exception as e:
            print(f"❌ Error in date filtering test: {e}")
    else:
        print("❌ Date filtering returned None")
    
    accuracy = tests_passed / total_tests
    print(f"Filtering Accuracy: {accuracy:.2%} ({tests_passed}/{total_tests} tests passed)")
    return tests_passed, total_tests

def test_summary_statistics_accuracy():
    """Test the accuracy of summary statistics calculations"""
    print("\nTesting summary statistics accuracy...")
    
    # Initialize data manager
    data_manager = ArgoDataManager()
    
    # Get summary
    summary = data_manager.get_data_summary()
    
    if not summary:
        print("❌ Failed to get data summary")
        return 0, 1
    
    tests_passed = 0
    total_tests = 4
    
    # Test 1: Check that summary contains expected keys
    expected_keys = ['total_profiles', 'total_measurements', 'date_range', 'depth_range', 'temperature_range', 'salinity_range', 'geographic_coverage']
    missing_keys = [key for key in expected_keys if key not in summary]
    
    if not missing_keys:
        print("✅ Summary contains all expected keys")
        tests_passed += 1
    else:
        print(f"❌ Summary missing keys: {missing_keys}")
    
    # Test 2: Check that ranges make sense
    if 'temperature_range' in summary:
        temp_min = summary['temperature_range']['min']
        temp_max = summary['temperature_range']['max']
        temp_mean = summary['temperature_range']['mean']
        
        if temp_min <= temp_mean <= temp_max:
            print("✅ Temperature range statistics are consistent")
            tests_passed += 1
        else:
            print(f"❌ Temperature range statistics inconsistent: min={temp_min}, mean={temp_mean}, max={temp_max}")
    
    # Test 3: Check that salinity ranges make sense
    if 'salinity_range' in summary:
        sal_min = summary['salinity_range']['min']
        sal_max = summary['salinity_range']['max']
        sal_mean = summary['salinity_range']['mean']
        
        if sal_min <= sal_mean <= sal_max and sal_min >= 20 and sal_max <= 45:
            print("✅ Salinity range statistics are consistent and within expected bounds")
            tests_passed += 1
        else:
            print(f"❌ Salinity range statistics inconsistent or out of bounds: min={sal_min}, mean={sal_mean}, max={sal_max}")
    
    # Test 4: Check that geographic coverage makes sense
    if 'geographic_coverage' in summary:
        lat_range = summary['geographic_coverage']['lat_range']
        lon_range = summary['geographic_coverage']['lon_range']
        
        if -90 <= lat_range[0] <= 90 and -90 <= lat_range[1] <= 90 and -180 <= lon_range[0] <= 180 and -180 <= lon_range[1] <= 180:
            print("✅ Geographic coverage is within valid bounds")
            tests_passed += 1
        else:
            print(f"❌ Geographic coverage out of bounds: lat={lat_range}, lon={lon_range}")
    
    accuracy = tests_passed / total_tests
    print(f"Summary Statistics Accuracy: {accuracy:.2%} ({tests_passed}/{total_tests} tests passed)")
    return tests_passed, total_tests

def evaluate_data_accuracy():
    """Evaluate overall data processing accuracy"""
    print("Data Accuracy Evaluation")
    print("=" * 30)
    
    # Run all tests
    loading_passed, loading_total = test_data_loading_accuracy()
    filtering_passed, filtering_total = test_filtering_accuracy()
    summary_passed, summary_total = test_summary_statistics_accuracy()
    
    # Calculate overall accuracy
    total_passed = loading_passed + filtering_passed + summary_passed
    total_tests = loading_total + filtering_total + summary_total
    
    overall_accuracy = total_passed / total_tests if total_tests > 0 else 0
    
    print(f"\n{'='*50}")
    print(f"Overall Data Accuracy: {overall_accuracy:.2%}")
    print(f"Total Tests Passed: {total_passed}/{total_tests}")
    print(f"{'='*50}")
    
    return overall_accuracy

if __name__ == "__main__":
    evaluate_data_accuracy()