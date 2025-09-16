"""
Data utilities for downloading and preprocessing Argo datasets
"""
import os
import logging
import ftplib
import requests
import pandas as pd
import numpy as np
import xarray as xr
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from config import Config

# Setup logging
logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL))
logger = logging.getLogger(__name__)

class ArgoDataManager:
    """Manages Argo dataset downloading and preprocessing"""
    
    def __init__(self):
        self.data_dir = Path(Config.ARGO_DATA_DIR)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.cache_file = self.data_dir / "argo_cache.parquet"
        
    def download_sample_data(self) -> bool:
        """
        Download sample Argo data from available sources
        Returns True if successful, False otherwise
        """
        try:
            logger.info("Downloading sample Argo data...")
            
            # Create sample data for demonstration
            # In a real implementation, you would download from actual ARGO sources
            sample_data = self._generate_sample_argo_data()
            
            # Save to cache
            sample_data.to_parquet(self.cache_file)
            logger.info(f"Sample data saved to {self.cache_file}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error downloading Argo data: {e}")
            return False
    
    def _generate_sample_argo_data(self) -> pd.DataFrame:
        """Generate sample Argo-like data for demonstration"""
        np.random.seed(42)
        
        # Generate 1000 sample profiles
        n_profiles = 1000
        n_depths = 50
        
        data = []
        for i in range(n_profiles):
            # Random location (global ocean)
            lat = np.random.uniform(-70, 70)
            lon = np.random.uniform(-180, 180)
            
            # Random date in the last 5 years
            date = pd.Timestamp.now() - pd.Timedelta(days=np.random.randint(0, 1825))
            
            # Generate depth profile
            depths = np.linspace(0, 2000, n_depths)
            
            # Generate realistic temperature profile (warmer at surface, colder at depth)
            surface_temp = 15 + 10 * np.cos(np.radians(lat))  # Temperature varies with latitude
            temperatures = surface_temp * np.exp(-depths / 1000) + np.random.normal(0, 0.5, n_depths)
            
            # Generate realistic salinity profile
            surface_salinity = 35 + np.random.normal(0, 1)
            salinities = surface_salinity + 0.5 * (depths / 1000) + np.random.normal(0, 0.1, n_depths)
            
            for j in range(n_depths):
                data.append({
                    'profile_id': i,
                    'latitude': lat,
                    'longitude': lon,
                    'date': date,
                    'depth_m': depths[j],
                    'temperature_c': temperatures[j],
                    'salinity_psu': salinities[j],
                    'pressure_dbar': depths[j] * 1.025  # Approximate pressure from depth
                })
        
        return pd.DataFrame(data)
    
    def load_data(self) -> Optional[pd.DataFrame]:
        """Load preprocessed Argo data from cache"""
        try:
            if self.cache_file.exists():
                logger.info(f"Loading data from cache: {self.cache_file}")
                return pd.read_parquet(self.cache_file)
            else:
                logger.warning("No cached data found. Downloading sample data...")
                if self.download_sample_data():
                    return pd.read_parquet(self.cache_file)
                else:
                    return None
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return None
    
    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocess Argo data for analysis"""
        try:
            logger.info("Preprocessing Argo data...")
            
            # Remove invalid values
            df = df.dropna(subset=['temperature_c', 'salinity_psu', 'latitude', 'longitude'])
            
            # Filter realistic ranges
            df = df[
                (df['temperature_c'] >= -2) & (df['temperature_c'] <= 40) &
                (df['salinity_psu'] >= 20) & (df['salinity_psu'] <= 45) &
                (df['latitude'] >= -90) & (df['latitude'] <= 90) &
                (df['longitude'] >= -180) & (df['longitude'] <= 180) &
                (df['depth_m'] >= 0) & (df['depth_m'] <= 6000)
            ]
            
            # Add derived columns
            df['year'] = pd.to_datetime(df['date']).dt.year
            df['month'] = pd.to_datetime(df['date']).dt.month
            df['season'] = df['month'].map({
                12: 'Winter', 1: 'Winter', 2: 'Winter',
                3: 'Spring', 4: 'Spring', 5: 'Spring',
                6: 'Summer', 7: 'Summer', 8: 'Summer',
                9: 'Fall', 10: 'Fall', 11: 'Fall'
            })
            
            # Create region bins
            df['lat_zone'] = pd.cut(df['latitude'], 
                                   bins=[-90, -60, -30, 0, 30, 60, 90], 
                                   labels=['Antarctic', 'Southern', 'Tropical_S', 'Tropical_N', 'Northern', 'Arctic'])
            
            logger.info(f"Preprocessed data shape: {df.shape}")
            return df
            
        except Exception as e:
            logger.error(f"Error preprocessing data: {e}")
            return df
    
    def query_data(self, filters: Dict) -> Optional[pd.DataFrame]:
        """Query Argo data with specified filters"""
        try:
            df = self.load_data()
            if df is None:
                return None
            
            df = self.preprocess_data(df)
            
            # Apply filters
            if 'min_depth' in filters:
                df = df[df['depth_m'] >= filters['min_depth']]
            if 'max_depth' in filters:
                df = df[df['depth_m'] <= filters['max_depth']]
            if 'min_lat' in filters:
                df = df[df['latitude'] >= filters['min_lat']]
            if 'max_lat' in filters:
                df = df[df['latitude'] <= filters['max_lat']]
            if 'min_lon' in filters:
                df = df[df['longitude'] >= filters['min_lon']]
            if 'max_lon' in filters:
                df = df[df['longitude'] <= filters['max_lon']]
            if 'start_date' in filters:
                df = df[pd.to_datetime(df['date']) >= pd.to_datetime(filters['start_date'])]
            if 'end_date' in filters:
                df = df[pd.to_datetime(df['date']) <= pd.to_datetime(filters['end_date'])]
            if 'region' in filters:
                df = df[df['lat_zone'] == filters['region']]
            
            logger.info(f"Query returned {len(df)} records")
            return df
            
        except Exception as e:
            logger.error(f"Error querying data: {e}")
            return None
    
    def get_data_summary(self) -> Dict:
        """Get summary statistics of the Argo dataset"""
        try:
            df = self.load_data()
            if df is None:
                return {}
            
            df = self.preprocess_data(df)
            
            summary = {
                'total_profiles': df['profile_id'].nunique(),
                'total_measurements': len(df),
                'date_range': {
                    'start': df['date'].min().strftime('%Y-%m-%d'),
                    'end': df['date'].max().strftime('%Y-%m-%d')
                },
                'depth_range': {
                    'min': float(df['depth_m'].min()),
                    'max': float(df['depth_m'].max())
                },
                'temperature_range': {
                    'min': float(df['temperature_c'].min()),
                    'max': float(df['temperature_c'].max()),
                    'mean': float(df['temperature_c'].mean())
                },
                'salinity_range': {
                    'min': float(df['salinity_psu'].min()),
                    'max': float(df['salinity_psu'].max()),
                    'mean': float(df['salinity_psu'].mean())
                },
                'geographic_coverage': {
                    'lat_range': [float(df['latitude'].min()), float(df['latitude'].max())],
                    'lon_range': [float(df['longitude'].min()), float(df['longitude'].max())]
                }
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting data summary: {e}")
            return {}

# Initialize global data manager
argo_manager = ArgoDataManager()

def get_argo_data(filters: Dict = None) -> Optional[pd.DataFrame]:
    """Convenience function to get Argo data"""
    if filters:
        return argo_manager.query_data(filters)
    else:
        return argo_manager.load_data()

def get_data_summary() -> Dict:
    """Convenience function to get data summary"""
    return argo_manager.get_data_summary()