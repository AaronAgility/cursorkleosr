# project-settings.md
Last-Updated: 2025-01-16

## Project Goal
Describe the primary objective of your project in 1-2 sentences.

## Tech Stack
- **Language(s):** e.g. TypeScript 5, Python 3.12
- **Framework(s):** e.g. Next.js 14, FastAPI 0.111
- **Build / Tooling:** esbuild, Poetry, Docker, etc.

## Critical Patterns & Conventions
List coding standards, architectural patterns, naming conventions, and style guides that must be followed.

## Constraints
- Performance / latency budgets  
- Security or compliance requirements  
- External APIs with rate limits or cost ceilings  

## Git Workflow Settings
- **Default Branch:** main
- **Feature Branch Prefix:** feature/
- **Phase Commit Pattern:** "Phase {phase_number}: {description}"
- **Code Revision Frequency:** Every 3-5 phases

## Tokenization Settings
- Estimated chars-per-token: 3.5  
- Max tokens per message: 8,000
- Plan for summary when **workflow_state.md** exceeds ~12K chars.

## Phase History
<!-- GitSHA references for semantic memory -->
| Phase | GitSHA | Description | Date |
|-------|--------|-------------|------|

---

## Changelog
<!-- The agent prepends the latest summary here as a new list item after each phase completion --> 