import json

def get_config(key, filename='config.json'):
    """Reads a specific key from a JSON config file."""
    try:
        with open(filename, 'r') as file:
            config = json.load(file)
            return config.get(key)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading config: {e}")
        return None 

def edit_json_data(json_string, key, value):
    """
    Adds or updates the key-value pair in the given JSON string.
    
    Args:
        json_string (str): The JSON string to be edited.
        key (str): The key to be added or updated in the JSON object.
        value (str): The value to be assigned to the key.
        
    Returns:
        str: The updated JSON string with the added or updated key-value pair.
    """
    data = json.loads(json_string)

    data[key] = value

    return json.dumps(data)