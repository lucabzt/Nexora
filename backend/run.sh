#!/bin/bash

# Try to activate Windows-style venv, fallback to Unix-style
if ! source venv/Scripts/activate 2>/dev/null; then
    echo "Windows-style venv activation failed. Trying Unix-style..."
    if ! source venv/bin/activate 2>/dev/null; then
        echo "Failed to activate virtual environment."
        exit 1
    fi
fi

python ./run_dev.py
