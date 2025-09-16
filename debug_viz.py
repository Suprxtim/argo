"""
Debug script to check the actual HTML content being generated
"""
import sys
import os

# Add the backend directory to the path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Set the current working directory to backend for proper imports
os.chdir(backend_path)

from viz_utils import create_plot
import pandas as pd

# Create a simple test dataset
test_data = pd.DataFrame({
    'profile_id': [1, 1, 1, 2, 2, 2],
    'temperature_c': [20, 18, 15, 22, 20, 17],
    'depth_m': [10, 50, 100, 20, 60, 120],
    'salinity_psu': [35.0, 35.2, 35.5, 34.8, 35.1, 35.3],
    'latitude': [40.0, 40.1, 40.2, 41.0, 41.1, 41.2],
    'longitude': [-70.0, -70.1, -70.2, -71.0, -71.1, -71.2],
    'date': pd.to_datetime(['2023-01-01', '2023-01-01', '2023-01-01', 
                           '2023-01-02', '2023-01-02', '2023-01-02'])
})

print("Testing visualization creation...")

# Test temperature depth profile
print("Creating temperature depth profile...")
plot_html = create_plot(test_data, 'temperature_depth_profile')
print("HTML content length:", len(plot_html) if plot_html else 0)
print("Starts with <!DOCTYPE html>:", plot_html.startswith('<!DOCTYPE html>') if plot_html else False)
print("Contains <div:", '<div' in plot_html if plot_html else False)
print("Contains plotly:", 'plotly' in plot_html if plot_html else False)
print("First 200 characters:")
if plot_html:
    print(plot_html[:200])
    
print("\n" + "="*50 + "\n")

# Test T-S diagram
print("Creating T-S diagram...")
plot_html = create_plot(test_data, 'ts_diagram')
print("HTML content length:", len(plot_html) if plot_html else 0)
print("Starts with <!DOCTYPE html>:", plot_html.startswith('<!DOCTYPE html>') if plot_html else False)
print("Contains <div:", '<div' in plot_html if plot_html else False)
print("Contains plotly:", 'plotly' in plot_html if plot_html else False)
print("First 200 characters:")
if plot_html:
    print(plot_html[:200])