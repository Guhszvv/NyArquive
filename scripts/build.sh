#!/usr/bin/env bash

FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
BUILD_DIR="dist"

# ===== COLORS =====
BLUE="\e[34m"
GREEN="\e[32m"
RED="\e[31m"
YELLOW="\e[33m"
RESET="\e[0m"

info()    { echo -e "${BLUE}[INFO]${RESET} $1"; }
success() { echo -e "${GREEN}[OK]${RESET} $1"; }
error()   { echo -e "${RED}[ERROR]${RESET} $1"; exit 1; }

info "Starting Building"

# ===== VALIDATION =====
[ -d "$FRONTEND_DIR" ] || error "Frontend folder does not exist"
[ -d "$BACKEND_DIR"  ] || error "Backend folder does not exist"

# ===== LOAD FNM =====
eval "$(fnm env)" || error "fnm not loaded"

# ===== Build =====
info "Creating Build"

cd "$FRONTEND_DIR" || error "Failed to enter frontend directory"

npm run build > ../scripts/build.log 2>&1 &
PID=$!

spinner="/-\\|"
while kill -0 $PID 2>/dev/null; do
    for i in 0 1 2 3; do
        printf "\r[%c] Building..." "${spinner:$i:1}"
        sleep 0.1
    done
done

wait $PID
STATUS=$?

if [ $STATUS -ne 0 ]; then
    error "\nnpm run build failed. See build.log"
fi

success "\r[✔] Build generated"

[ -d "$BUILD_DIR" ] || error "Build does not exist"

# ===== COPY BUILD =====
info "Copying build to backend"

cp -r "$BUILD_DIR" "../$BACKEND_DIR" || error "Failed to copy build"

rm -rf ../scripts/build.log

success "Successfully built"