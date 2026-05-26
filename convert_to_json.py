import json
import re

# 1. Extract from main.py
with open('./main.py', 'r', encoding='utf-8') as f:
    main_py = f.read()

# Find MANUAL_STATS using regex
match = re.search(r'MANUAL_STATS = (\{.*?\})\n\n', main_py, re.DOTALL)
if match:
    manual_stats_str = match.group(1)
    # The dictionary in main.py is standard python dict, which is JSON compatible (except for booleans maybe, but here it's just strings/ints)
    manual_stats = eval(manual_stats_str)
    with open('./data/manual_stats.json', 'w', encoding='utf-8') as f:
        json.dump(manual_stats, f, indent=2, ensure_ascii=False)

# 2. Extract from drivers.js
with open('./js/drivers.js', 'r', encoding='utf-8') as f:
    drivers_js = f.read()

def js_obj_to_dict(js_str):
    # This is a basic conversion, assumes no complex JS syntax
    # Add quotes around keys
    s = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', js_str)
    # Convert single quotes to double quotes
    s = s.replace("'", '"')
    # Remove trailing commas
    s = re.sub(r',\s*\}', '}', s)
    s = re.sub(r',\s*\]', ']', s)
    return json.loads(s)

match = re.search(r'const NATIONALITY_FLAGS = (\{.*?\});', drivers_js, re.DOTALL)
if match:
    with open('./data/nationality_flags.json', 'w', encoding='utf-8') as f:
        json.dump(js_obj_to_dict(match.group(1)), f, indent=2, ensure_ascii=False)

match = re.search(r'const ACTIVE_2026_DRIVERS = (\{.*?\});', drivers_js, re.DOTALL)
if match:
    with open('./data/active_2026_drivers.json', 'w', encoding='utf-8') as f:
        json.dump(js_obj_to_dict(match.group(1)), f, indent=2, ensure_ascii=False)

match = re.search(r'const DRIVER_IMAGES = (\{.*?\});', drivers_js, re.DOTALL)
if match:
    with open('./data/driver_images.json', 'w', encoding='utf-8') as f:
        json.dump(js_obj_to_dict(match.group(1)), f, indent=2, ensure_ascii=False)

print("Conversion completed.")
