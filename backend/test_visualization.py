"""
Test script to verify visualization functionality
"""
import os
import sys
import pandas as pd
import numpy as np

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from viz_utils import create_plot
from data_utils import get_argo_data

def test_visualization():
    """Test that visualizations work properly"""
    print("Testing visualization functionality...")
    
    try:
        # Load sample data
        print("Loading Argo data...")
        data = get_argo_data()
        
        if data is not None and len(data) > 0:
            print(f"✓ Loaded {len(data)} records successfully")
            
            # Test creating a simple plot
            print("Creating test visualization...")
            sample_data = data.head(1000)  # Use a sample for faster testing
            
            # Try to create a temperature-depth profile
            plot_result = create_plot(
                sample_data, 
                'temperature_depth_profile',
                title='Test Temperature-Depth Profile'
            )
            
            if plot_result:
                print("✓ Visualization created successfully")
                # Check if it's an HTML string (which means it will display in chat)
                if plot_result.startswith('<html>') or '<div' in plot_result:
                    print("✓ Visualization is properly formatted for direct chat display")
                else:
                    print("? Visualization returned a file path instead of HTML")
            else:
                print("✗ Failed to create visualization")
        else:
            print("✗ Failed to load data")
            
    except Exception as e:
        print(f"Error testing visualization: {e}")

if __name__ == "__main__":
    test_visualization()