#!/usr/bin/env python3
"""
CDSS Inference Script - Mock AI Model for Graduation Project
Simulates a Deep Learning model that predicts pathology and segmentation data
"""

import pandas as pd
import json
import argparse
import os
import sys


# Pathology mapping dictionary
PATHOLOGY_MAPPING = {
    'DCM': 'Dilated Cardiomyopathy',
    'HCM': 'Hypertrophic Cardiomyopathy',
    'HHD': 'Hypertensive Heart Disease',
    'NOR': 'Normal',
    'ARV': 'Arrhythmogenic RV Dysplasia',
    'IHD': 'Ischemic Heart Disease',
    'LVNC': 'Non-Compaction Cardiomyopathy'
}

# CSV file path (assuming it's in the same directory as the script)
CSV_FILE = '211230_M&Ms_Dataset_information_diagnosis_opendataset.csv'


def generate_deterministic_float(hash_value, min_val, max_val):
    """
    Generate a deterministic float value based on hash
    Ensures the same hash always produces the same value
    """
    # Use hash to generate a value between 0 and 1
    normalized = (hash_value % 10000) / 10000.0
    return min_val + (normalized * (max_val - min_val))


def get_lvef_for_pathology(pathology_code, hash_value):
    """
    Generate LVEF based on pathology type and hash for determinism
    """
    if pathology_code == 'DCM':
        # LVEF between 30-45%
        return round(generate_deterministic_float(hash_value, 30.0, 45.0), 2)
    elif pathology_code == 'NOR':
        # LVEF between 55-70%
        return round(generate_deterministic_float(hash_value + 1000, 55.0, 70.0), 2)
    else:
        # LVEF between 45-60% for other pathologies
        return round(generate_deterministic_float(hash_value + 2000, 45.0, 60.0), 2)


def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='CDSS Inference Script - Mock AI Model')
    parser.add_argument('--id', type=str, required=True, help='Patient/Study ID (DICOM UID or code)')
    args = parser.parse_args()
    
    input_id = args.id
    
    # Check if CSV file exists
    if not os.path.exists(CSV_FILE):
        error_msg = {
            'error': f'CSV file not found: {CSV_FILE}',
            'message': 'Please ensure the CSV file is in the same directory as the script'
        }
        print(json.dumps(error_msg))
        sys.exit(1)
    
    try:
        # Load CSV file
        df = pd.read_csv(CSV_FILE)
        
        if df.empty:
            error_msg = {
                'error': 'CSV file is empty',
                'message': 'The dataset file contains no data'
            }
            print(json.dumps(error_msg))
            sys.exit(1)
        
        # Get total number of rows
        total_rows = len(df)
        
        # Deterministic selection using hash
        # Use abs() to ensure positive hash value
        hash_value = abs(hash(input_id))
        index = hash_value % total_rows
        
        # Select the row at the calculated index
        selected_row = df.iloc[index]
        
        # Get pathology code from the selected row
        pathology_code = str(selected_row['Pathology']).strip()
        
        # Map pathology code to full name
        diagnosis = PATHOLOGY_MAPPING.get(pathology_code, pathology_code)
        
        # Get ED and ES frame values (handle potential NaN values)
        ed_frame = int(selected_row['ED']) if pd.notna(selected_row['ED']) else 0
        es_frame = int(selected_row['ES']) if pd.notna(selected_row['ES']) else 0
        
        # Generate deterministic confidence (0.91 to 0.99) based on hash
        confidence = round(generate_deterministic_float(hash_value + 5000, 0.91, 0.99), 4)
        
        # Generate LVEF based on pathology type
        lvef = get_lvef_for_pathology(pathology_code, hash_value)
        
        # Build the output JSON
        output = {
            'diagnosis': diagnosis,
            'confidence': confidence
        }
        
        # Print JSON to stdout
        print(json.dumps(output, indent=2))
        
    except KeyError as e:
        error_msg = {
            'error': 'Missing column in CSV file',
            'message': f'Required column not found: {str(e)}'
        }
        print(json.dumps(error_msg))
        sys.exit(1)
    except Exception as e:
        error_msg = {
            'error': 'Unexpected error occurred',
            'message': str(e)
        }
        print(json.dumps(error_msg))
        sys.exit(1)


if __name__ == '__main__':
    main()

