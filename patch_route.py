import glob

html_files = glob.glob('template/*.html')
js_files = glob.glob('js/*.js')

for fpath in html_files + js_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('href="/events"', 'href="/Grand-Prix"')
    content = content.replace("fetch('/events/last')", "fetch('/Grand-Prix/last')")
    content = content.replace("fetch(`/events/${currentYear}`)", "fetch(`/Grand-Prix/${currentYear}`)")
    content = content.replace("fetch(`/events/${year}`)", "fetch(`/Grand-Prix/${year}`)")
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('@app.get("/events")', '@app.get("/Grand-Prix")')
content = content.replace('@app.get("/events/last")', '@app.get("/Grand-Prix/last")')
content = content.replace('@app.get("/events/{year}")', '@app.get("/Grand-Prix/{year}")')

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
