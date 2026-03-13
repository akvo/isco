#!/bin/bash

# Navigate to the correct directory if needed (assuming run from frontend root)
echo "Installing dependencies and running export script inside Docker..."
docker compose run --rm frontend sh -c 'npm install --no-save @babel/register @babel/core @babel/preset-env @babel/preset-react xlsx html-to-text --legacy-peer-deps && node extract.js && npm uninstall --no-save @babel/register @babel/core @babel/preset-env @babel/preset-react xlsx html-to-text && git checkout package.json package-lock.json yarn.lock 2>/dev/null || true'

echo "Done."
