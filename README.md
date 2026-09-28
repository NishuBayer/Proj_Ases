# Assessment Center

A Flask web application that provides an assessment instruction page and an interactive examination interface.

## Requirements

- Python 3.9 or newer

## Run locally

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## Project structure

- `app.py` — Flask server and API endpoints
- `templates/` — Jinja HTML templates
- `static/css/` — styling
- `static/js/` — assessment behavior
- `static/images/` — supplied assessment status icons
