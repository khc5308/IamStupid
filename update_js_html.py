import os
import glob
import re

# 1. HTML Files
html_files = glob.glob('template/*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove script tags
    content = re.sub(r'<script\s+src="\.\./data/f1-data\.js"></script>\s*', '', content)
    content = re.sub(r'<script\s+src="\.\./data/f1-faq\.js"></script>\s*', '', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. JS Files
js_data_files = ['dashboard.js', 'teams.js', 'tracks.js', 'events.js', 'machines.js']
js_data_header = """let teams = [];
let tracks = [];
let machines = [];
let raceEvents = [];
let ALL_DRIVERS = [];
let drivers = [];

"""
js_data_fetch = """document.addEventListener('DOMContentLoaded', async function() {
  try {
    const res = await fetch('/data/f1-data.json');
    const data = await res.json();
    teams = data.teams || [];
    tracks = data.tracks || [];
    machines = data.machines || [];
    raceEvents = data.raceEvents || [];
    ALL_DRIVERS = data.ALL_DRIVERS || [];
  } catch (e) { console.error('Failed to load f1-data', e); }
"""

for js_file in js_data_files:
    path = os.path.join('js', js_file)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "let teams =" not in content:
            content = content.replace("document.addEventListener('DOMContentLoaded', function() {", js_data_fetch)
            # Find the first line after comments and insert header
            lines = content.split('\n')
            insert_idx = 0
            for i, line in enumerate(lines):
                if line.strip() and not line.strip().startswith('//'):
                    insert_idx = i
                    break
            
            lines.insert(insert_idx, js_data_header)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines))


# FAQ
faq_path = 'js/faq.js'
if os.path.exists(faq_path):
    with open(faq_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if "let faqCategories" not in content:
        faq_header = "let faqCategories = {};\nlet faqs = [];\n\n"
        faq_fetch = """document.addEventListener('DOMContentLoaded', async function() {
  try {
    const res = await fetch('/data/f1-faq.json');
    const data = await res.json();
    faqCategories = data.faqCategories || {};
    faqs = data.faqs || [];
  } catch (e) { console.error('Failed to load f1-faq', e); }
"""
        content = content.replace("document.addEventListener('DOMContentLoaded', function() {", faq_fetch)
        
        lines = content.split('\n')
        insert_idx = 0
        for i, line in enumerate(lines):
            if line.strip() and not line.strip().startswith('//'):
                insert_idx = i
                break
        
        lines.insert(insert_idx, faq_header)
        
        with open(faq_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))

print("JS and HTML files updated.")
