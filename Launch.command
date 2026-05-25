#!/bin/bash

# Determine directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================="
echo "      Starting Task Manager Server"
echo "========================================="

# Start Vite dev server in background and track process ID
npm run dev &
VITE_PID=$!

# Wait for server to initialize
sleep 1.5

# Open default web browser to the app URL
open http://localhost:5173

echo ""
echo "Server is running on http://localhost:5173"
echo "========================================="
echo "IMPORTANT: Do NOT close this Terminal window,"
echo "otherwise the server will stop."
echo "Press Ctrl+C here to stop the server manually."
echo "========================================="

# Trap termination signals to kill the background Vite process
trap "echo 'Shutting down server...'; kill $VITE_PID; exit" EXIT INT TERM

# Hold terminal open and wait for server process
wait
