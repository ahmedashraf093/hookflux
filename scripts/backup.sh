#!/bin/bash
DATE=$(date +%Y-%m-%d)
cp /app/data.db /app/backups/data.db.$DATE
# Keep only last 7 days
find /app/backups -name 'data.db.*' -mtime +7 -delete
