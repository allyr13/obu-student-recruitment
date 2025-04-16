#!/bin/bash
PORT=$(python -c "import json; print(json.load(open('config.json'))['port'])")
export FLASK_APP=flask_server.py
exec flask run --host=0.0.0.0 --port=$PORT