# Tool Chain User Input Example

This example demonstrates how to capture user input during a tool chain without breaking the execution flow, with support for different modes and semantic timeout handling.

## Mode Configuration

### Always-Ask Mode (Default)
```yaml
# In .cursorrules:
- **Default Mode**: always-ask
```

### Insanity Mode (Auto-commit everything)
```yaml
# In .cursorrules:
- **Default Mode**: insanity
```

Simply edit the **Default Mode** line in `.cursorrules` to switch between modes.

## Example Tool Chain Flow (Always-Ask Mode)

Here's how the AI would execute a complete phase with user input, using all available tool calls:

### Tool Chain Execution:

1. **Tool 1**: `read_file` - Read project-settings.md for context
2. **Tool 2**: `read_file` - Read workflow_state.md for current state  
3. **Tool 3**: `read_file` - Read .cursorrules for mode and defaults
4. **Tool 4**: `edit_file` - Create initial component file
5. **Tool 5**: `edit_file` - Add component logic
6. **Tool 6**: `edit_file` - Add component tests
7. **Tool 7**: `run_terminal_cmd` - Run tests to verify functionality
8. **Tool 8**: `edit_file` - Fix any test failures
9. **Tool 9**: `run_terminal_cmd` - Run tests again
10. **Tool 10**: `edit_file` - Update documentation

**-- NEED USER INPUT: Should we commit this phase? --**

11. **Tool 11**: `run_terminal_cmd` - Execute: `.cursor/tools/user-input-capture/user-input-capture.sh "Phase 3: Component Implementation completed. Ready to commit? (approve/reject)" 300 "approve" "Continue"`
12. **Tool 12**: `read_file` - Read user response from `.cursor/user_response.txt`

**-- PROCESS RESPONSE AND CONTINUE --**

13. **Tool 13**: `run_terminal_cmd` - Create git commit (if approved)
14. **Tool 14**: `edit_file` - Update project-settings.md with GitSHA
15. **Tool 15**: `edit_file` - Update workflow_state.md with phase completion
16. **Tool 16**: `read_file` - Check if archiving needed
17. **Tool 17**: `edit_file` - Start next phase planning
18. **Tool 18**: `edit_file` - Create task breakdown for next phase
19. **Tool 19**: `edit_file` - Update workflow logs
20. **Tool 20**: `run_terminal_cmd` - Setup next phase environment
21. **Tool 21**: `edit_file` - Create initial files for next phase
22. **Tool 22**: `edit_file` - Add boilerplate code
23. **Tool 23**: `run_terminal_cmd` - Install dependencies if needed
24. **Tool 24**: `edit_file` - Update documentation
25. **Tool 25**: `edit_file` - Update workflow_state.md with final progress

## Example Tool Chain Flow (Insanity Mode)

In insanity mode, the AI skips user input for commits:

1. **Tool 1-10**: Same phase work as above
2. **Tool 11**: `read_file` - Check .cursorrules mode (insanity_mode detected)
3. **Tool 12**: `run_terminal_cmd` - Auto-commit with descriptive message
4. **Tool 13**: `edit_file` - Update project-settings.md with GitSHA
5. **Tool 14**: `edit_file` - Update workflow_state.md with phase completion
6. **Tool 15-25**: Continue with next phase work immediately

## Semantic Timeout Handling

### User Sees This in Terminal:
```
============================================
         USER INPUT REQUIRED
============================================

Prompt: Phase 3 completed. Ready to commit?

Default response (timeout 300s): approve
Timeout action: Continue

Please provide your response:
```

### Timeout Scenarios:

#### Continue Action (Default)
```bash
# After 300 seconds timeout:
Timeout reached (300s)
Applying default and continuing workflow: approve
Workflow will continue automatically
```

#### Wait Action
```bash
# After timeout with Wait action:
Timeout reached (600s)
Workflow paused - waiting for user response
Please edit the response file manually: .cursor/user_response.txt
```

### Semantic Response Processing:
```bash
# AI reads response and handles:
case "$response" in
    "approve"|"yes")
        # Continue with commit
        ;;
    "reject"|"no")
        # Skip commit, continue to next phase
        ;;
    "timeout_continue")
        # Apply default action from .cursorrules
        ;;
    "timeout_wait")
        # Create deferred interaction, pause workflow
        ;;
esac
```

## Configuration Examples

### Interaction Defaults in .cursorrules:
```yaml
commit_approval:
  timeout: 300
  default: approve
  timeout_action: Continue
  
plan_approval:
  timeout: 600
  default: reject
  timeout_action: Wait

choice_selection:
  timeout: 180
  default: first_option
  timeout_action: Continue
```

### Advanced Tool Chain with Multiple Inputs:
```bash
# Tool 10: Get commit approval
run_terminal_cmd: .cursor/tools/user-input-capture/user-input-capture.sh "Commit Phase 3?" 300 "approve" "Continue"

# Tool 11: Read commit response
read_file: .cursor/user_response.txt

# Tool 12: Execute commit if approved
run_terminal_cmd: git commit -m "Phase 3: Component Implementation"

# Tool 15: Get next phase direction
run_terminal_cmd: .cursor/tools/user-input-capture/user-input-capture.sh "Next: API or Database? (api/db)" 180 "api" "Continue"

# Tool 16: Read direction response  
read_file: .cursor/user_response.txt

# Tool 17-25: Start appropriate phase based on response
```

## Key Benefits:

✅ **All 25 tool calls used effectively**
✅ **No workflow interruption** - tool chain continues seamlessly
✅ **User input captured** without breaking execution
✅ **Multiple phases progressed** in single execution
✅ **Semantic timeout handling** - Continue or Wait based on context
✅ **Mode flexibility** - Prompt or auto-commit based on preference
✅ **Complete context preservation** throughout

## Mode Comparison:

### ❌ Traditional Approach:
- Tool 1-10: Work → STOP → Wait for user → New tool chain starts

### ✅ Prompt Mode:
- Tool 1-10: Work → Tool 11: Get input → Tool 12: Read response → Tool 13-25: Continue

### 🚀 Insanity Mode:
- Tool 1-10: Work → Tool 11: Auto-commit → Tool 12-25: Continue to next phase

This approach ensures maximum efficiency by using all available tool calls while providing flexible control over user interaction needs. 