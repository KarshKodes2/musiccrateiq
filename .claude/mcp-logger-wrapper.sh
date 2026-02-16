#!/bin/bash

# MCP Logger Wrapper Script
# Logs all MCP server inputs and outputs to .claude/mcp-logs/

# Get the server name from the first argument
SERVER_NAME="$1"
shift

# Create logs directory if it doesn't exist
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/mcp-logs"
mkdir -p "$LOG_DIR"

# Generate timestamp-based log file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/${SERVER_NAME}_${TIMESTAMP}.log"

# Log start
echo "=== MCP Server: $SERVER_NAME ===" >> "$LOG_FILE"
echo "Started at: $(date)" >> "$LOG_FILE"
echo "Command: $@" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Run the actual MCP server with logging
# Use 'script' to capture all I/O
exec "$@" 2>&1 | tee -a "$LOG_FILE"
