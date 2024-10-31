import os
import json
from collections import defaultdict

def load_state_file(state_file_path):
    with open(state_file_path, 'r') as file:
        state_data = json.load(file)
    return state_data

def parse_resources(state_data):
    resources = state_data.get('resources', [])
    parsed_resources = defaultdict(dict)

    for resource in resources:
        resource_type = resource.get('type')
        
        for instance in resource.get('instances', []):
            attributes = instance.get('attributes', {})
            resource_id = attributes.get('id', 'N/A')

            if resource_id != 'N/A':
                parsed_resources[resource_type][resource_id] = attributes

    return parsed_resources

def merge_parsed_resources(all_parsed_resources, parsed_resources):
    for resource_type, resources in parsed_resources.items():
        if resource_type in all_parsed_resources:
            all_parsed_resources[resource_type].update(resources)
        else:
            all_parsed_resources[resource_type] = resources

def parse_all_state_files(directory_path):
    all_parsed_resources = defaultdict(dict)

    for root, dirs, files in os.walk(directory_path):
        for file in files:
            if file.endswith('.tfstate'):
                state_file_path = os.path.join(root, file)
                try:
                    state_data = load_state_file(state_file_path)
                    parsed_resources = parse_resources(state_data)
                    merge_parsed_resources(all_parsed_resources, parsed_resources)
                except Exception as e:
                    print(f"Error parsing {state_file_path}: {e}")
    
    return all_parsed_resources

def get_state_file_resources(directory_path):
    return parse_all_state_files(directory_path)