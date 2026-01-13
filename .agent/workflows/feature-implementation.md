---
description: Standard workflow for implementing new features in PathGenie
---

# Feature Implementation Workflow

## Pre-Implementation (MANDATORY)

// turbo-all
1. Read the project overview:
   ```
   cat .agent/architecture/PROJECT_OVERVIEW.md
   ```

2. Identify affected components and read relevant architecture docs:
   - Client: `.agent/architecture/CLIENT.md`
   - Server: `.agent/architecture/SERVER.md`
   - Resume Agent: `.agent/architecture/RESUME_AGENT.md`

3. Read development rules:
   ```
   cat .agent/RULES.md
   ```

## Planning

4. Create a feature plan answering:
   - What components are affected?
   - What new files need to be created?
   - What existing files need modification?
   - What API endpoints are needed?
   - How does authentication work for this feature?

## Implementation

5. **Backend First** (if applicable):
   - Create model in `server/models/`
   - Create controller in `server/controllers/`
   - Create route in `server/routes/`
   - Register route in `server/routes/protectedRoutes.js`

6. **Frontend Second**:
   - Create API module in `client/src/api/`
   - Create components in `client/src/components/`
   - Create page in `client/src/Pages/`
   - Add route in `client/src/App.jsx`

7. **Resume Agent** (if AI feature):
   - Create tool in `resume_agent_service/app/tools/`
   - Export tool in `resume_agent_service/app/tools/__init__.py`
   - Bind tool in `resume_agent_service/app/graph/builder.py`

## Testing

8. Test the feature manually:
   - Start all services
   - Navigate to the feature
   - Test happy path and error cases

## Documentation

9. Update architecture docs if patterns changed:
   - `.agent/architecture/` relevant files
   - `README.md` if user-facing

## Commit

10. Commit with conventional commit message:
    ```
    git add .
    git commit -m "feat(component): description of feature"
    ```
