#!/bin/bash
# Archive Recovery Script
# Usage: ./restore-from-archive.sh [ARCHIVE_ID] [OPTIONS]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
ARCHIVE_DIR="$PROJECT_ROOT/.cursor/archive"
ARCHIVE_INDEX="$PROJECT_ROOT/.cursor/tools/archive-index.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_usage() {
    echo "Archive Recovery Script"
    echo "Usage: $0 [ARCHIVE_ID] [OPTIONS]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help       Show this help message"
    echo "  -l, --list       List all available archives"
    echo "  -f, --full       Full restoration (replace current file)"
    echo "  -m, --merge      Merge archived content with current"
    echo "  -c, --context    Extract context only (temporary injection)"
    echo "  -b, --backup     Create backup before restoration"
    echo "  -v, --verify     Verify archive integrity before restore"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 -l                           List all archives"
    echo "  $0 ARC-WF-20250116-001         Extract context from archive"
    echo "  $0 ARC-WF-20250116-001 -f -b   Full restore with backup"
    echo "  $0 ARC-WF-20250116-001 -m      Merge archive with current"
}

list_archives() {
    echo -e "${GREEN}Available Archives:${NC}"
    if [ -f "$ARCHIVE_INDEX" ]; then
        echo ""
        grep -E "^\| ARC-" "$ARCHIVE_INDEX" | head -20
        echo ""
        echo "Full archive index: .cursor/tools/archive-index.md"
    else
        echo -e "${RED}Archive index not found: $ARCHIVE_INDEX${NC}"
        exit 1
    fi
}

find_archive() {
    local archive_id="$1"
    if [ -f "$ARCHIVE_INDEX" ]; then
        grep -E "^\| $archive_id" "$ARCHIVE_INDEX" | head -1
    fi
}

get_archive_path() {
    local archive_id="$1"
    local archive_info=$(find_archive "$archive_id")
    if [ -n "$archive_info" ]; then
        # Extract recovery path (last column)
        echo "$archive_info" | awk -F'|' '{print $NF}' | sed 's/^ *//;s/ *$//'
    fi
}

verify_archive() {
    local archive_path="$1"
    local full_path="$ARCHIVE_DIR/$archive_path"
    
    if [ ! -f "$full_path" ]; then
        echo -e "${RED}Archive file not found: $full_path${NC}"
        return 1
    fi
    
    # Check if archive has required metadata
    if ! grep -q "## Archive Metadata" "$full_path"; then
        echo -e "${RED}Invalid archive format: Missing metadata section${NC}"
        return 1
    fi
    
    echo -e "${GREEN}Archive verified: $archive_path${NC}"
    return 0
}

create_backup() {
    local file_path="$1"
    if [ -f "$file_path" ]; then
        local backup_path="${file_path}.backup.$(date +%Y%m%d-%H%M%S)"
        cp "$file_path" "$backup_path"
        echo -e "${GREEN}Backup created: $backup_path${NC}"
    fi
}

restore_full() {
    local archive_path="$1"
    local target_file="$2"
    local full_archive_path="$ARCHIVE_DIR/$archive_path"
    
    echo -e "${YELLOW}Performing full restoration...${NC}"
    
    # Extract original content (everything after "# ORIGINAL CONTENT BELOW")
    sed -n '/^# ORIGINAL CONTENT BELOW/,$p' "$full_archive_path" | tail -n +2 > "$target_file"
    
    echo -e "${GREEN}Full restoration completed: $target_file${NC}"
}

extract_context() {
    local archive_path="$1"
    local full_archive_path="$ARCHIVE_DIR/$archive_path"
    
    echo -e "${YELLOW}Extracting context from archive...${NC}"
    echo ""
    
    # Display archive metadata
    echo -e "${GREEN}Archive Metadata:${NC}"
    sed -n '/^## Archive Metadata/,/^---$/p' "$full_archive_path" | head -n -1
    echo ""
    
    # Display context preservation
    echo -e "${GREEN}Context Preservation:${NC}"
    sed -n '/^## Context Preservation/,/^## /p' "$full_archive_path" | head -n -1
    echo ""
    
    echo -e "${GREEN}Context extraction completed${NC}"
}

merge_content() {
    local archive_path="$1"
    local target_file="$2"
    local full_archive_path="$ARCHIVE_DIR/$archive_path"
    
    echo -e "${YELLOW}Merging archived content with current file...${NC}"
    echo -e "${RED}Note: Merge functionality requires manual review${NC}"
    
    # Create temporary files for comparison
    local temp_archive=$(mktemp)
    local temp_current=$(mktemp)
    
    # Extract original content from archive
    sed -n '/^# ORIGINAL CONTENT BELOW/,$p' "$full_archive_path" | tail -n +2 > "$temp_archive"
    cp "$target_file" "$temp_current"
    
    echo ""
    echo -e "${GREEN}Archive content saved to: $temp_archive${NC}"
    echo -e "${GREEN}Current content saved to: $temp_current${NC}"
    echo ""
    echo "Use diff tool to compare:"
    echo "  diff -u $temp_current $temp_archive"
    echo ""
    echo "Or use a visual diff tool:"
    echo "  code --diff $temp_current $temp_archive"
}

main() {
    local archive_id=""
    local action="context"
    local create_backup_flag=false
    local verify_flag=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                print_usage
                exit 0
                ;;
            -l|--list)
                list_archives
                exit 0
                ;;
            -f|--full)
                action="full"
                shift
                ;;
            -m|--merge)
                action="merge"
                shift
                ;;
            -c|--context)
                action="context"
                shift
                ;;
            -b|--backup)
                create_backup_flag=true
                shift
                ;;
            -v|--verify)
                verify_flag=true
                shift
                ;;
            -*)
                echo -e "${RED}Unknown option: $1${NC}"
                print_usage
                exit 1
                ;;
            *)
                if [ -z "$archive_id" ]; then
                    archive_id="$1"
                else
                    echo -e "${RED}Multiple archive IDs specified${NC}"
                    print_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Validate archive ID
    if [ -z "$archive_id" ]; then
        echo -e "${RED}Archive ID required${NC}"
        print_usage
        exit 1
    fi
    
    # Find archive
    local archive_path=$(get_archive_path "$archive_id")
    if [ -z "$archive_path" ]; then
        echo -e "${RED}Archive not found: $archive_id${NC}"
        echo "Use -l to list available archives"
        exit 1
    fi
    
    # Verify archive if requested
    if [ "$verify_flag" = true ]; then
        verify_archive "$archive_path" || exit 1
    fi
    
    # Determine target file from archive path
    local target_file=""
    if [[ "$archive_path" == *"workflow_state"* ]]; then
        target_file="$PROJECT_ROOT/workflow_state.md"
    elif [[ "$archive_path" == *"project_settings"* ]]; then
        target_file="$PROJECT_ROOT/project-settings.md"
    else
        echo -e "${RED}Cannot determine target file from archive path${NC}"
        exit 1
    fi
    
    # Create backup if requested
    if [ "$create_backup_flag" = true ]; then
        create_backup "$target_file"
    fi
    
    # Perform requested action
    case "$action" in
        full)
            restore_full "$archive_path" "$target_file"
            ;;
        merge)
            merge_content "$archive_path" "$target_file"
            ;;
        context)
            extract_context "$archive_path"
            ;;
        *)
            echo -e "${RED}Unknown action: $action${NC}"
            exit 1
            ;;
    esac
}

main "$@" 