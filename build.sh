#!/bin/bash

# Exit on error
set -e

echo "Starting Unified Build for Netlify..."

# Clean and prepare directory
rm -rf dist
# Standardize to lowercase
mkdir -p dist/ucc-cognition-under-pressure-assessment-test

echo "========================================="
echo "Building Home Directory"
echo "========================================="
cd "ucc-×-renaissance-star-360_-home-directory"
npm install
npm run build
cd ..
# Copy home directory build output to root of dist
cp -r "ucc-×-renaissance-star-360_-home-directory/dist"/* dist/

declare -A APP_MAP

# Map folder names to their intended clean subpaths
APP_MAP=(
  ["ucc-x-renaissance-star-360---algebra-readiness"]="algebra-readiness"
  ["ucc-×-renaissance-star-360_-base-10-&-place-value"]="base-10-place-value"
  ["ucc-×-renaissance-star-360_-key-ideas-&-details"]="key-ideas-details"
  ["ucc-×-renaissance-star-360_-literature-craft-&-structure"]="literature-craft-structure"
  ["ucc-×-renaissance-star-360_-literature-key-ideas-&-details"]="literature-key-ideas-details"
  ["ucc-×-renaissance-star-360_-range-&-complexity"]="range-complexity"
  ["ucc-×-renaissance-star-360_-reading--informational_-craft-&-structure"]="reading-informational-craft-structure"
  ["ucc-×-renaissance-star-360_-test-assessment"]="test-assessment"
  ["ucc-×-renaissance-star-360_-vocabulary"]="vocabulary"
  ["UCC-Renaissance-STAR-360-Geometry-Spatial-main"]="geometry-spatial"
  ["UCC-x-Rennaissance-STAR-360-Measurement-Data-main"]="measurement-data"
  ["UCC-x-Renaissance-Star-360-Fractions---Visual-Ratio-Number-Sense-Lab-main"]="fractions-ratios"
)

# Loop over the apps and build each one
for FOLDER in "${!APP_MAP[@]}"; do
  CLEAN_NAME="${APP_MAP[$FOLDER]}"
  echo "========================================="
  echo "Building Sub-App: $CLEAN_NAME (Folder: $FOLDER)"
  echo "========================================="
  
  if [ -d "$FOLDER" ]; then
    cd "$FOLDER"
    npm install
    npm run build
    cd ..
    
    # Move the output exactly where Netlify expects (lowercase path):
    mkdir -p "dist/ucc-cognition-under-pressure-assessment-test/$CLEAN_NAME"
    cp -r "$FOLDER/dist"/* "dist/ucc-cognition-under-pressure-assessment-test/$CLEAN_NAME/"
  else
    echo "Warning: Folder $FOLDER not found, skipping."
  fi
done

echo "========================================="
echo "Build complete. Output generated in /dist"
echo "========================================="
