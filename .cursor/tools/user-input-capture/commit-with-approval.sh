#!/bin/bash
# Commit with User Approval Script
# Applies configured defaults from .cursorrules for commit behavior
# Usage: ./commit-with-approval.sh "commit message" [timeout] [branch]

set -e

# Default values from .cursorrules
COMMIT_MESSAGE="$1"
TIMEOUT="${2:-300}"  # 5 minutes default from .cursorrules
BRANCH="${3:-main}"
RESPONSE_FILE=".cursor/tools/user-input-capture/commit_response.txt"

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Validate commit message provided
if [ -z "$COMMIT_MESSAGE" ]; then
    echo -e "${RED}Error: Commit message required${NC}"
    echo "Usage: $0 \"commit message\" [timeout] [branch]"
    exit 1
fi

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}         GIT COMMIT APPROVAL${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Show current git status
echo -e "${YELLOW}Current git status:${NC}"
git status --short
echo ""

# Show what will be committed
echo -e "${YELLOW}Changes to be committed:${NC}"
git diff --cached --stat || echo "No staged changes"
echo ""

# Show unstaged changes that will be added
echo -e "${YELLOW}Unstaged changes that will be added:${NC}"
git diff --stat || echo "No unstaged changes"
echo ""

echo -e "${CYAN}Proposed commit message:${NC} $COMMIT_MESSAGE"
echo -e "${CYAN}Target branch:${NC} $BRANCH"
echo ""

# Apply configured defaults from .cursorrules
# Check mode setting (always-ask vs insanity mode)
MODE_LINE=$(grep -E "^\s*-\s*\*\*Default Mode\*\*:" .cursorrules | head -1)
if [[ "$MODE_LINE" == *"insanity"* ]]; then
    RESPONSE="approve"
    echo -e "${CYAN}Insanity mode detected - auto-approving commit${NC}"
else
    RESPONSE="reject"
    echo -e "${CYAN}Always-ask mode detected - applying default (reject)${NC}"
fi

echo ""
echo -e "${CYAN}Processing response:${NC} $RESPONSE"

case "$RESPONSE" in
    "yes"|"approve"|"y")
        echo -e "${GREEN}Commit approved. Proceeding...${NC}"
        
        # Add all changes
        git add -A
        
        # Create commit
        git commit -m "$COMMIT_MESSAGE"
        
        # Get the commit SHA
        COMMIT_SHA=$(git rev-parse HEAD)
        
        echo -e "${GREEN}Commit successful!${NC}"
        echo -e "${GREEN}Commit SHA:${NC} $COMMIT_SHA"
        echo -e "${GREEN}Message:${NC} $COMMIT_MESSAGE"
        
        # Save commit info for workflow tracking
        echo "$COMMIT_SHA" > .cursor/tools/user-input-capture/last_commit_sha.txt
        echo "$COMMIT_MESSAGE" > .cursor/tools/user-input-capture/last_commit_message.txt
        
        echo ""
        echo -e "${BLUE}============================================${NC}"
        echo -e "${BLUE}    COMMIT COMPLETED SUCCESSFULLY${NC}"
        echo -e "${BLUE}============================================${NC}"
        ;;
    "no"|"reject"|"n"|"timeout_continue"|"default_timeout_response")
        echo -e "${YELLOW}Commit rejected (default behavior).${NC}"
        echo -e "${YELLOW}Workflow will continue without committing.${NC}"
        echo -e "${CYAN}To commit later, run: .cursor/tools/user-input-capture/commit-with-approval.sh \"message\"${NC}"
        exit 1
        ;;
    "timeout_wait")
        echo -e "${YELLOW}Timeout reached - waiting for manual intervention${NC}"
        echo -e "${YELLOW}Please run this script again when ready to commit${NC}"
        exit 1
        ;;
    *)
        # Treat any other response as a new commit message
        echo -e "${CYAN}Using custom commit message:${NC} $RESPONSE"
        
        # Add all changes
        git add -A
        
        # Create commit with custom message
        git commit -m "$RESPONSE"
        
        # Get the commit SHA
        COMMIT_SHA=$(git rev-parse HEAD)
        
        echo -e "${GREEN}Commit successful with custom message!${NC}"
        echo -e "${GREEN}Commit SHA:${NC} $COMMIT_SHA"
        echo -e "${GREEN}Message:${NC} $RESPONSE"
        
        # Save commit info for workflow tracking
        echo "$COMMIT_SHA" > .cursor/tools/user-input-capture/last_commit_sha.txt
        echo "$RESPONSE" > .cursor/tools/user-input-capture/last_commit_message.txt
        
        echo ""
        echo -e "${BLUE}============================================${NC}"
        echo -e "${BLUE}    COMMIT COMPLETED SUCCESSFULLY${NC}"
        echo -e "${BLUE}============================================${NC}"
        ;;
esac

exit 0 