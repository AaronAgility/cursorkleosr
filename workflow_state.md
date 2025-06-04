# workflow_state.md
_Last updated: 2025-01-16_

## State
Phase: INIT  
Status: READY  
CurrentPhase: 0
CurrentTask: null  
CurrentSubTask: null
LastRevisionPhase: 0
TotalPhases: 0

## Current Work
<!-- Active phase/task/subtask context -->
**Phase:** N/A  
**Task:** N/A  
**SubTask:** N/A  

## Plan
<!-- The AI fills this in during the BLUEPRINT phase -->

## Rules
> **Keep every major section under an explicit H2 (`##`) heading so the agent can locate them unambiguously.**

### [PHASE: ANALYZE]
1. Read **project-settings.md**, relevant code & docs.  
2. Break down the work into logical **Phases** (major milestones).
3. For current phase, identify **Tasks** (implementation units).
4. For current task, identify **SubTasks** (atomic actions).
5. Summarize requirements. *No code or planning.*

### [PHASE: BLUEPRINT]
1. Create detailed phase/task/subtask hierarchy.
2. Write step-by-step implementation plan under **## Plan**.
3. Estimate complexity and identify dependencies.
4. Set `Status = NEEDS_PLAN_APPROVAL` and await user confirmation.

### [PHASE: CONSTRUCT]
1. Follow the approved **## Plan** exactly.
2. Process SubTasks sequentially within each Task.
3. After each SubTask completion:
   - run test / linter commands specified in `project-settings.md`
   - capture tool output in **## Log**
   - update progress in **## Current Work**
4. On Task completion, update Task status.
5. On Phase completion, trigger **RULE_PHASE_COMPLETE**.

### [PHASE: VALIDATE]
1. Rerun full test suite & any E2E checks for completed phase.
2. Review phase deliverables against original requirements.
3. If validation passes, set `Status = PHASE_READY_FOR_COMMIT`.
4. Trigger **RULE_COMMIT_PHASE** workflow.

### [PHASE: CODE_REVISION]
1. Review last 3-5 phases for code quality issues.
2. Identify opportunities for refactoring and optimization.
3. Check for security vulnerabilities and code duplication.
4. Create revision plan focusing on maintainability.
5. Execute improvements following standard workflow phases.

---

### RULE_INIT_01
Trigger ▶ `Phase == INIT`  
Action ▶ Ask user for project overview → Set up initial phase structure → `Phase = ANALYZE, Status = RUNNING`.

### RULE_PHASE_COMPLETE
Trigger ▶ `Status == COMPLETED && CurrentPhase work finished`  
Action ▶  
1. Update `TotalPhases = TotalPhases + 1`.
2. Set `Status = PHASE_READY_FOR_COMMIT`.
3. Trigger **RULE_COMMIT_PHASE**.

### RULE_COMMIT_PHASE
Trigger ▶ `Status == PHASE_READY_FOR_COMMIT`  
Action ▶  
1. Prompt user: "Phase {CurrentPhase} completed. Ready to commit? Review changes and approve."
2. If approved:
   - Create commit with message: "Phase {CurrentPhase}: {phase_description}"
   - Get GitSHA and store in **## Phase History** 
   - Update `project-settings.md` Phase History table
3. Check if code revision needed via **RULE_CODE_REVISION_CHECK**.

### RULE_CODE_REVISION_CHECK
Trigger ▶ After successful phase commit  
Action ▶  
1. Calculate: `phases_since_revision = TotalPhases - LastRevisionPhase`.
2. If `phases_since_revision >= 3` AND complexity warrants revision:
   - Set `Phase = CODE_REVISION, Status = READY`
   - Update `LastRevisionPhase = TotalPhases`
3. Otherwise, continue to next phase.

### RULE_TASK_ITERATION
Trigger ▶ `CurrentTask completed && more tasks in current phase`  
Action ▶  
1. Set `CurrentTask` to next task in phase.
2. Set `CurrentSubTask = null`.
3. Clear **## Log** for new task context.
4. Reset `Phase = ANALYZE, Status = READY` for new task.

### RULE_LOG_ROTATE_01
Trigger ▶ `length(## Log) > 5 000 chars`  
Action ▶ Summarise the top 5 findings from **## Log** into **## ArchiveLog**, then clear **## Log**.

### RULE_SUMMARY_01
Trigger ▶ `Phase == VALIDATE && Status == COMPLETED`  
Action ▶ 
1. Read `project-settings.md`.
2. Construct the new changelog line: `- Phase {CurrentPhase}: <One-sentence summary of completed work>`.
3. Find the `## Changelog` heading in `project-settings.md`.
4. Insert the new changelog line immediately after the `## Changelog` heading.

---

## Phase Structure
<!-- Current project phase breakdown -->
| Phase | Description | Status | Tasks | GitSHA |
|-------|-------------|--------|-------|--------|

## Tasks
<!-- Current phase task breakdown -->
| Task | Description | Status | SubTasks | Estimated Effort |
|------|-------------|--------|----------|------------------|

## SubTasks  
<!-- Current task subtask breakdown -->
| SubTask | Description | Status | Owner | Completion Date |
|---------|-------------|--------|-------|----------------|

## Log
<!-- AI appends detailed reasoning, tool output, and errors here -->

## ArchiveLog
<!-- RULE_LOG_ROTATE_01 stores condensed summaries here -->
