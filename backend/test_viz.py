import pandas as pd
import numpy as np
from viz_utils import create_plot

# Create a simple test dataset
data = pd.DataFrame({
    'profile_id': [1, 1, 1, 2, 2, 2],
    'depth_m': [0, 100, 200, 0, 100, 200],
    'temperature_c': [25, 15, 5, 20, 10, 3],
    'salinity_psu': [35, 35.5, 36, 34, 34.5, 35],
    'latitude': [10, 10, 10, 40, 40, 40],
    'longitude': [-60, -60, -60, -40, -40, -40],
    'date': pd.date_range('2020-01-01', periods=6)
})

print("Test data:")
print(data)

# Test creating a temperature depth profile
print("\nCreating temperature depth profile...")
plot_url = create_plot(data, 'temperature_depth_profile', title="Test Plot")
print(f"Plot URL: {plot_url}")