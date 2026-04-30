#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Create admin user
python create_admin.py xarukane xarukane@example.com xarukane
