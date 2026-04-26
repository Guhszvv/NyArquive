#!/usr/bin/env bash

set -e  

FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
BUILD_SCRIPT="scripts/build.sh"

# ===== COLORS =====
BLUE="\e[34m"
GREEN="\e[32m"
RED="\e[31m"
YELLOW="\e[33m"
RESET="\e[0m"

info()    { echo -e "${BLUE}[INFO]${RESET} $1"; }
success() { echo -e "${GREEN}[OK]${RESET} $1"; }
error()   { echo -e "${RED}[ERROR]${RESET} $1"; exit 1; }

clear

info "Creating ./books folder"
mkdir -p ./books

info "Installing frontend dependencies..."
cd "$FRONTEND_DIR" && npm install > ../scripts/build.log 2>&1 && cd ..

info "Setting up environment..."
if [ ! -f "$FRONTEND_DIR/.env" ]; then
  cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"
  echo -e "${YELLOW}[WARN] Configure frontend/.env (VITE_API_URL)${RESET}"
else
  info ".env already exists, skipping..."
fi

info "Installing backend dependencies..."
cd "$BACKEND_DIR" && npm install > ../scripts/build.log 2>&1 && cd ..

info "Running build script..."
chmod +x "$BUILD_SCRIPT"
"$BUILD_SCRIPT"

success "Installation complete!"