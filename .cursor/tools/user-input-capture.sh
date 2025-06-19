#!/bin/bash
# User Input Capture Script for Non-Breaking Tool Chains
# Usage: ./user-input-capture.sh "prompt message" [timeout] [default_response] [timeout_action] [response_file]

set -e

# Default values (can be overridden by .cursorrules)
PROMPT_MESSAGE="Please provide input:"
TIMEOUT=300  # 5 minutes default
DEFAULT_RESPONSE=""
TIMEOUT_ACTION="Continue"  # Options: Continue, Wait
RESPONSE_FILE=".cursor/user_response.txt"

# Parse arguments
if [ $# -ge 1 ]; then PROMPT_MESSAGE="$1"; fi
if [ $# -ge 2 ]; then TIMEOUT="$2"; fi
if [ $# -ge 3 ]; then DEFAULT_RESPONSE="$3"; fi
if [ $# -ge 4 ]; then TIMEOUT_ACTION="$4"; fi
if [ $# -ge 5 ]; then RESPONSE_FILE="$5"; fi

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Clear any existing response file
rm -f "$RESPONSE_FILE"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}         USER INPUT REQUIRED${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Prompt:${NC} $PROMPT_MESSAGE"
echo ""
if [ -n "$DEFAULT_RESPONSE" ]; then
    echo -e "${GREEN}Default response (timeout ${TIMEOUT}s):${NC} $DEFAULT_RESPONSE"
fi
echo -e "${CYAN}Timeout action:${NC} $TIMEOUT_ACTION"
echo ""

echo -e "${YELLOW}Please provide your response:${NC}"

# Function to handle timeout
timeout_handler() {
    echo ""
    echo -e "${RED}Timeout reached (${TIMEOUT}s)${NC}"
    
    case "$TIMEOUT_ACTION" in
        "Continue")
            if [ -n "$DEFAULT_RESPONSE" ]; then
                echo -e "${GREEN}Applying default and continuing workflow:${NC} $DEFAULT_RESPONSE"
                echo "$DEFAULT_RESPONSE" > "$RESPONSE_FILE"
            else
                echo -e "${GREEN}Continuing workflow with timeout indicator${NC}"
                echo "timeout_continue" > "$RESPONSE_FILE"
            fi
            echo -e "${CYAN}Workflow will continue automatically${NC}"
            ;;
        "Wait")
            echo -e "${YELLOW}Workflow paused - waiting for user response${NC}"
            echo -e "${YELLOW}Please edit the response file manually: $RESPONSE_FILE${NC}"
            echo "timeout_wait" > "$RESPONSE_FILE"
            ;;
        *)
            echo -e "${RED}Unknown timeout action: $TIMEOUT_ACTION${NC}"
            echo -e "${GREEN}Defaulting to Continue behavior${NC}"
            if [ -n "$DEFAULT_RESPONSE" ]; then
                echo "$DEFAULT_RESPONSE" > "$RESPONSE_FILE"
            else
                echo "timeout_continue" > "$RESPONSE_FILE"
            fi
            ;;
    esac
    
    exit 0
}

# Set up timeout
trap timeout_handler SIGALRM
(sleep "$TIMEOUT" && kill -ALRM $$) &
TIMEOUT_PID=$!

# Read user input
read -r USER_RESPONSE

# Cancel timeout
kill $TIMEOUT_PID 2>/dev/null || true

# Handle empty input
if [ -z "$USER_RESPONSE" ] && [ -n "$DEFAULT_RESPONSE" ]; then
    USER_RESPONSE="$DEFAULT_RESPONSE"
    echo -e "${GREEN}Using default response:${NC} $DEFAULT_RESPONSE"
fi

# Save response to file
echo "$USER_RESPONSE" > "$RESPONSE_FILE"

echo ""
echo -e "${GREEN}Response captured:${NC} $USER_RESPONSE"
echo -e "${GREEN}Saved to:${NC} $RESPONSE_FILE"
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    CONTINUING TOOL CHAIN...${NC}"
echo -e "${BLUE}============================================${NC}"

exit 0 