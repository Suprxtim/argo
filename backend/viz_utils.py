"""
Visualization utilities for Argo data using Matplotlib, Seaborn, and Plotly
"""
import base64
import json
import os
import logging
import uuid
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.io as pio
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from config import Config

# Setup logging
logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Configure matplotlib and seaborn
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

class ArgoVisualizer:
    """Handles creation of visualizations for Argo oceanographic data"""
    
    def __init__(self):
        self.plots_dir = Path(Config.PLOTS_DIR)
        logger.info(f"Initializing ArgoVisualizer with plots_dir: {self.plots_dir.absolute()}")
        logger.info(f"Plots dir from config: {Config.PLOTS_DIR}")
        logger.info(f"Current working directory: {Path.cwd()}")
        logger.info(f"Plots dir resolve: {self.plots_dir.resolve()}")
        self.plots_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Plots directory exists: {self.plots_dir.exists()}")
        
        # Set default figure size and DPI
        plt.rcParams['figure.figsize'] = (12, 8)
        plt.rcParams['figure.dpi'] = 100
        plt.rcParams['savefig.dpi'] = 150
        plt.rcParams['savefig.bbox'] = 'tight'
    
    def create_temperature_depth_profile(self, df: pd.DataFrame, title: str = "Temperature vs Depth Profile") -> Optional[str]:
        """Create temperature-depth profile visualization"""
        try:
            logger.info("Starting temperature depth profile creation")
            
            # Create Plotly figure
            fig = go.Figure()
            
            # Group by profile and plot each one
            profiles = df.groupby('profile_id')
            for profile_id, profile_data in list(profiles)[:10]:  # Limit to first 10 profiles for readability
                fig.add_trace(go.Scatter(
                    x=profile_data['temperature_c'],
                    y=-profile_data['depth_m'],  # Negative depth for oceanographic convention
                    mode='lines+markers',
                    name=f'Profile {profile_id}',
                    line=dict(width=2),
                    marker=dict(size=4)
                ))
            
            fig.update_layout(
                title=title,
                xaxis_title='Temperature (°C)',
                yaxis_title='Depth (m)',
                height=600,
                showlegend=True,
                hovermode='closest'
            )
            
            # Return HTML string instead of file path with proper configuration
            config = {'displayModeBar': True, 'displaylogo': False, 'responsive': True}
            html_string = fig.to_html(include_plotlyjs='cdn', config=config)
            logger.info("Created temperature-depth profile HTML")
            return html_string
            
        except Exception as e:
            logger.error(f"Error creating temperature-depth profile: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    def create_salinity_temperature_scatter(self, df: pd.DataFrame, title: str = "Temperature vs Salinity") -> Optional[str]:
        """Create T-S (Temperature-Salinity) diagram"""
        try:
            # Sample data for better performance
            sample_df = df.sample(n=min(5000, len(df))) if len(df) > 5000 else df
            
            fig = px.scatter(
                sample_df,
                x='salinity_psu',
                y='temperature_c',
                color='depth_m',
                title=title,
                labels={
                    'salinity_psu': 'Salinity (PSU)',
                    'temperature_c': 'Temperature (°C)',
                    'depth_m': 'Depth (m)'
                },
                color_continuous_scale='viridis'
            )
            
            fig.update_layout(height=600)
            
            # Return HTML string instead of file path with proper configuration
            config = {'displayModeBar': True, 'displaylogo': False, 'responsive': True}
            html_string = fig.to_html(include_plotlyjs='cdn', config=config)
            logger.info("Created T-S diagram HTML")
            return html_string
            
        except Exception as e:
            logger.error(f"Error creating T-S diagram: {e}")
            return None
    
    def create_geographic_map(self, df: pd.DataFrame, variable: str = 'temperature_c', title: Optional[str] = None) -> Optional[str]:
        """Create geographic map of measurements"""
        try:
            if title is None:
                title = f"Geographic Distribution of {variable.replace('_', ' ').title()}"
            
            # Get surface data (depth < 50m) for mapping
            surface_df = df[df['depth_m'] < 50].groupby('profile_id').first().reset_index()
            
            # Sample for performance
            sample_df = surface_df.sample(n=min(1000, len(surface_df))) if len(surface_df) > 1000 else surface_df
            
            fig = px.scatter_mapbox(
                sample_df,
                lat='latitude',
                lon='longitude',
                color=variable,
                title=title,
                mapbox_style='open-street-map',
                height=600,
                zoom=1,
                color_continuous_scale='viridis'
            )
            
            # Return HTML string instead of file path with proper configuration
            config = {'displayModeBar': True, 'displaylogo': False, 'responsive': True}
            html_string = fig.to_html(include_plotlyjs='cdn', config=config)
            logger.info("Created geographic map HTML")
            return html_string
            
        except Exception as e:
            logger.error(f"Error creating geographic map: {e}")
            return None
    
    def create_time_series(self, df: pd.DataFrame, variable: str = 'temperature_c', title: Optional[str] = None) -> Optional[str]:
        """Create time series visualization"""
        try:
            if title is None:
                title = f"Time Series of {variable.replace('_', ' ').title()}"
            
            # Group by date and calculate daily averages
            df['date'] = pd.to_datetime(df['date'])
            daily_avg = df.groupby(df['date'].dt.date)[variable].mean().reset_index()
            daily_avg.columns = ['date', variable]
            
            fig = px.line(
                daily_avg,
                x='date',
                y=variable,
                title=title,
                labels={
                    'date': 'Date',
                    variable: variable.replace('_', ' ').title()
                }
            )
            
            fig.update_layout(height=600)
            
            # Return HTML string instead of file path with proper configuration
            config = {'displayModeBar': True, 'displaylogo': False, 'responsive': True}
            html_string = fig.to_html(include_plotlyjs='cdn', config=config)
            logger.info("Created time series HTML")
            return html_string
            
        except Exception as e:
            logger.error(f"Error creating time series: {e}")
            return None
    
    def create_depth_distribution(self, df: pd.DataFrame, title: str = "Depth Distribution of Measurements") -> Optional[str]:
        """Create depth distribution histogram"""
        try:
            fig = px.histogram(
                df,
                x='depth_m',
                nbins=50,
                title=title,
                labels={'depth_m': 'Depth (m)', 'count': 'Number of Measurements'}
            )
            
            fig.update_layout(height=600)
            
            # Return HTML string instead of file path with proper configuration
            config = {'displayModeBar': True, 'displaylogo': False, 'responsive': True}
            html_string = fig.to_html(include_plotlyjs='cdn', config=config)
            logger.info("Created depth distribution HTML")
            return html_string
            
        except Exception as e:
            logger.error(f"Error creating depth distribution: {e}")
            return None
    
    def create_regional_comparison(self, df: pd.DataFrame, variable: str = 'temperature_c', title: Optional[str] = None) -> Optional[str]:
        """Create box plot comparing regions"""
        try:
            if title is None:
                title = f"Regional Comparison of {variable.replace('_', ' ').title()}"
            
            # Ensure lat_zone exists
            if 'lat_zone' not in df.columns:
                df['lat_zone'] = pd.cut(df['latitude'], 
                                       bins=[-90, -60, -30, 0, 30, 60, 90], 
                                       labels=['Antarctic', 'Southern', 'Tropical_S', 'Tropical_N', 'Northern', 'Arctic'])
            
            fig = px.box(
                df,
                x='lat_zone',
                y=variable,
                title=title,
                labels={
                    'lat_zone': 'Latitude Zone',
                    variable: variable.replace('_', ' ').title()
                }
            )
            
            fig.update_layout(height=600)
            
            # Return HTML string instead of file path with proper configuration
            config = {'displayModeBar': True, 'displaylogo': False, 'responsive': True}
            html_string = fig.to_html(include_plotlyjs='cdn', config=config)
            logger.info("Created regional comparison HTML")
            return html_string
            
        except Exception as e:
            logger.error(f"Error creating regional comparison: {e}")
            return None
    
    def create_correlation_heatmap(self, df: pd.DataFrame, title: str = "Correlation Matrix") -> Optional[str]:
        """Create correlation heatmap for numerical variables"""
        try:
            # Select numerical columns
            numerical_cols = ['temperature_c', 'salinity_psu', 'depth_m', 'pressure_dbar', 'latitude', 'longitude']
            numerical_cols = [col for col in numerical_cols if col in df.columns]
            
            # Check if we have enough columns for correlation
            if len(numerical_cols) < 2:
                logger.warning("Not enough numerical columns for correlation matrix")
                return None
                
            # Extract the subset of data for correlation
            data_subset = df[numerical_cols]
            
            # Calculate correlation matrix using pandas directly
            # Convert to float to ensure proper correlation calculation
            float_data = data_subset.select_dtypes(include=[np.number])
            if float_data.empty:
                logger.warning("No numeric data available for correlation")
                return None
                
            corr_matrix = float_data.corr()
            
            fig = px.imshow(
                corr_matrix,
                title=title,
                color_continuous_scale='RdBu_r',
                aspect='auto'
            )
            
            fig.update_layout(height=600)
            
            # Return HTML string instead of file path with proper configuration
            config = {'displayModeBar': True, 'displaylogo': False, 'responsive': True}
            html_string = fig.to_html(include_plotlyjs='cdn', config=config)
            logger.info("Created correlation heatmap HTML")
            return html_string
            
        except Exception as e:
            logger.error(f"Error creating correlation heatmap: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    def create_3d_scatter(self, df: pd.DataFrame, title: str = "3D Ocean Data Visualization") -> Optional[str]:
        """Create 3D scatter plot of temperature, salinity, and depth"""
        try:
            # Sample data for performance
            sample_df = df.sample(n=min(2000, len(df))) if len(df) > 2000 else df
            
            fig = go.Figure(data=[go.Scatter3d(
                x=sample_df['temperature_c'],
                y=sample_df['salinity_psu'],
                z=sample_df['depth_m'],
                mode='markers',
                marker=dict(
                    size=3,
                    color=sample_df['temperature_c'],
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(title="Temperature (°C)")
                ),
                text=[f"Lat: {lat:.2f}, Lon: {lon:.2f}" for lat, lon in zip(sample_df['latitude'], sample_df['longitude'])],
                hovertemplate='<b>Temperature:</b> %{x:.2f}°C<br>' +
                              '<b>Salinity:</b> %{y:.2f} PSU<br>' +
                              '<b>Depth:</b> %{z:.0f}m<br>' +
                              '%{text}<extra></extra>'
            )])
            
            fig.update_layout(
                title=title,
                scene=dict(
                    xaxis_title='Temperature (°C)',
                    yaxis_title='Salinity (PSU)',
                    zaxis_title='Depth (m)'
                ),
                height=700
            )
            
            # Return HTML string instead of file path with proper configuration
            config = {'displayModeBar': True, 'displaylogo': False, 'responsive': True}
            html_string = fig.to_html(include_plotlyjs='cdn', config=config)
            logger.info("Created 3D scatter plot HTML")
            return html_string
            
        except Exception as e:
            logger.error(f"Error creating 3D scatter plot: {e}")
            return None
    
    def suggest_visualization(self, df: pd.DataFrame, query: str) -> List[str]:
        """Suggest appropriate visualizations based on query and data"""
        suggestions = []
        query_lower = query.lower()
        
        try:
            # Basic data info
            has_temp = 'temperature_c' in df.columns
            has_sal = 'salinity_psu' in df.columns
            has_depth = 'depth_m' in df.columns
            has_location = 'latitude' in df.columns and 'longitude' in df.columns
            has_time = 'date' in df.columns
            
            # Suggest based on query content
            if 'profile' in query_lower and has_temp and has_depth:
                suggestions.append('temperature_depth_profile')
            
            if ('salinity' in query_lower and 'temperature' in query_lower) or 't-s' in query_lower:
                if has_temp and has_sal:
                    suggestions.append('ts_diagram')
            
            if 'map' in query_lower or 'geographic' in query_lower or 'location' in query_lower:
                if has_location:
                    suggestions.append('geographic_map')
            
            if 'time' in query_lower or 'trend' in query_lower or 'temporal' in query_lower:
                if has_time:
                    suggestions.append('time_series')
            
            if 'distribution' in query_lower or 'histogram' in query_lower:
                suggestions.append('depth_distribution')
            
            if 'region' in query_lower or 'compare' in query_lower:
                suggestions.append('regional_comparison')
            
            if 'correlation' in query_lower or 'relationship' in query_lower:
                suggestions.append('correlation_heatmap')
            
            if '3d' in query_lower or 'three' in query_lower:
                suggestions.append('3d_scatter')
            
            # Default suggestions if none specific
            if not suggestions:
                if has_temp and has_depth:
                    suggestions.append('temperature_depth_profile')
                if has_location:
                    suggestions.append('geographic_map')
                if has_temp and has_sal:
                    suggestions.append('ts_diagram')
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error suggesting visualizations: {e}")
            return ['temperature_depth_profile']  # Default fallback
    
    def create_visualization(self, df: pd.DataFrame, viz_type: str, **kwargs) -> Optional[str]:
        """Create visualization of specified type"""
        
        viz_methods = {
            'temperature_depth_profile': self.create_temperature_depth_profile,
            'ts_diagram': self.create_salinity_temperature_scatter,
            'geographic_map': self.create_geographic_map,
            'time_series': self.create_time_series,
            'depth_distribution': self.create_depth_distribution,
            'regional_comparison': self.create_regional_comparison,
            'correlation_heatmap': self.create_correlation_heatmap,
            '3d_scatter': self.create_3d_scatter
        }
        
        if viz_type in viz_methods:
            return viz_methods[viz_type](df, **kwargs)
        else:
            logger.warning(f"Unknown visualization type: {viz_type}")
            return self.create_temperature_depth_profile(df)

# Initialize global visualizer
argo_viz = ArgoVisualizer()

def create_plot(df: pd.DataFrame, plot_type: str, **kwargs) -> Optional[str]:
    """Convenience function to create plots"""
    logger.info(f"Creating plot of type: {plot_type} with kwargs: {kwargs}")
    logger.info(f"Current working directory: {Path.cwd()}")
    result = argo_viz.create_visualization(df, plot_type, **kwargs)
    logger.info(f"Plot creation result: {result}")
    return result

def suggest_plots(df: pd.DataFrame, query: str) -> List[str]:
    """Convenience function to suggest plots"""
    return argo_viz.suggest_visualization(df, query)